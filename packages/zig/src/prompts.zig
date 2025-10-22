const std = @import("std");
const style = @import("style.zig");

/// Text prompt options
pub const TextOptions = struct {
    message: []const u8,
    placeholder: ?[]const u8 = null,
    default_value: ?[]const u8 = null,
    validate: ?*const fn ([]const u8) bool = null,
};

/// Confirm prompt options
pub const ConfirmOptions = struct {
    message: []const u8,
    default_value: bool = false,
};

/// Select option
pub const SelectOption = struct {
    value: []const u8,
    label: []const u8,
    hint: ?[]const u8 = null,
};

/// Select prompt options
pub const SelectOptions = struct {
    message: []const u8,
    options: []const SelectOption,
};

/// Multi-select prompt options
pub const MultiSelectOptions = struct {
    message: []const u8,
    options: []const SelectOption,
    required: bool = true,
};

/// Password prompt options
pub const PasswordOptions = struct {
    message: []const u8,
    mask: u8 = '*',
};

/// Text input prompt
pub fn text(allocator: std.mem.Allocator, options: TextOptions) ![]const u8 {
    const stdin = std.io.getStdIn().reader();
    const stdout = std.io.getStdOut().writer();

    // Display prompt message
    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);
    try stdout.print("{s} ", .{prompt_text});

    // Display placeholder if provided
    if (options.placeholder) |placeholder| {
        const placeholder_text = try style.dim(allocator, placeholder);
        defer allocator.free(placeholder_text);
        try stdout.print("{s} ", .{placeholder_text});
    }

    // Display default if provided
    if (options.default_value) |default| {
        const default_text = try style.muted(allocator, default);
        defer allocator.free(default_text);
        try stdout.print("({s}) ", .{default_text});
    }

    try stdout.writeAll(": ");

    // Read input
    var buffer: [1024]u8 = undefined;
    const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";
    const trimmed = std.mem.trim(u8, input, " \t\r\n");

    // Use default if no input provided
    const value = if (trimmed.len == 0 and options.default_value != null)
        options.default_value.?
    else
        trimmed;

    // Validate if validator provided
    if (options.validate) |validator| {
        if (!validator(value)) {
            const error_text = try style.err(allocator, "Invalid input");
            defer allocator.free(error_text);
            try stdout.print("{s}\n", .{error_text});
            return text(allocator, options);
        }
    }

    return try allocator.dupe(u8, value);
}

/// Confirm (yes/no) prompt
pub fn confirm(allocator: std.mem.Allocator, options: ConfirmOptions) !bool {
    const stdin = std.io.getStdIn().reader();
    const stdout = std.io.getStdOut().writer();

    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);

    const default_hint = if (options.default_value) "Y/n" else "y/N";
    const hint_text = try style.dim(allocator, default_hint);
    defer allocator.free(hint_text);

    try stdout.print("{s} {s}: ", .{ prompt_text, hint_text });

    var buffer: [16]u8 = undefined;
    const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";
    const trimmed = std.mem.trim(u8, input, " \t\r\n");

    if (trimmed.len == 0) {
        return options.default_value;
    }

    const lower = std.ascii.toLower(trimmed[0]);
    return lower == 'y';
}

/// Select prompt (single choice)
pub fn select(allocator: std.mem.Allocator, options: SelectOptions) ![]const u8 {
    const stdin = std.io.getStdIn().reader();
    const stdout = std.io.getStdOut().writer();

    // Display message
    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);
    try stdout.print("{s}\n", .{prompt_text});

    // Display options
    for (options.options, 0..) |option, i| {
        const num_text = try std.fmt.allocPrint(allocator, "{d}", .{i + 1});
        defer allocator.free(num_text);
        const num_styled = try style.green(allocator, num_text);
        defer allocator.free(num_styled);

        try stdout.print("  {s}. {s}", .{ num_styled, option.label });

        if (option.hint) |hint| {
            const hint_styled = try style.dim(allocator, hint);
            defer allocator.free(hint_styled);
            try stdout.print(" ({s})", .{hint_styled});
        }
        try stdout.writeAll("\n");
    }

    // Get selection
    const select_text = try style.muted(allocator, "Select an option");
    defer allocator.free(select_text);
    try stdout.print("\n{s}: ", .{select_text});

    var buffer: [16]u8 = undefined;
    const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";
    const trimmed = std.mem.trim(u8, input, " \t\r\n");

    const index = std.fmt.parseInt(usize, trimmed, 10) catch {
        const error_text = try style.err(allocator, "Invalid selection");
        defer allocator.free(error_text);
        try stdout.print("{s}\n", .{error_text});
        return select(allocator, options);
    };

    if (index == 0 or index > options.options.len) {
        const error_text = try style.err(allocator, "Selection out of range");
        defer allocator.free(error_text);
        try stdout.print("{s}\n", .{error_text});
        return select(allocator, options);
    }

    return try allocator.dupe(u8, options.options[index - 1].value);
}

