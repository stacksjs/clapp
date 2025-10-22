const std = @import("std");
const CLI = @import("cli.zig").CLI;

/// Mock input/output streams for testing
pub const MockStreams = struct {
    stdin_buffer: std.ArrayList(u8),
    stdout_buffer: std.ArrayList(u8),
    stderr_buffer: std.ArrayList(u8),
    stdin_pos: usize = 0,

    pub fn init(allocator: std.mem.Allocator) MockStreams {
        return MockStreams{
            .stdin_buffer = std.ArrayList(u8).init(allocator),
            .stdout_buffer = std.ArrayList(u8).init(allocator),
            .stderr_buffer = std.ArrayList(u8).init(allocator),
        };
    }

    pub fn deinit(self: *MockStreams) void {
        self.stdin_buffer.deinit();
        self.stdout_buffer.deinit();
        self.stderr_buffer.deinit();
    }

    /// Add input to stdin buffer
    pub fn addInput(self: *MockStreams, input: []const u8) !void {
        try self.stdin_buffer.appendSlice(input);
        try self.stdin_buffer.append('\n');
    }

    /// Get stdout output
    pub fn getStdout(self: *const MockStreams) []const u8 {
        return self.stdout_buffer.items;
    }

    /// Get stderr output
    pub fn getStderr(self: *const MockStreams) []const u8 {
        return self.stderr_buffer.items;
    }

    /// Clear all buffers
    pub fn clear(self: *MockStreams) void {
        self.stdin_buffer.clearRetainingCapacity();
        self.stdout_buffer.clearRetainingCapacity();
        self.stderr_buffer.clearRetainingCapacity();
        self.stdin_pos = 0;
    }
};

/// Test context for CLI testing
pub const TestContext = struct {
    allocator: std.mem.Allocator,
    streams: MockStreams,
    cli: CLI,
    exit_code: i32 = 0,

    pub fn init(allocator: std.mem.Allocator, cli_name: []const u8) !TestContext {
        return TestContext{
            .allocator = allocator,
            .streams = MockStreams.init(allocator),
            .cli = try CLI.init(allocator, cli_name),
        };
    }

    pub fn deinit(self: *TestContext) void {
        self.streams.deinit();
        self.cli.deinit();
    }

    /// Execute command with arguments
    pub fn exec(self: *TestContext, args: []const []const u8) !ExecResult {
        const start_time = std.time.milliTimestamp();

        // Parse and run
        _ = try self.cli.parse(args, .{ .run = true });

        const end_time = std.time.milliTimestamp();

        return ExecResult{
            .stdout = try self.allocator.dupe(u8, self.streams.getStdout()),
            .stderr = try self.allocator.dupe(u8, self.streams.getStderr()),
            .exit_code = self.exit_code,
            .duration_ms = @as(u64, @intCast(end_time - start_time)),
        };
    }
};

/// Result from executing a command
pub const ExecResult = struct {
    stdout: []const u8,
    stderr: []const u8,
    exit_code: i32,
    duration_ms: u64,

    pub fn deinit(self: *ExecResult, allocator: std.mem.Allocator) void {
        allocator.free(self.stdout);
        allocator.free(self.stderr);
    }

    /// Check if stdout contains text
    pub fn stdoutContains(self: *const ExecResult, text: []const u8) bool {
        return std.mem.indexOf(u8, self.stdout, text) != null;
    }

    /// Check if stderr contains text
    pub fn stderrContains(self: *const ExecResult, text: []const u8) bool {
        return std.mem.indexOf(u8, self.stderr, text) != null;
    }

    /// Check if command was successful
    pub fn isSuccess(self: *const ExecResult) bool {
        return self.exit_code == 0;
    }
};

/// Prompt response map for mocking prompts
pub const PromptResponses = std.StringHashMap([]const u8);

var mock_responses: ?PromptResponses = null;

