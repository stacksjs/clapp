const std = @import("std");
const style = @import("../style.zig");

/// Number input options
pub const NumberOptions = struct {
    message: []const u8,
    min: ?f64 = null,
    max: ?f64 = null,
    default_value: ?f64 = null,
    integer_only: bool = false,
};

/// Number input prompt with validation
pub fn number(allocator: std.mem.Allocator, options: NumberOptions) !f64 {
    const stdin = std.io.getStdIn().reader();
    const stdout = std.io.getStdOut().writer();

    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);
    try stdout.print("{s}", .{prompt_text});

    // Show constraints
    if (options.min != null or options.max != null) {
        var constraints: std.ArrayList(u8) = .{};
        defer constraints.deinit();

        const writer = constraints.writer();
        try writer.writeAll(" (");

        if (options.min) |min_val| {
            try writer.print("min: {d}", .{min_val});
            if (options.max != null) try writer.writeAll(", ");
        }

        if (options.max) |max_val| {
            try writer.print("max: {d}", .{max_val});
        }

        try writer.writeAll(")");

        const constraints_text = try style.dim(allocator, constraints.items);
        defer allocator.free(constraints_text);
        try stdout.print("{s}", .{constraints_text});
    }

    if (options.default_value) |default| {
        const default_text = try std.fmt.allocPrint(allocator, " [{d}]", .{default});
        defer allocator.free(default_text);
        const default_styled = try style.muted(allocator, default_text);
        defer allocator.free(default_styled);
        try stdout.print("{s}", .{default_styled});
    }

    try stdout.writeAll(": ");

    var buffer: [256]u8 = undefined;
    const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";
    const trimmed = std.mem.trim(u8, input, " \t\r\n");

    if (trimmed.len == 0 and options.default_value != null) {
        return options.default_value.?;
    }

    const value = if (options.integer_only)
        @as(f64, @floatFromInt(std.fmt.parseInt(i64, trimmed, 10) catch {
            const error_msg = try style.err(allocator, "Invalid integer");
            defer allocator.free(error_msg);
            try stdout.print("{s}\n", .{error_msg});
            return number(allocator, options);
        }))
    else
        std.fmt.parseFloat(f64, trimmed) catch {
            const error_msg = try style.err(allocator, "Invalid number");
            defer allocator.free(error_msg);
            try stdout.print("{s}\n", .{error_msg});
            return number(allocator, options);
        };

    // Validate range
    if (options.min) |min_val| {
        if (value < min_val) {
            const error_msg = try std.fmt.allocPrint(
                allocator,
                "Value must be at least {d}",
                .{min_val},
            );
            defer allocator.free(error_msg);
            const error_styled = try style.err(allocator, error_msg);
            defer allocator.free(error_styled);
            try stdout.print("{s}\n", .{error_styled});
            return number(allocator, options);
        }
    }

    if (options.max) |max_val| {
        if (value > max_val) {
            const error_msg = try std.fmt.allocPrint(
                allocator,
                "Value must be at most {d}",
                .{max_val},
            );
            defer allocator.free(error_msg);
            const error_styled = try style.err(allocator, error_msg);
            defer allocator.free(error_styled);
            try stdout.print("{s}\n", .{error_styled});
            return number(allocator, options);
        }
    }

    return value;
}

test "number validation" {
    const options = NumberOptions{
        .message = "Enter number:",
        .min = 0,
        .max = 100,
        .integer_only = true,
    };

    try std.testing.expect(options.min.? == 0);
    try std.testing.expect(options.max.? == 100);
}
