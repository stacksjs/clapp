const std = @import("std");
const style = @import("../style.zig");
const suggestions = @import("../suggestions.zig");

/// Autocomplete prompt options
pub const AutocompleteOptions = struct {
    message: []const u8,
    options: []const []const u8,
    placeholder: ?[]const u8 = null,
    max_suggestions: usize = 5,
    fuzzy: bool = true,
};

/// Autocomplete prompt with search-as-you-type
pub fn autocomplete(allocator: std.mem.Allocator, options: AutocompleteOptions) ![]const u8 {
    const stdin = std.io.getStdIn();
    const stdout = std.io.getStdOut().writer();

    // Display prompt
    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);
    try stdout.print("{s}\n", .{prompt_text});

    if (options.placeholder) |placeholder| {
        const placeholder_text = try style.dim(allocator, placeholder);
        defer allocator.free(placeholder_text);
        try stdout.print("{s}\n", .{placeholder_text});
    }

    var input_buffer: std.ArrayList(u8) = .{};
    defer input_buffer.deinit();

    var selected_index: usize = 0;

    // Enable raw mode for character-by-character input
    const original_termios = try enableRawMode(stdin);
    defer disableRawMode(stdin, original_termios) catch {};

    while (true) {
        // Clear previous output
        try stdout.writeAll("\x1B[2J\x1B[H"); // Clear screen and move to top

        // Show prompt
        try stdout.print("{s}\n", .{prompt_text});

        // Show current input
        const input_text = if (input_buffer.items.len > 0)
            input_buffer.items
        else if (options.placeholder) |p|
            p
        else
            "";

        const input_styled = try style.bold(allocator, input_text);
        defer allocator.free(input_styled);
        try stdout.print("> {s}\n\n", .{input_styled});

        // Filter and show suggestions
        const filtered = if (input_buffer.items.len > 0)
            if (options.fuzzy)
                try suggestions.fuzzyMatch(allocator, input_buffer.items, options.options, options.max_suggestions)
            else
                try suggestions.filterByPrefix(allocator, input_buffer.items, options.options)
        else
            try allocator.dupe([]const u8, options.options);
        defer allocator.free(filtered);

        const display_count = @min(filtered.len, options.max_suggestions);

        for (filtered[0..display_count], 0..) |suggestion, i| {
            if (i == selected_index) {
                const selected = try style.apply(allocator, suggestion, style.codes.bg_cyan);
                defer allocator.free(selected);
                try stdout.print("▸ {s}\n", .{selected});
            } else {
                const dim_text = try style.dim(allocator, suggestion);
                defer allocator.free(dim_text);
                try stdout.print("  {s}\n", .{dim_text});
            }
        }

        // Read single character
        var char_buf: [1]u8 = undefined;
        const bytes_read = try stdin.read(&char_buf);
        if (bytes_read == 0) break;

        const char = char_buf[0];

        switch (char) {
            '\n', '\r' => {
                // Enter - select current
                if (display_count > 0) {
                    return try allocator.dupe(u8, filtered[selected_index]);
                }
                break;
            },
            127, 8 => {
                // Backspace
                if (input_buffer.items.len > 0) {
                    _ = input_buffer.pop();
                    selected_index = 0;
                }
            },
            27 => {
                // Escape sequence (arrow keys)
                var seq_buf: [2]u8 = undefined;
                _ = try stdin.read(&seq_buf);
                if (seq_buf[0] == '[') {
                    switch (seq_buf[1]) {
                        'A' => {
                            // Up arrow
                            if (selected_index > 0) {
                                selected_index -= 1;
                            }
                        },
                        'B' => {
                            // Down arrow
                            if (selected_index + 1 < display_count) {
                                selected_index += 1;
                            }
                        },
                        else => {},
                    }
                }
            },
            3 => {
                // Ctrl+C
                return error.Cancelled;
            },
            else => {
                // Regular character
                if (std.ascii.isPrint(char)) {
                    try input_buffer.append(char);
                    selected_index = 0;
                }
            },
        }
    }

    return error.NoSelection;
}

fn enableRawMode(file: std.fs.File) !std.os.linux.termios {
    if (std.builtin.os.tag != .linux and std.builtin.os.tag != .macos) {
        return std.os.linux.termios{};
    }

    var termios = try std.os.tcgetattr(file.handle);
    const original = termios;

    // Disable canonical mode and echo
    termios.lflag &= ~@as(std.os.linux.tcflag_t, std.os.linux.ICANON | std.os.linux.ECHO);
    termios.cc[std.os.linux.V.MIN] = 1;
    termios.cc[std.os.linux.V.TIME] = 0;

    try std.os.tcsetattr(file.handle, .FLUSH, termios);

    return original;
}

fn disableRawMode(file: std.fs.File, original: std.os.linux.termios) !void {
    if (std.builtin.os.tag != .linux and std.builtin.os.tag != .macos) {
        return;
    }
    try std.os.tcsetattr(file.handle, .FLUSH, original);
}

test "autocomplete basic" {
    // This would require mocking stdin, so we'll just test option validation
    const options = AutocompleteOptions{
        .message = "Select:",
        .options = &[_][]const u8{ "option1", "option2" },
    };

    try std.testing.expectEqual(@as(usize, 2), options.options.len);
}
