const std = @import("std");
const types = @import("types.zig");

/// Remove brackets from a string
pub fn removeBrackets(allocator: std.mem.Allocator, input: []const u8) ![]const u8 {
    var i: usize = 0;
    while (i < input.len) : (i += 1) {
        if (input[i] == '<' or input[i] == '[') {
            return try allocator.dupe(u8, std.mem.trim(u8, input[0..i], " \t\n\r"));
        }
    }
    return try allocator.dupe(u8, std.mem.trim(u8, input, " \t\n\r"));
}

/// Find all bracketed arguments in a command string
pub fn findAllBrackets(allocator: std.mem.Allocator, input: []const u8) !std.ArrayList(types.CommandArg) {
    var result = std.ArrayList(types.CommandArg).init(allocator);
    errdefer result.deinit();

    var i: usize = 0;
    while (i < input.len) {
        if (input[i] == '<' or input[i] == '[') {
            const is_required = input[i] == '<';
            const close_char: u8 = if (is_required) '>' else ']';

            const start = i + 1;
            var end = start;
            while (end < input.len and input[end] != close_char) : (end += 1) {}

            if (end < input.len) {
                var value = input[start..end];
                var variadic = false;

                if (std.mem.startsWith(u8, value, "...")) {
                    value = value[3..];
                    variadic = true;
                }

                const arg = types.CommandArg{
                    .required = is_required,
                    .value = try allocator.dupe(u8, value),
                    .variadic = variadic,
                };
                try result.append(arg);
                i = end + 1;
                continue;
            }
        }
        i += 1;
    }

    return result;
}

/// Convert a string to camelCase
pub fn camelcase(allocator: std.mem.Allocator, input: []const u8) ![]const u8 {
    var result = std.ArrayList(u8).init(allocator);
    defer result.deinit();

    var i: usize = 0;
    var capitalize_next = false;

    while (i < input.len) : (i += 1) {
        if (input[i] == '-' and i + 1 < input.len) {
            capitalize_next = true;
        } else if (capitalize_next) {
            try result.append(std.ascii.toUpper(input[i]));
            capitalize_next = false;
        } else {
            try result.append(input[i]);
        }
    }

    return try result.toOwnedSlice();
}

/// Convert option name to camelCase
pub fn camelcaseOptionName(allocator: std.mem.Allocator, name: []const u8) ![]const u8 {
    // Split by '.' and only camelcase the first part
    if (std.mem.indexOfScalar(u8, name, '.')) |dot_index| {
        const first_part = name[0..dot_index];
        const rest = name[dot_index..];
        const camelcased = try camelcase(allocator, first_part);
        defer allocator.free(camelcased);

        const result = try std.fmt.allocPrint(allocator, "{s}{s}", .{ camelcased, rest });
        return result;
    }

    return try camelcase(allocator, name);
}

/// Find the longest string in an array
pub fn findLongest(strings: []const []const u8) usize {
    var max_len: usize = 0;
    for (strings) |s| {
        if (s.len > max_len) {
            max_len = s.len;
        }
    }
    return max_len;
}

/// Pad a string to the right with spaces
pub fn padRight(allocator: std.mem.Allocator, str: []const u8, length: usize) ![]const u8 {
    if (str.len >= length) {
        return try allocator.dupe(u8, str);
    }

    const result = try allocator.alloc(u8, length);
    @memcpy(result[0..str.len], str);
    @memset(result[str.len..], ' ');

    return result;
}

/// Get filename from path
pub fn getFileName(allocator: std.mem.Allocator, path: []const u8) ![]const u8 {
    var i = path.len;
    while (i > 0) {
        i -= 1;
        if (path[i] == '/' or path[i] == '\\') {
            return try allocator.dupe(u8, path[i + 1 ..]);
        }
    }
    return try allocator.dupe(u8, path);
}

/// Custom error type for Clapp
pub const ClappError = error{
    MissingRequiredArgs,
    UnknownOption,
    MissingOptionValue,
};

/// Check if unicode is supported in the terminal
pub fn isUnicodeSupported() bool {
    // On Unix-like systems, check environment variables
    if (std.builtin.os.tag != .windows) {
        // Most modern Unix terminals support unicode
        return true;
    }

    // On Windows, check for Windows Terminal or other modern terminals
    const env_map = std.process.getEnvMap(std.heap.page_allocator) catch return false;
    defer env_map.deinit();

    if (env_map.get("WT_SESSION")) |_| return true;
    if (env_map.get("TERMINUS_SUBLIME")) |_| return true;

    return false;
}

/// Line-by-line diff result
pub const DiffLine = struct {
    line: []const u8,
    type: enum { added, removed, unchanged },
};

