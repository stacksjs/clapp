const std = @import("std");

/// ANSI color codes
pub const AnsiCode = struct {
    open: []const u8,
    close: []const u8,
};

/// All available ANSI codes
pub const codes = struct {
    // Text colors
    pub const red = AnsiCode{ .open = "\x1B[31m", .close = "\x1B[39m" };
    pub const green = AnsiCode{ .open = "\x1B[32m", .close = "\x1B[39m" };
    pub const blue = AnsiCode{ .open = "\x1B[34m", .close = "\x1B[39m" };
    pub const yellow = AnsiCode{ .open = "\x1B[33m", .close = "\x1B[39m" };
    pub const cyan = AnsiCode{ .open = "\x1B[36m", .close = "\x1B[39m" };
    pub const magenta = AnsiCode{ .open = "\x1B[35m", .close = "\x1B[39m" };
    pub const white = AnsiCode{ .open = "\x1B[37m", .close = "\x1B[39m" };
    pub const gray = AnsiCode{ .open = "\x1B[90m", .close = "\x1B[39m" };
    pub const black = AnsiCode{ .open = "\x1B[30m", .close = "\x1B[39m" };

    // Background colors
    pub const bg_red = AnsiCode{ .open = "\x1B[41m", .close = "\x1B[49m" };
    pub const bg_green = AnsiCode{ .open = "\x1B[42m", .close = "\x1B[49m" };
    pub const bg_blue = AnsiCode{ .open = "\x1B[44m", .close = "\x1B[49m" };
    pub const bg_yellow = AnsiCode{ .open = "\x1B[43m", .close = "\x1B[49m" };
    pub const bg_cyan = AnsiCode{ .open = "\x1B[46m", .close = "\x1B[49m" };
    pub const bg_magenta = AnsiCode{ .open = "\x1B[45m", .close = "\x1B[49m" };
    pub const bg_white = AnsiCode{ .open = "\x1B[47m", .close = "\x1B[49m" };
    pub const bg_black = AnsiCode{ .open = "\x1B[40m", .close = "\x1B[49m" };

    // Text decorations
    pub const bold = AnsiCode{ .open = "\x1B[1m", .close = "\x1B[22m" };
    pub const italic = AnsiCode{ .open = "\x1B[3m", .close = "\x1B[23m" };
    pub const underline = AnsiCode{ .open = "\x1B[4m", .close = "\x1B[24m" };
    pub const dim = AnsiCode{ .open = "\x1B[2m", .close = "\x1B[22m" };
    pub const inverse = AnsiCode{ .open = "\x1B[7m", .close = "\x1B[27m" };
    pub const hidden = AnsiCode{ .open = "\x1B[8m", .close = "\x1B[28m" };
    pub const strikethrough = AnsiCode{ .open = "\x1B[9m", .close = "\x1B[29m" };

    // Reset
    pub const reset = AnsiCode{ .open = "\x1B[0m", .close = "" };
};

/// Theme color mappings
pub const Theme = struct {
    primary: AnsiCode = codes.blue,
    secondary: AnsiCode = codes.cyan,
    success: AnsiCode = codes.green,
    warning: AnsiCode = codes.yellow,
    @"error": AnsiCode = codes.red,
    info: AnsiCode = codes.magenta,
    muted: AnsiCode = codes.gray,
};

var global_theme = Theme{};
var colors_enabled: bool = true;

/// Set custom theme colors
pub fn setTheme(theme: Theme) void {
    global_theme = theme;
}

/// Enable or disable colors globally
pub fn setColorsEnabled(enabled: bool) void {
    colors_enabled = enabled;
}

/// Check if colors are supported
pub fn supportsColor() bool {
    return colors_enabled;
}

/// Apply ANSI code to text
pub fn apply(allocator: std.mem.Allocator, text: []const u8, code: AnsiCode) ![]const u8 {
    if (!colors_enabled) {
        return try allocator.dupe(u8, text);
    }
    return try std.fmt.allocPrint(allocator, "{s}{s}{s}", .{ code.open, text, code.close });
}

