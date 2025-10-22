const std = @import("std");
const style = @import("style.zig");
const terminal = @import("terminal.zig");
const Spinner = @import("spinner.zig").Spinner;
const spinner_styles = @import("spinner.zig").spinner_styles;

/// Task function type
pub const TaskFn = *const fn (allocator: std.mem.Allocator) anyerror!void;

/// Task definition
pub const Task = struct {
    title: []const u8,
    enabled: bool = true,
    task_fn: TaskFn,
};

/// Task executor - runs a series of tasks with spinners
pub const TaskExecutor = struct {
    allocator: std.mem.Allocator,
    tasks: []const Task,

    pub fn init(allocator: std.mem.Allocator, tasks: []const Task) TaskExecutor {
        return TaskExecutor{
            .allocator = allocator,
            .tasks = tasks,
        };
    }

    /// Execute all enabled tasks
    pub fn run(self: *const TaskExecutor) !void {
        for (self.tasks) |task| {
            if (!task.enabled) {
                // Skip disabled tasks
                const skipped = try style.dim(self.allocator, "⊘ Skipped");
                defer self.allocator.free(skipped);
                std.debug.print("{s}: {s}\n", .{ task.title, skipped });
                continue;
            }

            var spinner = try Spinner.init(self.allocator, task.title, spinner_styles.dots);
            try spinner.start();

            // Execute task
            task.task_fn(self.allocator) catch |err| {
                try spinner.fail("Failed!");
                return err;
            };

            try spinner.success("Done!");
        }
    }
};

/// Task log entry
pub const TaskLogEntry = struct {
    level: Level,
    message: []const u8,

    pub const Level = enum {
        info,
        success,
        warn,
        @"error",
        step,
    };
};

/// Advanced task logger with buffering and grouping
pub const TaskLog = struct {
    allocator: std.mem.Allocator,
    title: []const u8,
    entries: std.ArrayList(TaskLogEntry),
    clear_on_success: bool = true,
    is_tty: bool,

    pub fn init(allocator: std.mem.Allocator, title: []const u8) TaskLog {
        const stdout = std.io.getStdOut();
        const is_tty = std.posix.isatty(stdout.handle);

        return TaskLog{
            .allocator = allocator,
            .title = try allocator.dupe(u8, title) catch unreachable,
            .entries = .{},
            .clear_on_success = true,
            .is_tty = is_tty,
        };
    }

    pub fn deinit(self: *TaskLog) void {
        self.allocator.free(self.title);
        for (self.entries.items) |entry| {
            self.allocator.free(entry.message);
        }
        self.entries.deinit(self.allocator);
    }

    /// Add info message to log
    pub fn info(self: *TaskLog, message: []const u8) !void {
        try self.entries.append(self.allocator, .{
            .level = .info,
            .message = try self.allocator.dupe(u8, message),
        });
    }

    /// Add success message to log
    pub fn success(self: *TaskLog, message: []const u8) !void {
        try self.entries.append(self.allocator, .{
            .level = .success,
            .message = try self.allocator.dupe(u8, message),
        });
    }

    /// Add warning message to log
    pub fn warn(self: *TaskLog, message: []const u8) !void {
        try self.entries.append(self.allocator, .{
            .level = .warn,
            .message = try self.allocator.dupe(u8, message),
        });
    }

    /// Add error message to log
    pub fn err(self: *TaskLog, message: []const u8) !void {
        try self.entries.append(self.allocator, .{
            .level = .@"error",
            .message = try self.allocator.dupe(u8, message),
        });
    }

    /// Add step message to log
    pub fn step(self: *TaskLog, message: []const u8) !void {
        try self.entries.append(self.allocator, .{
            .level = .step,
            .message = try self.allocator.dupe(u8, message),
        });
    }

    /// Flush log to output
    pub fn flush(self: *TaskLog, success_state: bool) !void {
        const stdout = std.io.getStdOut().writer();

        if (success_state and self.clear_on_success and self.is_tty) {
            // Clear log on success if TTY
            return;
        }

        // Print title
        const title_bold = try style.bold(self.allocator, self.title);
        defer self.allocator.free(title_bold);
        try stdout.print("\n{s}\n", .{title_bold});

        // Print all entries
        for (self.entries.items) |entry| {
            const symbol = switch (entry.level) {
                .info => if (terminal.isUnicodeSupported()) "ℹ" else "i",
                .success => if (terminal.isUnicodeSupported()) "✔" else "√",
                .warn => if (terminal.isUnicodeSupported()) "⚠" else "!",
                .@"error" => if (terminal.isUnicodeSupported()) "✖" else "x",
                .step => if (terminal.isUnicodeSupported()) "→" else ">",
            };

            const color = switch (entry.level) {
                .info => style.codes.blue,
                .success => style.codes.green,
                .warn => style.codes.yellow,
                .@"error" => style.codes.red,
                .step => style.codes.cyan,
            };

            const styled_symbol = try style.apply(self.allocator, symbol, color);
            defer self.allocator.free(styled_symbol);

            try stdout.print("  {s} {s}\n", .{ styled_symbol, entry.message });
        }

        try stdout.print("\n", .{});
    }

    /// Clear buffer
    pub fn clear(self: *TaskLog) void {
        for (self.entries.items) |entry| {
            self.allocator.free(entry.message);
        }
        self.entries.clearRetainingCapacity();
    }
};

test "task executor" {
    const allocator = std.testing.allocator;

    const task1 = Task{
        .title = "Task 1",
        .enabled = true,
        .task_fn = struct {
            fn run(alloc: std.mem.Allocator) !void {
                _ = alloc;
                // Simulate work
            }
        }.run,
    };

    const task2 = Task{
        .title = "Task 2",
        .enabled = false, // This should be skipped
        .task_fn = struct {
            fn run(alloc: std.mem.Allocator) !void {
                _ = alloc;
            }
        }.run,
    };

    const tasks = [_]Task{ task1, task2 };
    const executor = TaskExecutor.init(allocator, &tasks);

    // This should execute task1 and skip task2
    try executor.run();
}

test "task log" {
    const allocator = std.testing.allocator;

    var log = TaskLog.init(allocator, "Test Log");
    defer log.deinit();

    try log.info("Info message");
    try log.success("Success message");
    try log.warn("Warning message");
    try log.step("Step message");

    try std.testing.expect(log.entries.items.len == 4);

    // Flush the log
    try log.flush(false);

    // Clear the log
    log.clear();
    try std.testing.expect(log.entries.items.len == 0);
}