/// Compare two strings line by line
pub fn diffLines(allocator: std.mem.Allocator, old: []const u8, new: []const u8) ![]DiffLine {
    var result = std.ArrayList(DiffLine).init(allocator);
    errdefer result.deinit();

    var old_lines = std.mem.splitScalar(u8, old, '\n');
    var new_lines = std.mem.splitScalar(u8, new, '\n');

    var old_list = std.ArrayList([]const u8).init(allocator);
    defer old_list.deinit();
    var new_list = std.ArrayList([]const u8).init(allocator);
    defer new_list.deinit();

    while (old_lines.next()) |line| {
        try old_list.append(line);
    }
    while (new_lines.next()) |line| {
        try new_list.append(line);
    }

    // Simple diff algorithm: find matching and non-matching lines
    var i: usize = 0;
    var j: usize = 0;

    while (i < old_list.items.len or j < new_list.items.len) {
        if (i >= old_list.items.len) {
            // Only new lines left
            try result.append(.{
                .line = try allocator.dupe(u8, new_list.items[j]),
                .type = .added,
            });
            j += 1;
        } else if (j >= new_list.items.len) {
            // Only old lines left
            try result.append(.{
                .line = try allocator.dupe(u8, old_list.items[i]),
                .type = .removed,
            });
            i += 1;
        } else if (std.mem.eql(u8, old_list.items[i], new_list.items[j])) {
            // Lines match
            try result.append(.{
                .line = try allocator.dupe(u8, old_list.items[i]),
                .type = .unchanged,
            });
            i += 1;
            j += 1;
        } else {
            // Lines don't match - mark as removed and added
            try result.append(.{
                .line = try allocator.dupe(u8, old_list.items[i]),
                .type = .removed,
            });
            try result.append(.{
                .line = try allocator.dupe(u8, new_list.items[j]),
                .type = .added,
            });
            i += 1;
            j += 1;
        }
    }

    return result.toOwnedSlice();
}

/// Free diff result
pub fn freeDiffLines(allocator: std.mem.Allocator, lines: []DiffLine) void {
    for (lines) |line| {
        allocator.free(line.line);
    }
    allocator.free(lines);
}

test "removeBrackets" {
    const allocator = std.testing.allocator;

    const result1 = try removeBrackets(allocator, "command <arg>");
    defer allocator.free(result1);
    try std.testing.expectEqualStrings("command", result1);

    const result2 = try removeBrackets(allocator, "test [optional]");
    defer allocator.free(result2);
    try std.testing.expectEqualStrings("test", result2);
}

test "camelcase" {
    const allocator = std.testing.allocator;

    const result = try camelcase(allocator, "foo-bar");
    defer allocator.free(result);
    try std.testing.expectEqualStrings("fooBar", result);
}

test "findLongest" {
    const strings = [_][]const u8{ "short", "medium-length", "x" };
    const result = findLongest(&strings);
    try std.testing.expectEqual(@as(usize, 13), result);
}

test "diffLines - simple changes" {
    const allocator = std.testing.allocator;

    const old = "line1\nline2\nline3";
    const new = "line1\nmodified\nline3";

    const diff = try diffLines(allocator, old, new);
    defer freeDiffLines(allocator, diff);

    try std.testing.expect(diff.len == 4);
    try std.testing.expect(diff[0].type == .unchanged);
    try std.testing.expect(diff[1].type == .removed);
    try std.testing.expect(diff[2].type == .added);
    try std.testing.expect(diff[3].type == .unchanged);
}

test "diffLines - additions" {
    const allocator = std.testing.allocator;

    const old = "line1\nline2";
    const new = "line1\nline2\nline3";

    const diff = try diffLines(allocator, old, new);
    defer freeDiffLines(allocator, diff);

    try std.testing.expect(diff.len == 3);
    try std.testing.expect(diff[2].type == .added);
}

test "diffLines - deletions" {
    const allocator = std.testing.allocator;

    const old = "line1\nline2\nline3";
    const new = "line1\nline2";

    const diff = try diffLines(allocator, old, new);
    defer freeDiffLines(allocator, diff);

    try std.testing.expect(diff.len == 3);
    try std.testing.expect(diff[2].type == .removed);
}

test "diffLines - empty strings" {
    const allocator = std.testing.allocator;

    const old = "";
    const new = "";

    const diff = try diffLines(allocator, old, new);
    defer freeDiffLines(allocator, diff);

    try std.testing.expect(diff.len == 0);
}

test "diffLines - one empty" {
    const allocator = std.testing.allocator;

    const old = "";
    const new = "line1\nline2";

    const diff = try diffLines(allocator, old, new);
    defer freeDiffLines(allocator, diff);

    try std.testing.expect(diff.len == 2);
    try std.testing.expect(diff[0].type == .added);
    try std.testing.expect(diff[1].type == .added);
}

test "camelcaseOptionName with dot notation" {
    const allocator = std.testing.allocator;

    const result = try camelcaseOptionName(allocator, "env-var.NODE_ENV");
    defer allocator.free(result);
    try std.testing.expectEqualStrings("envVar.NODE_ENV", result);
}

test "padRight - exact length" {
    const allocator = std.testing.allocator;

    const result = try padRight(allocator, "test", 4);
    defer allocator.free(result);
    try std.testing.expectEqualStrings("test", result);
}

test "padRight - longer than target" {
    const allocator = std.testing.allocator;

    const result = try padRight(allocator, "testing", 4);
    defer allocator.free(result);
    try std.testing.expectEqualStrings("testing", result);
}

test "padRight - shorter than target" {
    const allocator = std.testing.allocator;

    const result = try padRight(allocator, "hi", 6);
    defer allocator.free(result);
    try std.testing.expectEqual(@as(usize, 6), result.len);
    try std.testing.expect(std.mem.startsWith(u8, result, "hi"));
}
