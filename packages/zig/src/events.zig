const std = @import("std");

/// Event listener callback function type
pub const ListenerFn = *const fn (data: ?*anyopaque) void;

/// Event listener with callback and data
pub const Listener = struct {
    callback: ListenerFn,
    once: bool = false,
};

/// Event emitter for CLI lifecycle events
pub const EventEmitter = struct {
    allocator: std.mem.Allocator,
    listeners: std.StringHashMap(std.ArrayList(Listener)),
    mutex: std.Thread.Mutex = .{},

    pub fn init(allocator: std.mem.Allocator) EventEmitter {
        return EventEmitter{
            .allocator = allocator,
            .listeners = std.StringHashMap(std.ArrayList(Listener)).init(allocator),
        };
    }

    pub fn deinit(self: *EventEmitter) void {
        var iter = self.listeners.iterator();
        while (iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            entry.value_ptr.deinit(self.allocator);
        }
        self.listeners.deinit();
    }

    /// Register an event listener
    pub fn on(self: *EventEmitter, event_name: []const u8, callback: ListenerFn) !void {
        self.mutex.lock();
        defer self.mutex.unlock();

        const key = try self.allocator.dupe(u8, event_name);
        errdefer self.allocator.free(key);

        var result = try self.listeners.getOrPut(key);
        if (!result.found_existing) {
            result.value_ptr.* = .{};
        }

        try result.value_ptr.append(self.allocator, .{
            .callback = callback,
            .once = false,
        });
    }

    /// Register a one-time event listener
    pub fn once(self: *EventEmitter, event_name: []const u8, callback: ListenerFn) !void {
        self.mutex.lock();
        defer self.mutex.unlock();

        const key = try self.allocator.dupe(u8, event_name);
        errdefer self.allocator.free(key);

        var result = try self.listeners.getOrPut(key);
        if (!result.found_existing) {
            result.value_ptr.* = .{};
        }

        try result.value_ptr.append(self.allocator, .{
            .callback = callback,
            .once = true,
        });
    }

    /// Emit an event
    pub fn emit(self: *EventEmitter, event_name: []const u8, data: ?*anyopaque) void {
        self.mutex.lock();
        defer self.mutex.unlock();

        if (self.listeners.get(event_name)) |listeners_list| {
            // Call all listeners
            var i: usize = 0;
            while (i < listeners_list.items.len) {
                const listener = listeners_list.items[i];
                listener.callback(data);

                // Remove one-time listeners after calling
                if (listener.once) {
                    _ = listeners_list.swapRemove(i);
                    // Don't increment i since we removed an item
                } else {
                    i += 1;
                }
            }
        }
    }

    /// Remove a specific listener
    pub fn off(self: *EventEmitter, event_name: []const u8, callback: ListenerFn) void {
        self.mutex.lock();
        defer self.mutex.unlock();

        if (self.listeners.getPtr(event_name)) |listeners_list| {
            var i: usize = 0;
            while (i < listeners_list.items.len) {
                if (listeners_list.items[i].callback == callback) {
                    _ = listeners_list.swapRemove(i);
                    return;
                }
                i += 1;
            }
        }
    }

    /// Remove all listeners for an event
    pub fn removeAllListeners(self: *EventEmitter, event_name: []const u8) void {
        self.mutex.lock();
        defer self.mutex.unlock();

        if (self.listeners.fetchRemove(event_name)) |entry| {
            self.allocator.free(entry.key);
            entry.value.deinit();
        }
    }

    /// Get listener count for an event
    pub fn listenerCount(self: *const EventEmitter, event_name: []const u8) usize {
        if (self.listeners.get(event_name)) |listeners_list| {
            return listeners_list.items.len;
        }
        return 0;
    }
};

/// Common CLI event names
pub const events = struct {
    pub const command_start = "command:*";
    pub const command_error = "command:!";
    pub const command_unknown = "command:unknown";
    pub const option_missing = "option:missing";
    pub const parse_start = "parse:start";
    pub const parse_end = "parse:end";
    pub const help = "help";
    pub const version = "version";
};

test "event emitter" {
    const allocator = std.testing.allocator;

    var emitter = EventEmitter.init(allocator);
    defer emitter.deinit();

    var called = false;
    const callback = struct {
        var flag: *bool = undefined;
        fn handle(_: ?*anyopaque) void {
            flag.* = true;
        }
    };
    callback.flag = &called;

    try emitter.on("test", callback.handle);
    try std.testing.expect(emitter.listenerCount("test") == 1);

    emitter.emit("test", null);
    try std.testing.expect(called);
}

test "event emitter once" {
    const allocator = std.testing.allocator;

    var emitter = EventEmitter.init(allocator);
    defer emitter.deinit();

    var count: usize = 0;
    const callback = struct {
        var counter: *usize = undefined;
        fn handle(_: ?*anyopaque) void {
            counter.* += 1;
        }
    };
    callback.counter = &count;

    try emitter.once("test", callback.handle);
    try std.testing.expect(emitter.listenerCount("test") == 1);

    emitter.emit("test", null);
    try std.testing.expect(count == 1);
    try std.testing.expect(emitter.listenerCount("test") == 0);

    // Second emit should not call the listener
    emitter.emit("test", null);
    try std.testing.expect(count == 1);
}

test "event emitter off" {
    const allocator = std.testing.allocator;

    var emitter = EventEmitter.init(allocator);
    defer emitter.deinit();

    const callback = struct {
        fn handle(_: ?*anyopaque) void {}
    }.handle;

    try emitter.on("test", callback);
    try std.testing.expect(emitter.listenerCount("test") == 1);

    emitter.off("test", callback);
    try std.testing.expect(emitter.listenerCount("test") == 0);
}
