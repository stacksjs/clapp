const std = @import("std");

/// Configuration file format
pub const ConfigFormat = enum {
    json,
    toml,
    yaml,
    ini,
};

/// Config value types
pub const ConfigValue = union(enum) {
    string: []const u8,
    number: f64,
    boolean: bool,
    array: []ConfigValue,
    object: std.StringHashMap(ConfigValue),

    pub fn deinit(self: *ConfigValue, allocator: std.mem.Allocator) void {
        switch (self.*) {
            .string => |s| allocator.free(s),
            .array => |arr| {
                for (arr) |*item| {
                    item.deinit(allocator);
                }
                allocator.free(arr);
            },
            .object => |*obj| {
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    allocator.free(entry.key_ptr.*);
                    entry.value_ptr.deinit(allocator);
                }
                obj.deinit();
            },
            else => {},
        }
    }
};

/// Configuration manager
pub const Config = struct {
    allocator: std.mem.Allocator,
    values: std.StringHashMap(ConfigValue),

    pub fn init(allocator: std.mem.Allocator) Config {
        return Config{
            .allocator = allocator,
            .values = std.StringHashMap(ConfigValue).init(allocator),
        };
    }

    pub fn deinit(self: *Config) void {
        var iter = self.values.iterator();
        while (iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            entry.value_ptr.deinit(self.allocator);
        }
        self.values.deinit();
    }

    /// Load config from file
    pub fn loadFromFile(allocator: std.mem.Allocator, file_path: []const u8) !Config {
        const file = try std.fs.cwd().openFile(file_path, .{});
        defer file.close();

        const content = try file.readToEndAlloc(allocator, 1024 * 1024);
        defer allocator.free(content);

        // Detect format from extension
        const format = detectFormat(file_path);

        return switch (format) {
            .json => try parseJson(allocator, content),
            else => error.UnsupportedFormat,
        };
    }

    /// Parse JSON config
    fn parseJson(allocator: std.mem.Allocator, content: []const u8) !Config {
        var config = Config.init(allocator);
        errdefer config.deinit();

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
        defer parsed.deinit();

        if (parsed.value != .object) {
            return error.InvalidConfig;
        }

        var iter = parsed.value.object.iterator();
        while (iter.next()) |entry| {
            const key = try allocator.dupe(u8, entry.key_ptr.*);
            const value = try jsonValueToConfigValue(allocator, entry.value_ptr.*);
            try config.values.put(key, value);
        }

        return config;
    }

    fn jsonValueToConfigValue(allocator: std.mem.Allocator, json_value: std.json.Value) !ConfigValue {
        return switch (json_value) {
            .string => |s| ConfigValue{ .string = try allocator.dupe(u8, s) },
            .number_string => |n| ConfigValue{ .number = try std.fmt.parseFloat(f64, n) },
            .bool => |b| ConfigValue{ .boolean = b },
            .null => ConfigValue{ .string = try allocator.dupe(u8, "") },
            .array => |arr| blk: {
                const items = try allocator.alloc(ConfigValue, arr.items.len);
                for (arr.items, 0..) |item, i| {
                    items[i] = try jsonValueToConfigValue(allocator, item);
                }
                break :blk ConfigValue{ .array = items };
            },
            .object => |obj| blk: {
                var map = std.StringHashMap(ConfigValue).init(allocator);
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    const key = try allocator.dupe(u8, entry.key_ptr.*);
                    const value = try jsonValueToConfigValue(allocator, entry.value_ptr.*);
                    try map.put(key, value);
                }
                break :blk ConfigValue{ .object = map };
            },
            else => ConfigValue{ .string = try allocator.dupe(u8, "") },
        };
    }

    /// Get string value
    pub fn getString(self: *const Config, key: []const u8) ?[]const u8 {
        const value = self.values.get(key) orelse return null;
        return switch (value) {
            .string => |s| s,
            else => null,
        };
    }

    /// Get number value
    pub fn getNumber(self: *const Config, key: []const u8) ?f64 {
        const value = self.values.get(key) orelse return null;
        return switch (value) {
            .number => |n| n,
            else => null,
        };
    }

    /// Get boolean value
    pub fn getBoolean(self: *const Config, key: []const u8) ?bool {
        const value = self.values.get(key) orelse return null;
        return switch (value) {
            .boolean => |b| b,
            else => null,
        };
    }

    /// Set string value
    pub fn setString(self: *Config, key: []const u8, value: []const u8) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        const value_copy = try self.allocator.dupe(u8, value);
        try self.values.put(key_copy, ConfigValue{ .string = value_copy });
    }

    /// Set number value
    pub fn setNumber(self: *Config, key: []const u8, value: f64) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        try self.values.put(key_copy, ConfigValue{ .number = value });
    }

    /// Set boolean value
    pub fn setBoolean(self: *Config, key: []const u8, value: bool) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        try self.values.put(key_copy, ConfigValue{ .boolean = value });
    }

    /// Check if key exists
    pub fn has(self: *const Config, key: []const u8) bool {
        return self.values.contains(key);
    }

    /// Merge with another config (other takes precedence)
    pub fn merge(self: *Config, other: *const Config) !void {
        var iter = other.values.iterator();
        while (iter.next()) |entry| {
            const key = try self.allocator.dupe(u8, entry.key_ptr.*);
            // Deep clone the value
            const value = switch (entry.value_ptr.*) {
                .string => |s| ConfigValue{ .string = try self.allocator.dupe(u8, s) },
                .number => |n| ConfigValue{ .number = n },
                .boolean => |b| ConfigValue{ .boolean = b },
                else => continue, // Skip complex types for now
            };
            try self.values.put(key, value);
        }
    }
};