/// Multi-select prompt (multiple choices)
pub fn multiSelect(allocator: std.mem.Allocator, options: MultiSelectOptions) ![][]const u8 {
    const stdin = std.io.getStdIn().reader();
    const stdout = std.io.getStdOut().writer();

    // Display message
    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);
    try stdout.print("{s}\n", .{prompt_text});

    const instruction = try style.dim(allocator, "Enter numbers separated by spaces (e.g., 1 3 4)");
    defer allocator.free(instruction);
    try stdout.print("{s}\n\n", .{instruction});

    // Display options
    for (options.options, 0..) |option, i| {
        const num_text = try std.fmt.allocPrint(allocator, "{d}", .{i + 1});
        defer allocator.free(num_text);
        const num_styled = try style.green(allocator, num_text);
        defer allocator.free(num_styled);

        try stdout.print("  {s}. {s}", .{ num_styled, option.label });

        if (option.hint) |hint| {
            const hint_styled = try style.dim(allocator, hint);
            defer allocator.free(hint_styled);
            try stdout.print(" ({s})", .{hint_styled});
        }
        try stdout.writeAll("\n");
    }

    // Get selections
    const select_text = try style.muted(allocator, "Select options");
    defer allocator.free(select_text);
    try stdout.print("\n{s}: ", .{select_text});

    var buffer: [256]u8 = undefined;
    const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";
    const trimmed = std.mem.trim(u8, input, " \t\r\n");

    if (trimmed.len == 0 and options.required) {
        const error_text = try style.err(allocator, "At least one option must be selected");
        defer allocator.free(error_text);
        try stdout.print("{s}\n", .{error_text});
        return multiSelect(allocator, options);
    }

    var result: std.ArrayList([]const u8) = .{};
    errdefer result.deinit(allocator);

    var iter = std.mem.splitSequence(u8, trimmed, " ");
    while (iter.next()) |num_str| {
        if (num_str.len == 0) continue;

        const index = std.fmt.parseInt(usize, num_str, 10) catch {
            const error_text = try style.err(allocator, "Invalid selection");
            defer allocator.free(error_text);
            try stdout.print("{s}\n", .{error_text});
            result.deinit();
            return multiSelect(allocator, options);
        };

        if (index == 0 or index > options.options.len) {
            const error_text = try style.err(allocator, "Selection out of range");
            defer allocator.free(error_text);
            try stdout.print("{s}\n", .{error_text});
            result.deinit();
            return multiSelect(allocator, options);
        }

        const value = try allocator.dupe(u8, options.options[index - 1].value);
        try result.append(allocator, value);
    }

    if (result.items.len == 0 and options.required) {
        const error_text = try style.err(allocator, "At least one option must be selected");
        defer allocator.free(error_text);
        try stdout.print("{s}\n", .{error_text});
        result.deinit();
        return multiSelect(allocator, options);
    }

    return try result.toOwnedSlice(allocator);
}

/// Password prompt (masked input)
pub fn password(allocator: std.mem.Allocator, options: PasswordOptions) ![]const u8 {
    const stdin = std.io.getStdIn().reader();
    const stdout = std.io.getStdOut().writer();

    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);
    try stdout.print("{s}: ", .{prompt_text});

    // Try to disable echo (platform-specific)
    if (std.builtin.os.tag != .windows) {
        _ = std.os.linux.syscall3(.ioctl, @as(usize, @intCast(stdin.context.handle)), std.os.linux.T.CSETS, @intFromPtr(&std.mem.zeroes(std.os.linux.termios)));
    }

    var buffer: [256]u8 = undefined;
    const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";
    const trimmed = std.mem.trim(u8, input, " \t\r\n");

    try stdout.writeAll("\n");

    return try allocator.dupe(u8, trimmed);
}

/// Display an intro message
pub fn intro(allocator: std.mem.Allocator, message: []const u8) !void {
    const stdout = std.io.getStdOut().writer();
    const styled = try style.bold(allocator, message);
    defer allocator.free(styled);

    try stdout.writeAll("\n");
    try stdout.print("{s}\n", .{styled});
    try stdout.writeAll("\n");
}

/// Display an outro message
pub fn outro(allocator: std.mem.Allocator, message: []const u8) !void {
    const stdout = std.io.getStdOut().writer();
    const styled = try style.success(allocator, message);
    defer allocator.free(styled);

    try stdout.writeAll("\n");
    try stdout.print("{s}\n", .{styled});
    try stdout.writeAll("\n");
}

/// Display a note
pub fn note(allocator: std.mem.Allocator, message: []const u8, title: ?[]const u8) !void {
    const stdout = std.io.getStdOut().writer();

    if (title) |t| {
        const title_styled = try style.bold(allocator, t);
        defer allocator.free(title_styled);
        try stdout.print("\n{s}:\n", .{title_styled});
    }

    const msg_styled = try style.dim(allocator, message);
    defer allocator.free(msg_styled);
    try stdout.print("  {s}\n\n", .{msg_styled});
}

/// Display a log message
pub fn log(allocator: std.mem.Allocator, message: []const u8) !void {
    const stdout = std.io.getStdOut().writer();
    const styled = try style.muted(allocator, message);
    defer allocator.free(styled);
    try stdout.print("{s}\n", .{styled});
}

test "text prompt validation" {
    // This is a basic test - actual prompt testing would require mocking stdin
    const validator = struct {
        fn validate(input: []const u8) bool {
            return input.len > 0;
        }
    }.validate;

    try std.testing.expect(validator("hello"));
    try std.testing.expect(!validator(""));
}
