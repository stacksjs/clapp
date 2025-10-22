const std = @import("std");

/// Signal handler function type
pub const SignalHandlerFn = *const fn () void;

var signal_handlers: ?std.StringHashMap(SignalHandlerFn) = null;
var signal_mutex = std.Thread.Mutex{};

/// Initialize signal handling
pub fn init(allocator: std.mem.Allocator) !void {
    signal_mutex.lock();
    defer signal_mutex.unlock();

    if (signal_handlers == null) {
        signal_handlers = std.StringHashMap(SignalHandlerFn).init(allocator);
    }
}

/// Deinitialize signal handling
pub fn deinit() void {
    signal_mutex.lock();
    defer signal_mutex.unlock();

    if (signal_handlers) |*handlers| {
        handlers.deinit();
        signal_handlers = null;
    }
}

/// Register a signal handler
pub fn onSignal(signal_name: []const u8, handler: SignalHandlerFn) !void {
    signal_mutex.lock();
    defer signal_mutex.unlock();

    if (signal_handlers) |*handlers| {
        const key = try handlers.allocator.dupe(u8, signal_name);
        try handlers.put(key, handler);
    }
}

/// Handle SIGINT (Ctrl+C)
pub fn onSigInt(handler: SignalHandlerFn) !void {
    try onSignal("SIGINT", handler);

    // Register actual signal handler
    if (std.builtin.os.tag == .linux or std.builtin.os.tag == .macos) {
        const sig_action = std.os.linux.Sigaction{
            .handler = .{ .handler = struct {
                fn handleSignal(_: c_int) callconv(.C) void {
                    signal_mutex.lock();
                    defer signal_mutex.unlock();

                    if (signal_handlers) |handlers| {
                        if (handlers.get("SIGINT")) |h| {
                            h();
                        }
                    }
                }
            }.handleSignal },
            .mask = std.os.linux.empty_sigset,
            .flags = 0,
        };
        _ = std.os.linux.sigaction(std.os.linux.SIG.INT, &sig_action, null);
    }
}

/// Handle SIGTERM
pub fn onSigTerm(handler: SignalHandlerFn) !void {
    try onSignal("SIGTERM", handler);

    if (std.builtin.os.tag == .linux or std.builtin.os.tag == .macos) {
        const sig_action = std.os.linux.Sigaction{
            .handler = .{ .handler = struct {
                fn handleSignal(_: c_int) callconv(.C) void {
                    signal_mutex.lock();
                    defer signal_mutex.unlock();

                    if (signal_handlers) |handlers| {
                        if (handlers.get("SIGTERM")) |h| {
                            h();
                        }
                    }
                }
            }.handleSignal },
            .mask = std.os.linux.empty_sigset,
            .flags = 0,
        };
        _ = std.os.linux.sigaction(std.os.linux.SIG.TERM, &sig_action, null);
    }
}

/// Graceful shutdown helper
pub const GracefulShutdown = struct {
    allocator: std.mem.Allocator,
    cleanup_fns: std.ArrayList(*const fn () void),
    shutdown_requested: bool = false,

    pub fn init(allocator: std.mem.Allocator) GracefulShutdown {
        return GracefulShutdown{
            .allocator = allocator,
            .cleanup_fns = .{},
        };
    }

    pub fn deinit(self: *GracefulShutdown) void {
        self.cleanup_fns.deinit(self.allocator);
    }

    /// Register a cleanup function
    pub fn onShutdown(self: *GracefulShutdown, cleanup_fn: *const fn () void) !void {
        try self.cleanup_fns.append(self.allocator, cleanup_fn);
    }

    /// Request shutdown
    pub fn requestShutdown(self: *GracefulShutdown) void {
        self.shutdown_requested = true;
    }

    /// Execute all cleanup functions
    pub fn cleanup(self: *const GracefulShutdown) void {
        for (self.cleanup_fns.items) |cleanup_fn| {
            cleanup_fn();
        }
    }

    /// Check if shutdown was requested
    pub fn shouldShutdown(self: *const GracefulShutdown) bool {
        return self.shutdown_requested;
    }
};

test "graceful shutdown" {
    const allocator = std.testing.allocator;

    var shutdown = GracefulShutdown.init(allocator);
    defer shutdown.deinit();

    var called = false;
    const cleanup = struct {
        var flag: *bool = undefined;
        fn run() void {
            flag.* = true;
        }
    };
    cleanup.flag = &called;

    try shutdown.onShutdown(cleanup.run);
    shutdown.requestShutdown();

    try std.testing.expect(shutdown.shouldShutdown());
    shutdown.cleanup();
    try std.testing.expect(called);
}
