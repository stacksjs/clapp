const std = @import("std");

/// State machine for prompts and CLI operations
pub const State = enum {
    initial,
    active,
    cancel,
    submit,
    @"error",

    pub fn isActive(self: State) bool {
        return self == .active;
    }

    pub fn isFinished(self: State) bool {
        return self == .submit or self == .cancel or self == .@"error";
    }
};

/// Action types for keyboard input
pub const Action = enum {
    up,
    down,
    left,
    right,
    space,
    enter,
    cancel,
    backspace,
    delete,
    home,
    end,
    tab,

    /// Parse action from key input
    pub fn fromKey(key: []const u8) ?Action {
        if (key.len == 0) return null;

        // Single character keys
        if (key.len == 1) {
            return switch (key[0]) {
                ' ' => .space,
                '\n', '\r' => .enter,
                0x7F, 0x08 => .backspace, // DEL or BS
                0x1B => .cancel, // ESC
                '\t' => .tab,
                else => null,
            };
        }

        // ANSI escape sequences
        if (key.len >= 3 and key[0] == 0x1B and key[1] == '[') {
            return switch (key[2]) {
                'A' => .up,
                'B' => .down,
                'C' => .right,
                'D' => .left,
                'H' => .home,
                'F' => .end,
                '3' => if (key.len >= 4 and key[3] == '~') .delete else null,
                else => null,
            };
        }

        return null;
    }
};

/// Global settings for CLI behavior
pub const Settings = struct {
    /// Custom messages
    cancel_message: []const u8 = "Operation cancelled",
    error_message: []const u8 = "An error occurred",

    /// Action key aliases (vim-style)
    use_vim_keys: bool = false,

    /// Custom action key mappings
    action_keys: std.StringHashMap(Action),

    pub fn init(allocator: std.mem.Allocator) Settings {
        return Settings{
            .action_keys = std.StringHashMap(Action).init(allocator),
        };
    }

    pub fn deinit(self: *Settings) void {
        var iter = self.action_keys.iterator();
        while (iter.next()) |entry| {
            self.action_keys.allocator.free(entry.key_ptr.*);
        }
        self.action_keys.deinit();
    }

    /// Add custom action key mapping
    pub fn mapKey(self: *Settings, key: []const u8, action: Action) !void {
        const key_copy = try self.action_keys.allocator.dupe(u8, key);
        try self.action_keys.put(key_copy, action);
    }

    /// Check if a key matches an action
    pub fn isActionKey(self: *const Settings, key: []const u8, action: Action) bool {
        // Check custom mappings first
        if (self.action_keys.get(key)) |mapped_action| {
            return mapped_action == action;
        }

        // Check vim keys if enabled
        if (self.use_vim_keys and key.len == 1) {
            const vim_action = switch (key[0]) {
                'k' => Action.up,
                'j' => Action.down,
                'h' => Action.left,
                'l' => Action.right,
                'q' => Action.cancel,
                else => return false,
            };
            return vim_action == action;
        }

        // Check standard keys
        if (Action.fromKey(key)) |parsed_action| {
            return parsed_action == action;
        }

        return false;
    }
};

/// Global settings instance
var global_settings: ?Settings = null;
var settings_mutex = std.Thread.Mutex{};

/// Update global settings
pub fn updateSettings(allocator: std.mem.Allocator, new_settings: Settings) !void {
    settings_mutex.lock();
    defer settings_mutex.unlock();

    if (global_settings) |*old_settings| {
        old_settings.deinit();
    }

    global_settings = new_settings;
}

/// Get global settings
pub fn getSettings() ?*const Settings {
    settings_mutex.lock();
    defer settings_mutex.unlock();

    if (global_settings) |*settings| {
        return settings;
    }
    return null;
}

/// Deinitialize global settings
pub fn deinitSettings() void {
    settings_mutex.lock();
    defer settings_mutex.unlock();

    if (global_settings) |*settings| {
        settings.deinit();
        global_settings = null;
    }
}

test "state machine" {
    const state = State.initial;
    try std.testing.expect(!state.isActive());
    try std.testing.expect(!state.isFinished());

    const active = State.active;
    try std.testing.expect(active.isActive());
    try std.testing.expect(!active.isFinished());

    const submit = State.submit;
    try std.testing.expect(!submit.isActive());
    try std.testing.expect(submit.isFinished());
}

test "action from key" {
    try std.testing.expect(Action.fromKey(" ") == .space);
    try std.testing.expect(Action.fromKey("\n") == .enter);
    try std.testing.expect(Action.fromKey("\x1B[A") == .up);
    try std.testing.expect(Action.fromKey("\x1B[B") == .down);
    try std.testing.expect(Action.fromKey("\x1B[C") == .right);
    try std.testing.expect(Action.fromKey("\x1B[D") == .left);
}

test "settings" {
    const allocator = std.testing.allocator;

    var settings = Settings.init(allocator);
    defer settings.deinit();

    try settings.mapKey("x", .cancel);
    try std.testing.expect(settings.isActionKey("x", .cancel));

    settings.use_vim_keys = true;
    try std.testing.expect(settings.isActionKey("k", .up));
    try std.testing.expect(settings.isActionKey("j", .down));
}