/// Apply multiple ANSI codes to text
pub fn applyMultiple(allocator: std.mem.Allocator, text: []const u8, style_codes: []const AnsiCode) ![]const u8 {
    if (!colors_enabled) {
        return try allocator.dupe(u8, text);
    }

    var result: std.ArrayList(u8) = .{};
    defer result.deinit(allocator);

    // Add all opening codes
    for (style_codes) |code| {
        try result.appendSlice(allocator, code.open);
    }

    try result.appendSlice(allocator, text);

    // Add all closing codes in reverse
    var i = style_codes.len;
    while (i > 0) {
        i -= 1;
        try result.appendSlice(allocator, style_codes[i].close);
    }

    return try result.toOwnedSlice(allocator);
}

// Convenience functions for common styles

pub fn red(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.red);
}

pub fn green(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.green);
}

pub fn blue(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.blue);
}

pub fn yellow(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.yellow);
}

pub fn cyan(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.cyan);
}

pub fn magenta(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.magenta);
}

pub fn gray(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.gray);
}

pub fn bold(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bold);
}

pub fn italic(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.italic);
}

pub fn underline(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.underline);
}

pub fn dim(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.dim);
}

pub fn inverse(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.inverse);
}

pub fn hidden(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.hidden);
}

pub fn strikethrough(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.strikethrough);
}

// Background color functions

pub fn bgRed(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_red);
}

pub fn bgGreen(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_green);
}

pub fn bgBlue(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_blue);
}

pub fn bgYellow(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_yellow);
}

pub fn bgCyan(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_cyan);
}

pub fn bgMagenta(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_magenta);
}

pub fn bgWhite(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_white);
}

pub fn bgBlack(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, codes.bg_black);
}

// Theme color functions

pub fn primary(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, global_theme.primary);
}

pub fn success(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, global_theme.success);
}

pub fn warning(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, global_theme.warning);
}

pub fn err(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, global_theme.@"error");
}

pub fn info(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, global_theme.info);
}

pub fn muted(allocator: std.mem.Allocator, text: []const u8) ![]const u8 {
    return apply(allocator, text, global_theme.muted);
}

/// Box drawing characters
pub const box_chars = struct {
    pub const top_left = "┌";
    pub const top_right = "┐";
    pub const bottom_left = "└";
    pub const bottom_right = "┘";
    pub const horizontal = "─";
    pub const vertical = "│";
    pub const cross = "┼";
    pub const t_down = "┬";
    pub const t_up = "┴";
    pub const t_left = "┤";
    pub const t_right = "├";
};

pub const panel_chars = struct {
    pub const top_left = "╔";
    pub const top_right = "╗";
    pub const bottom_left = "╚";
    pub const bottom_right = "╝";
    pub const horizontal = "═";
    pub const vertical = "║";
};

/// Box options
pub const BoxOptions = struct {
    padding: usize = 1,
    title: ?[]const u8 = null,
    border_color: ?AnsiCode = null,
};

/// Draw a box around content
pub fn box(allocator: std.mem.Allocator, content: []const u8, options: BoxOptions) ![]const u8 {
    var lines = std.mem.splitSequence(u8, content, "\n");
    var line_list: std.ArrayList([]const u8) = .{};
    defer line_list.deinit(allocator);

    var max_width: usize = 0;
    while (lines.next()) |line| {
        try line_list.append(allocator, line);
        if (line.len > max_width) {
            max_width = line.len;
        }
    }

    const inner_width = max_width + (options.padding * 2);
    var result: std.ArrayList(u8) = .{};
    defer result.deinit(allocator);

    // Top border
    try result.appendSlice(allocator, box_chars.top_left);
    var i: usize = 0;
    if (options.title) |title| {
        const title_padding = (inner_width - title.len) / 2;
        try result.appendSlice(allocator, box_chars.horizontal ** @min(title_padding, 100));
        try result.appendSlice(allocator, " ");
        try result.appendSlice(allocator, title);
        try result.appendSlice(allocator, " ");
        const remaining = inner_width - title.len - title_padding - 2;
        try result.appendSlice(allocator, box_chars.horizontal ** @min(remaining, 100));
    } else {
        i = 0;
        while (i < inner_width) : (i += 1) {
            try result.appendSlice(allocator, box_chars.horizontal);
        }
    }
    try result.appendSlice(allocator, box_chars.top_right);
    try result.appendSlice(allocator, "\n");

    // Empty line after top border
    try result.appendSlice(allocator, box_chars.vertical);
    i = 0;
    while (i < inner_width) : (i += 1) {
        try result.appendSlice(allocator, " ");
    }
    try result.appendSlice(allocator, box_chars.vertical);
    try result.appendSlice(allocator, "\n");

    // Content lines
    for (line_list.items) |line| {
        try result.appendSlice(allocator, box_chars.vertical);
        var j: usize = 0;
        while (j < options.padding) : (j += 1) {
            try result.appendSlice(allocator, " ");
        }
        try result.appendSlice(allocator, line);
        const right_padding = inner_width - line.len - options.padding;
        j = 0;
        while (j < right_padding) : (j += 1) {
            try result.appendSlice(allocator, " ");
        }
        try result.appendSlice(allocator, box_chars.vertical);
        try result.appendSlice(allocator, "\n");
    }

    // Empty line before bottom border
    try result.appendSlice(allocator, box_chars.vertical);
    i = 0;
    while (i < inner_width) : (i += 1) {
        try result.appendSlice(allocator, " ");
    }
    try result.appendSlice(allocator, box_chars.vertical);
    try result.appendSlice(allocator, "\n");

    // Bottom border
    try result.appendSlice(allocator, box_chars.bottom_left);
    i = 0;
    while (i < inner_width) : (i += 1) {
        try result.appendSlice(allocator, box_chars.horizontal);
    }
    try result.appendSlice(allocator, box_chars.bottom_right);

    return try result.toOwnedSlice(allocator);
}

