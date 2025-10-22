const std = @import("std");

/// Middleware context passed to middleware functions
pub const MiddlewareContext = struct {
    allocator: std.mem.Allocator,
    command_name: []const u8,
    args: []const []const u8,
    options: std.StringHashMap([]const u8),
    data: std.StringHashMap([]const u8),

    pub fn init(
        allocator: std.mem.Allocator,
        command_name: []const u8,
        args: []const []const u8,
        options: std.StringHashMap([]const u8),
    ) MiddlewareContext {
        return MiddlewareContext{
            .allocator = allocator,
            .command_name = command_name,
            .args = args,
            .options = options,
            .data = std.StringHashMap([]const u8).init(allocator),
        };
    }

    pub fn deinit(self: *MiddlewareContext) void {
        var iter = self.data.iterator();
        while (iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.data.deinit();
    }

    /// Set data in context
    pub fn set(self: *MiddlewareContext, key: []const u8, value: []const u8) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        const value_copy = try self.allocator.dupe(u8, value);
        try self.data.put(key_copy, value_copy);
    }

    /// Get data from context
    pub fn get(self: *const MiddlewareContext, key: []const u8) ?[]const u8 {
        return self.data.get(key);
    }
};

/// Middleware function type
pub const MiddlewareFn = *const fn (ctx: *MiddlewareContext) anyerror!void;

/// Middleware chain
pub const MiddlewareChain = struct {
    allocator: std.mem.Allocator,
    middlewares: std.ArrayList(MiddlewareFn),

    pub fn init(allocator: std.mem.Allocator) MiddlewareChain {
        return MiddlewareChain{
            .allocator = allocator,
            .middlewares = .{},
        };
    }

    pub fn deinit(self: *MiddlewareChain) void {
        self.middlewares.deinit(self.allocator);
    }

    /// Add middleware to the chain
    pub fn use(self: *MiddlewareChain, middleware: MiddlewareFn) !void {
        try self.middlewares.append(self.allocator, middleware);
    }

    /// Execute all middlewares in order
    pub fn execute(self: *const MiddlewareChain, ctx: *MiddlewareContext) !void {
        for (self.middlewares.items) |middleware| {
            try middleware(ctx);
        }
    }
};

/// Built-in middleware: Logging
pub fn loggingMiddleware(ctx: *MiddlewareContext) !void {
    const stderr = std.io.getStdErr().writer();
    try stderr.print("[LOG] Executing command: {s}\n", .{ctx.command_name});
}

/// Built-in middleware: Timing
pub fn timingMiddleware(ctx: *MiddlewareContext) !void {
    const start_time = std.time.milliTimestamp();
    const start_str = try std.fmt.allocPrint(ctx.allocator, "{d}", .{start_time});
    try ctx.set("start_time", start_str);
}

/// Built-in middleware: Validation
pub fn validationMiddleware(ctx: *MiddlewareContext) !void {
    // Example: Validate that certain options are present
    if (ctx.options.get("required-option") == null) {
        return error.MissingRequiredOption;
    }
}

/// Built-in middleware: Authentication
pub fn authMiddleware(ctx: *MiddlewareContext) !void {
    // Check if user is authenticated
    const env_map = try std.process.getEnvMap(ctx.allocator);
    defer env_map.deinit();

    if (env_map.get("AUTH_TOKEN") == null) {
        return error.NotAuthenticated;
    }

    try ctx.set("authenticated", "true");
}

/// Built-in middleware: Rate limiting
pub const RateLimiter = struct {
    max_requests: usize,
    window_ms: i64,
    requests: std.ArrayList(i64),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, max_requests: usize, window_ms: i64) RateLimiter {
        return RateLimiter{
            .allocator = allocator,
            .max_requests = max_requests,
            .window_ms = window_ms,
            .requests = .{},
        };
    }

    pub fn deinit(self: *RateLimiter) void {
        self.requests.deinit(self.allocator);
    }

    pub fn check(self: *RateLimiter) !bool {
        const now = std.time.milliTimestamp();
        const window_start = now - self.window_ms;

        // Remove old requests
        var i: usize = 0;
        while (i < self.requests.items.len) {
            if (self.requests.items[i] < window_start) {
                _ = self.requests.orderedRemove(i);
            } else {
                i += 1;
            }
        }

        if (self.requests.items.len >= self.max_requests) {
            return false;
        }

        try self.requests.append(self.allocator, now);
        return true;
    }
};

test "middleware chain" {
    const allocator = std.testing.allocator;

    var chain = MiddlewareChain.init(allocator);
    defer chain.deinit();

    try chain.use(loggingMiddleware);
    try chain.use(timingMiddleware);

    try std.testing.expectEqual(@as(usize, 2), chain.middlewares.items.len);
}

test "middleware context" {
    const allocator = std.testing.allocator;

    var options = std.StringHashMap([]const u8).init(allocator);
    defer options.deinit();

    var ctx = MiddlewareContext.init(
        allocator,
        "test",
        &[_][]const u8{},
        options,
    );
    defer ctx.deinit();

    try ctx.set("key", "value");
    try std.testing.expectEqualStrings("value", ctx.get("key").?);
}

test "rate limiter" {
    const allocator = std.testing.allocator;

    var limiter = RateLimiter.init(allocator, 3, 1000);
    defer limiter.deinit();

    try std.testing.expect(try limiter.check());
    try std.testing.expect(try limiter.check());
    try std.testing.expect(try limiter.check());
    try std.testing.expect(!try limiter.check());
}