/// Mock user responses to prompts
pub fn mockPrompt(allocator: std.mem.Allocator, responses: anytype) !void {
    var map = PromptResponses.init(allocator);

    inline for (@typeInfo(@TypeOf(responses)).Struct.fields) |field| {
        const value = @field(responses, field.name);
        const value_str = try std.fmt.allocPrint(allocator, "{any}", .{value});
        try map.put(field.name, value_str);
    }

    mock_responses = map;
}

/// Get mocked response for a prompt
pub fn getMockResponse(prompt: []const u8) ?[]const u8 {
    if (mock_responses) |*responses| {
        return responses.get(prompt);
    }
    return null;
}

/// Reset mock prompt responses
pub fn resetMockPrompts(allocator: std.mem.Allocator) void {
    if (mock_responses) |*responses| {
        var iter = responses.valueIterator();
        while (iter.next()) |value| {
            allocator.free(value.*);
        }
        responses.deinit();
        mock_responses = null;
    }
}

/// Create a temporary directory for testing
pub fn createTempDir(allocator: std.mem.Allocator) ![]const u8 {
    const tmp_dir = std.fs.cwd();
    const dir_name = try std.fmt.allocPrint(allocator, "clapp-test-{d}", .{std.time.milliTimestamp()});
    defer allocator.free(dir_name);

    try tmp_dir.makeDir(dir_name);

    const full_path = try tmp_dir.realpathAlloc(allocator, dir_name);
    return full_path;
}

/// Remove a directory recursively
pub fn removeTempDir(path: []const u8) !void {
    try std.fs.cwd().deleteTree(path);
}

/// Create a file in a directory
pub fn createFile(dir_path: []const u8, file_name: []const u8, content: []const u8) !void {
    const dir = try std.fs.cwd().openDir(dir_path, .{});
    const file = try dir.createFile(file_name, .{});
    defer file.close();

    try file.writeAll(content);
}

/// Assertion helpers
pub const Expect = struct {
    /// Expect strings to be equal
    pub fn equal(actual: []const u8, expected: []const u8) !void {
        if (!std.mem.eql(u8, actual, expected)) {
            std.debug.print("\nExpected: {s}\nActual: {s}\n", .{ expected, actual });
            return error.AssertionFailed;
        }
    }

    /// Expect string to contain substring
    pub fn contains(haystack: []const u8, needle: []const u8) !void {
        if (std.mem.indexOf(u8, haystack, needle) == null) {
            std.debug.print("\nExpected to contain: {s}\nActual: {s}\n", .{ needle, haystack });
            return error.AssertionFailed;
        }
    }

    /// Expect string to not contain substring
    pub fn notContains(haystack: []const u8, needle: []const u8) !void {
        if (std.mem.indexOf(u8, haystack, needle) != null) {
            std.debug.print("\nExpected to not contain: {s}\nActual: {s}\n", .{ needle, haystack });
            return error.AssertionFailed;
        }
    }

    /// Expect value to be true
    pub fn isTrue(value: bool) !void {
        if (!value) {
            std.debug.print("\nExpected: true\nActual: false\n", .{});
            return error.AssertionFailed;
        }
    }

    /// Expect value to be false
    pub fn isFalse(value: bool) !void {
        if (value) {
            std.debug.print("\nExpected: false\nActual: true\n", .{});
            return error.AssertionFailed;
        }
    }
};

test "mock streams" {
    const allocator = std.testing.allocator;

    var streams = MockStreams.init(allocator);
    defer streams.deinit();

    try streams.addInput("test input");
    try std.testing.expectEqual(@as(usize, 11), streams.stdin_buffer.items.len);
}

test "test context" {
    const allocator = std.testing.allocator;

    var ctx = try TestContext.init(allocator, "test-cli");
    defer ctx.deinit();

    try std.testing.expectEqualStrings("test-cli", ctx.cli.name);
}

test "expect helpers" {
    try Expect.equal("hello", "hello");
    try Expect.contains("hello world", "world");
    try Expect.isTrue(true);
    try Expect.isFalse(false);
}