/// Panel options
pub const PanelOptions = struct {
    title: ?[]const u8 = null,
    border_color: ?AnsiCode = null,
};

/// Draw a panel (double-line box)
pub fn panel(allocator: std.mem.Allocator, content: []const u8, options: PanelOptions) ![]const u8 {
    var lines = std.mem.splitSequence(u8, content, "\n");
    var line_list: std.ArrayList([]const u8) = .{};
    defer line_list.deinit(allocator);

    var max_width: usize = 0;
    while (lines.next()) |line| {
        try line_list.append(allocator, line);
        if (line.len > max_width) {
            max_width = line.len;
        }
    }

    const inner_width = max_width + 2;
    var result: std.ArrayList(u8) = .{};
    defer result.deinit(allocator);

    // Top border
    try result.appendSlice(allocator, panel_chars.top_left);
    if (options.title) |title| {
        const title_padding = (inner_width - title.len) / 2;
        var i: usize = 0;
        while (i < title_padding) : (i += 1) {
            try result.appendSlice(allocator, panel_chars.horizontal);
        }
        try result.appendSlice(allocator, " ");
        try result.appendSlice(allocator, title);
        try result.appendSlice(allocator, " ");
        const remaining = inner_width - title.len - title_padding - 2;
        i = 0;
        while (i < remaining) : (i += 1) {
            try result.appendSlice(allocator, panel_chars.horizontal);
        }
    } else {
        var i: usize = 0;
        while (i < inner_width) : (i += 1) {
            try result.appendSlice(allocator, panel_chars.horizontal);
        }
    }
    try result.appendSlice(allocator, panel_chars.top_right);
    try result.appendSlice(allocator, "\n");

    // Empty line
    try result.appendSlice(allocator, panel_chars.vertical);
    var i: usize = 0;
    while (i < inner_width) : (i += 1) {
        try result.appendSlice(allocator, " ");
    }
    try result.appendSlice(allocator, panel_chars.vertical);
    try result.appendSlice(allocator, "\n");

    // Content lines
    for (line_list.items) |line| {
        try result.appendSlice(allocator, panel_chars.vertical);
        try result.appendSlice(allocator, " ");
        try result.appendSlice(allocator, line);
        const right_padding = inner_width - line.len - 1;
        i = 0;
        while (i < right_padding) : (i += 1) {
            try result.appendSlice(allocator, " ");
        }
        try result.appendSlice(allocator, panel_chars.vertical);
        try result.appendSlice(allocator, "\n");
    }

    // Empty line
    try result.appendSlice(allocator, panel_chars.vertical);
    i = 0;
    while (i < inner_width) : (i += 1) {
        try result.appendSlice(allocator, " ");
    }
    try result.appendSlice(allocator, panel_chars.vertical);
    try result.appendSlice(allocator, "\n");

    // Bottom border
    try result.appendSlice(allocator, panel_chars.bottom_left);
    i = 0;
    while (i < inner_width) : (i += 1) {
        try result.appendSlice(allocator, panel_chars.horizontal);
    }
    try result.appendSlice(allocator, panel_chars.bottom_right);

    return try result.toOwnedSlice(allocator);
}

