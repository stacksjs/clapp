const std = @import("std");
const style = @import("style.zig");

var debug_enabled: bool = false;
var trace_enabled: bool = false;

pub fn setDebugMode(enabled: bool) void {
    debug_enabled = enabled;
}

pub fn setTraceMode(enabled: bool) void {
    trace_enabled = enabled;
}

pub fn isDebugEnabled() bool {
    return debug_enabled;
}

pub fn isTraceEnabled() bool {
    return trace_enabled;
}

pub fn debug(allocator: std.mem.Allocator, comptime fmt: []const u8, args: anytype) !void {
    if (!debug_enabled) return;

    const stderr = std.io.getStdErr().writer();
    const prefix = try style.muted(allocator, "[DEBUG]");
    defer allocator.free(prefix);

    const message = try std.fmt.allocPrint(allocator, fmt, args);
    defer allocator.free(message);

    try stderr.print("{s} {s}\n", .{ prefix, message });
}

pub fn trace(allocator: std.mem.Allocator, comptime fmt: []const u8, args: anytype) !void {
    if (!trace_enabled) return;

    const stderr = std.io.getStdErr().writer();
    const prefix = try style.dim(allocator, "[TRACE]");
    defer allocator.free(prefix);

    const message = try std.fmt.allocPrint(allocator, fmt, args);
    defer allocator.free(message);

    const timestamp = std.time.milliTimestamp();
    try stderr.print("{s} [{d}] {s}\n", .{ prefix, timestamp, message });
}

pub const Timer = struct {
    name: []const u8,
    start: i64,

    pub fn start(name: []const u8) Timer {
        return Timer{
            .name = name,
            .start = std.time.milliTimestamp(),
        };
    }

    pub fn stop(self: *const Timer, allocator: std.mem.Allocator) !void {
        const end = std.time.milliTimestamp();
        const duration = end - self.start;

        try debug(allocator, "{s} took {d}ms", .{ self.name, duration });
    }
};