fn detectFormat(file_path: []const u8) ConfigFormat {
    if (std.mem.endsWith(u8, file_path, ".json")) {
        return .json;
    } else if (std.mem.endsWith(u8, file_path, ".toml")) {
        return .toml;
    } else if (std.mem.endsWith(u8, file_path, ".yaml") or std.mem.endsWith(u8, file_path, ".yml")) {
        return .yaml;
    } else if (std.mem.endsWith(u8, file_path, ".ini")) {
        return .ini;
    }
    return .json;
}

/// Environment variable parser
pub const EnvParser = struct {
    prefix: ?[]const u8 = null,

    /// Parse environment variables into config
    pub fn parse(self: EnvParser, allocator: std.mem.Allocator) !Config {
        var config = Config.init(allocator);
        errdefer config.deinit();

        const env_map = try std.process.getEnvMap(allocator);
        defer env_map.deinit();

        var iter = env_map.iterator();
        while (iter.next()) |entry| {
            const key = entry.key_ptr.*;
            const value = entry.value_ptr.*;

            // Filter by prefix if provided
            if (self.prefix) |prefix| {
                if (!std.mem.startsWith(u8, key, prefix)) {
                    continue;
                }

                // Remove prefix and convert to lowercase
                const clean_key = key[prefix.len..];
                const lower_key = try std.ascii.allocLowerString(allocator, clean_key);
                defer allocator.free(lower_key);

                try config.setString(lower_key, value);
            } else {
                try config.setString(key, value);
            }
        }

        return config;
    }
};

test "config set and get" {
    const allocator = std.testing.allocator;

    var config = Config.init(allocator);
    defer config.deinit();

    try config.setString("name", "test");
    try config.setNumber("count", 42);
    try config.setBoolean("enabled", true);

    try std.testing.expectEqualStrings("test", config.getString("name").?);
    try std.testing.expectEqual(@as(f64, 42), config.getNumber("count").?);
    try std.testing.expect(config.getBoolean("enabled").?);
}

test "config has" {
    const allocator = std.testing.allocator;

    var config = Config.init(allocator);
    defer config.deinit();

    try config.setString("key", "value");

    try std.testing.expect(config.has("key"));
    try std.testing.expect(!config.has("missing"));
}