/// Table options
pub const TableOptions = struct {
    border: bool = true,
    header: bool = true,
};

/// Draw a table
pub fn table(allocator: std.mem.Allocator, data: []const []const []const u8, options: TableOptions) !void {
    if (data.len == 0) return;

    const stdout = std.io.getStdOut().writer();

    // Calculate column widths
    const num_cols = data[0].len;
    const col_widths = try allocator.alloc(usize, num_cols);
    defer allocator.free(col_widths);

    @memset(col_widths, 0);

    for (data) |row| {
        for (row, 0..) |cell, i| {
            if (cell.len > col_widths[i]) {
                col_widths[i] = cell.len;
            }
        }
    }

    // Draw top border
    if (options.border) {
        try stdout.writeAll(box_chars.top_left);
        for (col_widths, 0..) |width, i| {
            var j: usize = 0;
            while (j < width + 2) : (j += 1) {
                try stdout.writeAll(box_chars.horizontal);
            }
            if (i < col_widths.len - 1) {
                try stdout.writeAll(box_chars.t_down);
            }
        }
        try stdout.writeAll(box_chars.top_right);
        try stdout.writeAll("\n");
    }

    // Draw header
    const start_row: usize = if (options.header) 1 else 0;
    if (options.header and data.len > 0) {
        if (options.border) try stdout.writeAll(box_chars.vertical);
        for (data[0], 0..) |cell, i| {
            try stdout.writeAll(" ");
            try stdout.writeAll(cell);
            const padding = col_widths[i] - cell.len;
            var j: usize = 0;
            while (j < padding) : (j += 1) {
                try stdout.writeAll(" ");
            }
            try stdout.writeAll(" ");
            if (options.border) try stdout.writeAll(box_chars.vertical);
        }
        try stdout.writeAll("\n");

        // Header separator
        if (options.border) {
            try stdout.writeAll(box_chars.t_right);
            for (col_widths, 0..) |width, i| {
                var j: usize = 0;
                while (j < width + 2) : (j += 1) {
                    try stdout.writeAll(box_chars.horizontal);
                }
                if (i < col_widths.len - 1) {
                    try stdout.writeAll(box_chars.cross);
                }
            }
            try stdout.writeAll(box_chars.t_left);
            try stdout.writeAll("\n");
        }
    }

    // Draw data rows
    for (data[start_row..]) |row| {
        if (options.border) try stdout.writeAll(box_chars.vertical);
        for (row, 0..) |cell, i| {
            try stdout.writeAll(" ");
            try stdout.writeAll(cell);
            const padding = col_widths[i] - cell.len;
            var j: usize = 0;
            while (j < padding) : (j += 1) {
                try stdout.writeAll(" ");
            }
            try stdout.writeAll(" ");
            if (options.border) try stdout.writeAll(box_chars.vertical);
        }
        try stdout.writeAll("\n");
    }

    // Draw bottom border
    if (options.border) {
        try stdout.writeAll(box_chars.bottom_left);
        for (col_widths, 0..) |width, i| {
            var j: usize = 0;
            while (j < width + 2) : (j += 1) {
                try stdout.writeAll(box_chars.horizontal);
            }
            if (i < col_widths.len - 1) {
                try stdout.writeAll(box_chars.t_up);
            }
        }
        try stdout.writeAll(box_chars.bottom_right);
        try stdout.writeAll("\n");
    }
}

test "apply style" {
    const allocator = std.testing.allocator;

    const styled = try red(allocator, "Error");
    defer allocator.free(styled);

    try std.testing.expect(std.mem.indexOf(u8, styled, "Error") != null);
}

test "box drawing" {
    const allocator = std.testing.allocator;

    const boxed = try box(allocator, "Hello\nWorld", .{ .title = "Greeting" });
    defer allocator.free(boxed);

    try std.testing.expect(std.mem.indexOf(u8, boxed, "Hello") != null);
    try std.testing.expect(std.mem.indexOf(u8, boxed, "World") != null);
}
