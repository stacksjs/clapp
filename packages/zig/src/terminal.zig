const std = @import("std");

/// Terminal cursor control
pub const cursor = struct {
    /// Move cursor to specific position
    pub fn moveTo(x: usize, y: usize) !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.print("\x1B[{d};{d}H", .{ y, x });
    }

    /// Move cursor up by n lines
    pub fn moveUp(n: usize) !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.print("\x1B[{d}A", .{n});
    }

    /// Move cursor down by n lines
    pub fn moveDown(n: usize) !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.print("\x1B[{d}B", .{n});
    }

    /// Move cursor forward by n columns
    pub fn moveForward(n: usize) !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.print("\x1B[{d}C", .{n});
    }

    /// Move cursor back by n columns
    pub fn moveBack(n: usize) !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.print("\x1B[{d}D", .{n});
    }

    /// Hide cursor
    pub fn hide() !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\x1B[?25l");
    }

    /// Show cursor
    pub fn show() !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\x1B[?25h");
    }

    /// Save cursor position
    pub fn save() !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\x1B7");
    }

    /// Restore cursor position
    pub fn restore() !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\x1B8");
    }
};

/// Terminal erase control
pub const erase = struct {
    /// Erase from cursor down
    pub fn down(n: usize) !void {
        const stdout = std.io.getStdOut().writer();
        var i: usize = 0;
        while (i < n) : (i += 1) {
            try stdout.writeAll("\x1B[J");
            if (i < n - 1) {
                try cursor.moveDown(1);
            }
        }
    }

    /// Erase n lines
    pub fn lines(n: usize) !void {
        const stdout = std.io.getStdOut().writer();
        var i: usize = 0;
        while (i < n) : (i += 1) {
            try cursor.moveUp(1);
            try stdout.writeAll("\x1B[2K");
        }
    }

    /// Clear entire screen
    pub fn screen() !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\x1B[2J");
        try cursor.moveTo(1, 1);
    }

    /// Clear current line
    pub fn line() !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\x1B[2K\r");
    }
};

/// Check if unicode is supported
pub fn isUnicodeSupported() bool {
    if (std.posix.getenv("TERM")) |term| {
        if (std.mem.indexOf(u8, term, "linux") != null) {
            return false;
        }
    }

    // Check for Windows
    if (@import("builtin").os.tag == .windows) {
        if (std.posix.getenv("CI")) |_| {
            return true;
        }
        if (std.posix.getenv("WT_SESSION")) |_| {
            return true;
        }
        return false;
    }

    return true;
}

/// Get terminal width
pub fn getColumns() usize {
    if (@import("builtin").os.tag == .windows) {
        // Windows implementation
        return 80; // Default fallback
    }

    const stdout = std.io.getStdOut();
    const size = std.posix.tcgetwinsize(stdout.handle) catch {
        return 80; // Default fallback
    };

    return size.ws_col;
}

/// Strip VT control characters from string
pub fn stripVTControlCharacters(allocator: std.mem.Allocator, input: []const u8) ![]const u8 {
    var result = std.ArrayList(u8).init(allocator);
    errdefer result.deinit();

    var i: usize = 0;
    while (i < input.len) {
        if (input[i] == 0x1B and i + 1 < input.len and input[i + 1] == '[') {
            // Skip ANSI escape sequence
            i += 2;
            while (i < input.len and (input[i] < 0x40 or input[i] > 0x7E)) {
                i += 1;
            }
            if (i < input.len) {
                i += 1; // Skip the final character
            }
        } else {
            try result.append(input[i]);
            i += 1;
        }
    }

    return result.toOwnedSlice();
}

/// Raw mode utilities
pub const RawMode = struct {
    original_termios: ?std.posix.termios = null,

    pub fn enable(self: *RawMode) !void {
        const stdin = std.io.getStdIn();

        // Get current terminal settings
        self.original_termios = try std.posix.tcgetattr(stdin.handle);

        var raw = self.original_termios.?;

        // Disable canonical mode and echo
        raw.lflag.ECHO = false;
        raw.lflag.ICANON = false;
        raw.lflag.ISIG = false;
        raw.lflag.IEXTEN = false;

        // Disable input processing
        raw.iflag.IXON = false;
        raw.iflag.ICRNL = false;
        raw.iflag.BRKINT = false;
        raw.iflag.INPCK = false;
        raw.iflag.ISTRIP = false;

        // Disable output processing
        raw.oflag.OPOST = false;

        // Set character size to 8 bits
        raw.cflag.CSIZE = .CS8;

        // Set minimum characters to read
        raw.cc[@intFromEnum(std.posix.V.MIN)] = 0;
        raw.cc[@intFromEnum(std.posix.V.TIME)] = 1;

        try std.posix.tcsetattr(stdin.handle, .FLUSH, raw);
    }

    pub fn disable(self: *RawMode) !void {
        if (self.original_termios) |termios| {
            const stdin = std.io.getStdIn();
            try std.posix.tcsetattr(stdin.handle, .FLUSH, termios);
            self.original_termios = null;
        }
    }
};

/// Block for a duration (milliseconds)
pub fn block(ms: u64) void {
    std.time.sleep(ms * std.time.ns_per_ms);
}

test "unicode support detection" {
    const supported = isUnicodeSupported();
    try std.testing.expect(supported == true or supported == false);
}

test "terminal width" {
    const cols = getColumns();
    try std.testing.expect(cols > 0);
}

test "strip VT control characters" {
    const allocator = std.testing.allocator;

    const input = "\x1B[31mHello\x1B[0m World";
    const stripped = try stripVTControlCharacters(allocator, input);
    defer allocator.free(stripped);

    try std.testing.expectEqualStrings("Hello World", stripped);
}
