const std = @import("std");
const style = @import("../style.zig");
const state_mod = @import("../state.zig");
const terminal = @import("../terminal.zig");
const prompts = @import("../prompts.zig");

/// Group prompt result
pub const GroupResult = struct {
    allocator: std.mem.Allocator,
    values: std.StringHashMap([]const u8),
    cancelled: bool = false,

    pub fn init(allocator: std.mem.Allocator) GroupResult {
        return GroupResult{
            .allocator = allocator,
            .values = std.StringHashMap([]const u8).init(allocator),
        };
    }

    pub fn deinit(self: *GroupResult) void {
        var iter = self.values.iterator();
        while (iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.values.deinit();
    }

    pub fn set(self: *GroupResult, key: []const u8, value: []const u8) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        const value_copy = try self.allocator.dupe(u8, value);
        try self.values.put(key_copy, value_copy);
    }

    pub fn get(self: *const GroupResult, key: []const u8) ?[]const u8 {
        return self.values.get(key);
    }
};

/// Group prompt - collect multiple prompt results
pub fn group(allocator: std.mem.Allocator, prompt_names: []const []const u8) !GroupResult {
    var result = GroupResult.init(allocator);
    errdefer result.deinit();

    for (prompt_names) |name| {
        const value = prompts.text(allocator, .{
            .message = name,
        }) catch |err| {
            if (err == error.Cancelled) {
                result.cancelled = true;
                return result;
            }
            return err;
        };

        try result.set(name, value);
        allocator.free(value);
    }

    return result;
}

/// Select key option
pub const SelectKeyOption = struct {
    key: []const u8,
    label: []const u8,
    value: []const u8,
};

/// Select key prompt options
pub const SelectKeyOptions = struct {
    message: []const u8,
    options: []const SelectKeyOption,
};

/// Select key prompt - selection with keyboard shortcuts
pub fn selectKey(allocator: std.mem.Allocator, options: SelectKeyOptions) ![]const u8 {
    const stdout = std.io.getStdOut().writer();
    const stdin = std.io.getStdIn();

    // Display message
    const message_bold = try style.bold(allocator, options.message);
    defer allocator.free(message_bold);
    try stdout.print("{s}\n\n", .{message_bold});

    // Display options with keys
    for (options.options) |option| {
        const key_styled = try style.cyan(allocator, option.key);
        defer allocator.free(key_styled);

        const arrow = if (terminal.isUnicodeSupported()) "→" else "->";
        const arrow_dim = try style.dim(allocator, arrow);
        defer allocator.free(arrow_dim);

        try stdout.print("  [{s}] {s} {s}\n", .{ key_styled, arrow_dim, option.label });
    }

    try stdout.print("\nPress key: ", .{});

    // Read single character
    var raw_mode = terminal.RawMode{};
    try raw_mode.enable();
    defer raw_mode.disable() catch {};

    var buf: [1]u8 = undefined;
    const bytes_read = try stdin.read(&buf);

    if (bytes_read == 0) {
        return error.EndOfStream;
    }

    // Find matching option
    for (options.options) |option| {
        if (std.mem.eql(u8, option.key, buf[0..bytes_read])) {
            try stdout.print("{s}\n\n", .{option.key});
            return try allocator.dupe(u8, option.value);
        }
    }

    return error.InvalidKey;
}

/// Stream output type
pub const StreamType = enum {
    info,
    success,
    warn,
    @"error",
    step,
};

/// Stream prompt - handle iterables with formatted output
pub fn stream(allocator: std.mem.Allocator, items: []const []const u8, stream_type: StreamType) !void {
    const stdout = std.io.getStdOut().writer();

    const symbol = switch (stream_type) {
        .info => if (terminal.isUnicodeSupported()) "ℹ" else "i",
        .success => if (terminal.isUnicodeSupported()) "✔" else "√",
        .warn => if (terminal.isUnicodeSupported()) "⚠" else "!",
        .@"error" => if (terminal.isUnicodeSupported()) "✖" else "x",
        .step => if (terminal.isUnicodeSupported()) "→" else ">",
    };

    const color = switch (stream_type) {
        .info => style.codes.blue,
        .success => style.codes.green,
        .warn => style.codes.yellow,
        .@"error" => style.codes.red,
        .step => style.codes.cyan,
    };

    const styled_symbol = try style.apply(allocator, symbol, color);
    defer allocator.free(styled_symbol);

    for (items) |item| {
        try stdout.print("{s} {s}\n", .{ styled_symbol, item });
        std.time.sleep(100 * std.time.ns_per_ms); // Small delay for visual effect
    }
}

test "group prompt result" {
    const allocator = std.testing.allocator;

    var result = GroupResult.init(allocator);
    defer result.deinit();

    try result.set("name", "John");
    try result.set("age", "30");

    try std.testing.expectEqualStrings("John", result.get("name").?);
    try std.testing.expectEqualStrings("30", result.get("age").?);
}

test "stream" {
    const allocator = std.testing.allocator;

    const items = [_][]const u8{ "Item 1", "Item 2", "Item 3" };
    try stream(allocator, &items, .info);
}
