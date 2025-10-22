const std = @import("std");
const style = @import("style.zig");
const terminal = @import("terminal.zig");

/// Log message options
pub const LogOptions = struct {
    symbol: ?[]const u8 = null,
    color: ?style.AnsiCode = null,
    spacing: usize = 1,
};

/// Process markdown-style italic text (_text_)
fn processMarkdown(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    var result: std.ArrayList(u8) = .{};
    errdefer result.deinit(allocator);

    var i: usize = 0;
    var in_italic = false;

    while (i < text.len) {
        if (text[i] == '_' and i + 1 < text.len and text[i + 1] != ' ') {
            // Toggle italic
            if (in_italic) {
                try result.appendSlice(allocator, style.codes.italic.close);
            } else {
                try result.appendSlice(allocator, style.codes.italic.open);
            }
            in_italic = !in_italic;
            i += 1;
        } else {
            try result.append(allocator, text[i]);
            i += 1;
        }
    }

    // Close italic if still open
    if (in_italic) {
        try result.appendSlice(allocator, style.codes.italic.close);
    }

    return result.toOwnedSlice(allocator);
}

/// Generic log message with custom symbol and color
pub fn message(allocator: std.mem.Allocator, text: []const u8, options: LogOptions) !void {
    const stdout = std.io.getStdOut().writer();

    const processed_text = try processMarkdown(allocator, text);
    defer allocator.free(processed_text);

    const symbol = options.symbol orelse "•";

    var spacing: std.ArrayList(u8) = .{};
    defer spacing.deinit();
    var i: usize = 0;
    while (i < options.spacing) : (i += 1) {
        try spacing.append(allocator, ' ');
    }

    if (options.color) |color| {
        const colored_symbol = try style.apply(allocator, symbol, color);
        defer allocator.free(colored_symbol);
        try stdout.print("{s}{s}{s}\n", .{ colored_symbol, spacing.items, processed_text });
    } else {
        try stdout.print("{s}{s}{s}\n", .{ symbol, spacing.items, processed_text });
    }
}

/// Info message (blue 'ℹ' symbol)
pub fn info(allocator: std.mem.Allocator, text: []const u8) !void {
    const symbol = if (terminal.isUnicodeSupported()) "ℹ" else "i";
    try message(allocator, text, .{
        .symbol = symbol,
        .color = style.codes.blue,
    });
}

/// Success message (green '✔' symbol)
pub fn success(allocator: std.mem.Allocator, text: []const u8) !void {
    const symbol = if (terminal.isUnicodeSupported()) "✔" else "√";
    try message(allocator, text, .{
        .symbol = symbol,
        .color = style.codes.green,
    });
}

/// Step message (green '○' symbol)
pub fn step(allocator: std.mem.Allocator, text: []const u8) !void {
    const symbol = if (terminal.isUnicodeSupported()) "○" else "o";
    try message(allocator, text, .{
        .symbol = symbol,
        .color = style.codes.green,
    });
}

/// Warning message (yellow '⚠' symbol)
pub fn warn(allocator: std.mem.Allocator, text: []const u8) !void {
    const symbol = if (terminal.isUnicodeSupported()) "⚠" else "!";
    try message(allocator, text, .{
        .symbol = symbol,
        .color = style.codes.yellow,
    });
}

/// Alias for warn
pub fn warning(allocator: std.mem.Allocator, text: []const u8) !void {
    try warn(allocator, text);
}

/// Error message (red '✖' symbol)
pub fn err(allocator: std.mem.Allocator, text: []const u8) !void {
    const symbol = if (terminal.isUnicodeSupported()) "✖" else "x";
    try message(allocator, text, .{
        .symbol = symbol,
        .color = style.codes.red,
    });
}

/// Custom message with specified symbol and color
pub fn custom(allocator: std.mem.Allocator, symbol: []const u8, color: style.AnsiCode, text: []const u8) !void {
    try message(allocator, text, .{
        .symbol = symbol,
        .color = color,
    });
}

