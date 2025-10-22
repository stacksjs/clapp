const std = @import("std");
const style = @import("style.zig");

/// Spinner animation frames
pub const SpinnerFrames = struct {
    frames: []const []const u8,
    interval_ms: u64 = 80,
};

/// Default spinner styles
pub const spinner_styles = struct {
    pub const dots = SpinnerFrames{
        .frames = &[_][]const u8{ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" },
    };

    pub const line = SpinnerFrames{
        .frames = &[_][]const u8{ "-", "\\", "|", "/" },
    };

    pub const circle = SpinnerFrames{
        .frames = &[_][]const u8{ "◐", "◓", "◑", "◒" },
    };

    pub const arrow = SpinnerFrames{
        .frames = &[_][]const u8{ "←", "↖", "↑", "↗", "→", "↘", "↓", "↙" },
    };

    pub const box = SpinnerFrames{
        .frames = &[_][]const u8{ "◰", "◳", "◲", "◱" },
    };

    pub const bounce = SpinnerFrames{
        .frames = &[_][]const u8{ "⠁", "⠂", "⠄", "⠂" },
    };
};

/// Spinner state
pub const Spinner = struct {
    allocator: std.mem.Allocator,
    message: []const u8,
    frames: SpinnerFrames,
    current_frame: usize = 0,
    running: bool = false,
    thread: ?std.Thread = null,
    mutex: std.Thread.Mutex = .{},

    pub fn init(allocator: std.mem.Allocator, message: []const u8, frames: SpinnerFrames) !Spinner {
        return Spinner{
            .allocator = allocator,
            .message = try allocator.dupe(u8, message),
            .frames = frames,
        };
    }

    pub fn deinit(self: *Spinner) void {
        self.stop();
        self.allocator.free(self.message);
    }

    /// Start the spinner
    pub fn start(self: *Spinner) !void {
        self.mutex.lock();
        defer self.mutex.unlock();

        if (self.running) return;
        self.running = true;

        // Hide cursor
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\x1B[?25l");

        self.thread = try std.Thread.spawn(.{}, runSpinner, .{self});
    }

    /// Stop the spinner
    pub fn stop(self: *Spinner) void {
        self.mutex.lock();
        self.running = false;
        self.mutex.unlock();

        if (self.thread) |thread| {
            thread.join();
            self.thread = null;
        }

        // Show cursor
        const stdout = std.io.getStdOut().writer();
        stdout.writeAll("\x1B[?25h") catch {};

        // Clear line
        stdout.writeAll("\r\x1B[K") catch {};
    }

    /// Update spinner message
    pub fn updateMessage(self: *Spinner, message: []const u8) !void {
        self.mutex.lock();
        defer self.mutex.unlock();

        self.allocator.free(self.message);
        self.message = try self.allocator.dupe(u8, message);
    }

    /// Finish with success message
    pub fn success(self: *Spinner, message: []const u8) !void {
        self.stop();
        const stdout = std.io.getStdOut().writer();
        const msg = try style.success(self.allocator, message);
        defer self.allocator.free(msg);
        try stdout.print("✓ {s}\n", .{msg});
    }

    /// Finish with error message
    pub fn fail(self: *Spinner, message: []const u8) !void {
        self.stop();
        const stdout = std.io.getStdOut().writer();
        const msg = try style.err(self.allocator, message);
        defer self.allocator.free(msg);
        try stdout.print("✗ {s}\n", .{msg});
    }

    /// Finish with warning message
    pub fn warn(self: *Spinner, message: []const u8) !void {
        self.stop();
        const stdout = std.io.getStdOut().writer();
        const msg = try style.warning(self.allocator, message);
        defer self.allocator.free(msg);
        try stdout.print("⚠ {s}\n", .{msg});
    }

    /// Finish with info message
    pub fn info(self: *Spinner, message: []const u8) !void {
        self.stop();
        const stdout = std.io.getStdOut().writer();
        const msg = try style.info(self.allocator, message);
        defer self.allocator.free(msg);
        try stdout.print("ℹ {s}\n", .{msg});
    }

    fn runSpinner(self: *Spinner) void {
        const stdout = std.io.getStdOut().writer();

        while (true) {
            self.mutex.lock();
            if (!self.running) {
                self.mutex.unlock();
                break;
            }

            const frame = self.frames.frames[self.current_frame];
            const message = self.message;
            self.current_frame = (self.current_frame + 1) % self.frames.frames.len;
            self.mutex.unlock();

            // Print spinner frame and message
            const frame_styled = style.cyan(self.allocator, frame) catch break;
            defer self.allocator.free(frame_styled);

            stdout.print("\r{s} {s}", .{ frame_styled, message }) catch break;

            // Wait for next frame
            std.time.sleep(self.frames.interval_ms * std.time.ns_per_ms);
        }
    }
};

/// Progress bar
pub const ProgressBar = struct {
    allocator: std.mem.Allocator,
    total: usize,
    current: usize = 0,
    width: usize = 40,
    show_percentage: bool = true,
    show_count: bool = true,

    pub fn init(allocator: std.mem.Allocator, total: usize) ProgressBar {
        return ProgressBar{
            .allocator = allocator,
            .total = total,
        };
    }

    /// Update progress
    pub fn update(self: *ProgressBar, current: usize) !void {
        self.current = current;
        try self.render();
    }

    /// Increment progress by 1
    pub fn increment(self: *ProgressBar) !void {
        self.current = @min(self.current + 1, self.total);
        try self.render();
    }

    /// Finish the progress bar
    pub fn finish(self: *ProgressBar) !void {
        self.current = self.total;
        try self.render();
        const stdout = std.io.getStdOut().writer();
        try stdout.writeAll("\n");
    }

    fn render(self: *ProgressBar) !void {
        const stdout = std.io.getStdOut().writer();

        const percentage = if (self.total > 0)
            @as(f64, @floatFromInt(self.current)) / @as(f64, @floatFromInt(self.total))
        else
            0.0;

        const filled = @as(usize, @intFromFloat(percentage * @as(f64, @floatFromInt(self.width))));
        const empty = self.width - filled;

        // Build progress bar
        try stdout.writeAll("\r[");

        const filled_str = try style.green(self.allocator, "█");
        defer self.allocator.free(filled_str);
        var i: usize = 0;
        while (i < filled) : (i += 1) {
            try stdout.writeAll("█");
        }

        const empty_str = try style.dim(self.allocator, "░");
        defer self.allocator.free(empty_str);
        i = 0;
        while (i < empty) : (i += 1) {
            try stdout.writeAll("░");
        }

        try stdout.writeAll("]");

        if (self.show_percentage) {
            const pct = @as(usize, @intFromFloat(percentage * 100.0));
            try stdout.print(" {d}%", .{pct});
        }

        if (self.show_count) {
            try stdout.print(" ({d}/{d})", .{ self.current, self.total });
        }
    }
};

/// Task status
pub const TaskStatus = enum {
    pending,
    running,
    success,
    error_status,
    warning,
    skipped,
};

/// Task item
pub const Task = struct {
    title: []const u8,
    status: TaskStatus = .pending,
};

/// Task list for showing multiple task statuses
pub const TaskList = struct {
    allocator: std.mem.Allocator,
    tasks: std.ArrayList(Task),

    pub fn init(allocator: std.mem.Allocator) TaskList {
        return TaskList{
            .allocator = allocator,
            .tasks = std.ArrayList(Task).init(allocator),
        };
    }

    pub fn deinit(self: *TaskList) void {
        for (self.tasks.items) |task| {
            self.allocator.free(task.title);
        }
        self.tasks.deinit();
    }

    /// Add a task
    pub fn add(self: *TaskList, title: []const u8) !void {
        const task = Task{
            .title = try self.allocator.dupe(u8, title),
            .status = .pending,
        };
        try self.tasks.append(task);
        try self.render();
    }

    /// Update task status
    pub fn updateStatus(self: *TaskList, index: usize, status: TaskStatus) !void {
        if (index >= self.tasks.items.len) return error.InvalidIndex;
        self.tasks.items[index].status = status;
        try self.render();
    }

    /// Render the task list
    fn render(self: *TaskList) !void {
        const stdout = std.io.getStdOut().writer();

        // Move cursor up to overwrite previous output
        if (self.tasks.items.len > 0) {
            try stdout.print("\x1B[{d}A", .{self.tasks.items.len});
        }

        for (self.tasks.items) |task| {
            const symbol = switch (task.status) {
                .pending => "○",
                .running => "◐",
                .success => "✓",
                .error_status => "✗",
                .warning => "⚠",
                .skipped => "–",
            };

            const symbol_styled = switch (task.status) {
                .pending => try style.dim(self.allocator, symbol),
                .running => try style.cyan(self.allocator, symbol),
                .success => try style.success(self.allocator, symbol),
                .error_status => try style.err(self.allocator, symbol),
                .warning => try style.warning(self.allocator, symbol),
                .skipped => try style.muted(self.allocator, symbol),
            };
            defer self.allocator.free(symbol_styled);

            try stdout.print("\r{s} {s}\x1B[K\n", .{ symbol_styled, task.title });
        }
    }
};

test "progress bar" {
    const allocator = std.testing.allocator;
    var bar = ProgressBar.init(allocator, 100);

    try bar.update(50);
    try std.testing.expectEqual(@as(usize, 50), bar.current);
}

test "task list" {
    const allocator = std.testing.allocator;
    var list = TaskList.init(allocator);
    defer list.deinit();

    try list.add("Task 1");
    try list.add("Task 2");

    try std.testing.expectEqual(@as(usize, 2), list.tasks.items.len);
}
