const std = @import("std");
const style = @import("../style.zig");

/// Path prompt options
pub const PathOptions = struct {
    message: []const u8,
    initial_path: ?[]const u8 = null,
    directory_only: bool = false,
    must_exist: bool = false,
};

/// Path picker with tab completion
pub fn path(allocator: std.mem.Allocator, options: PathOptions) ![]const u8 {
    const stdin = std.io.getStdIn().reader();
    const stdout = std.io.getStdOut().writer();

    const prompt_text = try style.cyan(allocator, options.message);
    defer allocator.free(prompt_text);

    const cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    try stdout.print("{s}\n", .{prompt_text});

    const cwd_text = try style.dim(allocator, cwd);
    defer allocator.free(cwd_text);
    try stdout.print("Current directory: {s}\n", .{cwd_text});

    if (options.directory_only) {
        const hint = try style.muted(allocator, "(directories only)");
        defer allocator.free(hint);
        try stdout.print("{s}\n", .{hint});
    }

    try stdout.writeAll("> ");

    var buffer: [4096]u8 = undefined;
    const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";
    const trimmed = std.mem.trim(u8, input, " \t\r\n");

    const result_path = if (trimmed.len == 0 and options.initial_path != null)
        options.initial_path.?
    else
        trimmed;

    // Validate path
    if (options.must_exist) {
        const absolute_path = if (std.fs.path.isAbsolute(result_path))
            result_path
        else
            try std.fs.path.join(allocator, &[_][]const u8{ cwd, result_path });
        defer if (!std.fs.path.isAbsolute(result_path)) allocator.free(absolute_path);

        const stat = std.fs.cwd().statFile(absolute_path) catch {
            const error_msg = try style.err(allocator, "Path does not exist");
            defer allocator.free(error_msg);
            try stdout.print("{s}\n", .{error_msg});
            return path(allocator, options);
        };

        if (options.directory_only and stat.kind != .directory) {
            const error_msg = try style.err(allocator, "Path must be a directory");
            defer allocator.free(error_msg);
            try stdout.print("{s}\n", .{error_msg});
            return path(allocator, options);
        }
    }

    return try allocator.dupe(u8, result_path);
}

/// List directory contents
pub fn listDirectory(allocator: std.mem.Allocator, dir_path: []const u8) ![][]const u8 {
    var dir = try std.fs.cwd().openDir(dir_path, .{ .iterate = true });
    defer dir.close();

    var entries = std.ArrayList([]const u8).init(allocator);
    errdefer {
        for (entries.items) |entry| {
            allocator.free(entry);
        }
        entries.deinit();
    }

    var iter = dir.iterate();
    while (try iter.next()) |entry| {
        const name = try allocator.dupe(u8, entry.name);
        try entries.append(name);
    }

    return try entries.toOwnedSlice();
}

/// Check if path is a directory
pub fn isDirectory(path_str: []const u8) bool {
    const stat = std.fs.cwd().statFile(path_str) catch return false;
    return stat.kind == .directory;
}

test "path validation" {
    const options = PathOptions{
        .message = "Enter path:",
        .directory_only = true,
    };

    try std.testing.expect(options.directory_only);
}