/// Intro message with styled border
pub fn intro(allocator: std.mem.Allocator, text: []const u8) !void {
    const stdout = std.io.getStdOut().writer();

    const border_char = if (terminal.isUnicodeSupported()) "─" else "-";
    const corner_left = if (terminal.isUnicodeSupported()) "┌" else "+";
    const corner_right = if (terminal.isUnicodeSupported()) "┐" else "+";

    // Calculate terminal width
    const term_width = terminal.getColumns();
    const text_len = text.len;
    const border_len = if (text_len + 4 < term_width) text_len + 4 else term_width;

    // Create border
    var border: std.ArrayList(u8) = .{};
    defer border.deinit();

    var i: usize = 0;
    while (i < border_len - 2) : (i += 1) {
        try border.appendSlice(allocator, border_char);
    }

    const border_styled = try style.dim(allocator, border.items);
    defer allocator.free(border_styled);

    const corner_l_styled = try style.dim(allocator, corner_left);
    defer allocator.free(corner_l_styled);

    const corner_r_styled = try style.dim(allocator, corner_right);
    defer allocator.free(corner_r_styled);

    const text_bold = try style.bold(allocator, text);
    defer allocator.free(text_bold);

    try stdout.print("\n{s}{s}{s}\n", .{ corner_l_styled, border_styled, corner_r_styled });
    try stdout.print("  {s}\n", .{text_bold});
    try stdout.print("\n", .{});
}

/// Outro message with styled border
pub fn outro(allocator: std.mem.Allocator, text: []const u8) !void {
    const stdout = std.io.getStdOut().writer();

    const border_char = if (terminal.isUnicodeSupported()) "─" else "-";
    const corner_left = if (terminal.isUnicodeSupported()) "└" else "+";
    const corner_right = if (terminal.isUnicodeSupported()) "┘" else "+";

    // Calculate terminal width
    const term_width = terminal.getColumns();
    const text_len = text.len;
    const border_len = if (text_len + 4 < term_width) text_len + 4 else term_width;

    // Create border
    var border: std.ArrayList(u8) = .{};
    defer border.deinit();

    var i: usize = 0;
    while (i < border_len - 2) : (i += 1) {
        try border.appendSlice(allocator, border_char);
    }

    const border_styled = try style.dim(allocator, border.items);
    defer allocator.free(border_styled);

    const corner_l_styled = try style.dim(allocator, corner_left);
    defer allocator.free(corner_l_styled);

    const corner_r_styled = try style.dim(allocator, corner_right);
    defer allocator.free(corner_r_styled);

    const text_bold = try style.bold(allocator, text);
    defer allocator.free(text_bold);

    try stdout.print("\n", .{});
    try stdout.print("  {s}\n", .{text_bold});
    try stdout.print("{s}{s}{s}\n\n", .{ corner_l_styled, border_styled, corner_r_styled });
}

/// Cancel message
pub fn cancel(allocator: std.mem.Allocator, text: []const u8) !void {
    const stdout = std.io.getStdOut().writer();

    const symbol = if (terminal.isUnicodeSupported()) "■" else "#";
    const symbol_styled = try style.red(allocator, symbol);
    defer allocator.free(symbol_styled);

    const text_dim = try style.dim(allocator, text);
    defer allocator.free(text_dim);

    try stdout.print("{s} {s}\n", .{ symbol_styled, text_dim });
}

test "log functions" {
    const allocator = std.testing.allocator;

    // These should not error
    try info(allocator, "Info message");
    try success(allocator, "Success message");
    try step(allocator, "Step message");
    try warn(allocator, "Warning message");
    try err(allocator, "Error message");
    try intro(allocator, "Starting...");
    try outro(allocator, "Finished!");
    try cancel(allocator, "Cancelled");
}

test "markdown processing" {
    const allocator = std.testing.allocator;

    const input = "This is _italic_ text";
    const result = try processMarkdown(allocator, input);
    defer allocator.free(result);

    try std.testing.expect(std.mem.indexOf(u8, result, "\x1B[3m") != null);
    try std.testing.expect(std.mem.indexOf(u8, result, "\x1B[23m") != null);
}
