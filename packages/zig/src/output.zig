const std = @import("std");

/// Output format types
pub const OutputFormat = enum {
    text,
    json,
    yaml,
    table,
};

/// JSON output writer
pub const JsonOutput = struct {
    allocator: std.mem.Allocator,
    data: std.StringHashMap(std.json.Value),

    pub fn init(allocator: std.mem.Allocator) JsonOutput {
        return JsonOutput{
            .allocator = allocator,
            .data = std.StringHashMap(std.json.Value).init(allocator),
        };
    }

    pub fn deinit(self: *JsonOutput) void {
        self.data.deinit();
    }

    pub fn addString(self: *JsonOutput, key: []const u8, value: []const u8) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        const value_copy = try self.allocator.dupe(u8, value);
        const json_value = std.json.Value{ .string = value_copy };
        try self.data.put(key_copy, json_value);
    }

    pub fn addNumber(self: *JsonOutput, key: []const u8, value: f64) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        const number_str = try std.fmt.allocPrint(self.allocator, "{d}", .{value});
        const json_value = std.json.Value{ .number_string = number_str };
        try self.data.put(key_copy, json_value);
    }

    pub fn addBool(self: *JsonOutput, key: []const u8, value: bool) !void {
        const key_copy = try self.allocator.dupe(u8, key);
        const json_value = std.json.Value{ .bool = value };
        try self.data.put(key_copy, json_value);
    }

    pub fn write(self: *const JsonOutput) ![]const u8 {
        var obj = std.json.ObjectMap.init(self.allocator);
        defer obj.deinit();

        var iter = self.data.iterator();
        while (iter.next()) |entry| {
            try obj.put(entry.key_ptr.*, entry.value_ptr.*);
        }

        const value = std.json.Value{ .object = obj };
        return try std.json.stringifyAlloc(self.allocator, value, .{ .whitespace = .indent_2 });
    }
};

/// Structured output helper
pub fn outputJson(allocator: std.mem.Allocator, data: anytype) !void {
    const stdout = std.io.getStdOut().writer();
    const json_str = try std.json.stringifyAlloc(allocator, data, .{ .whitespace = .indent_2 });
    defer allocator.free(json_str);
    try stdout.print("{s}\n", .{json_str});
}

test "json output" {
    const allocator = std.testing.allocator;

    var json = JsonOutput.init(allocator);
    defer json.deinit();

    try json.addString("name", "test");
    try json.addNumber("count", 42);
    try json.addBool("enabled", true);

    const output = try json.write();
    defer allocator.free(output);

    try std.testing.expect(std.mem.indexOf(u8, output, "name") != null);
}
