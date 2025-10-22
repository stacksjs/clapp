const std = @import("std");
const style = @import("style.zig");
const suggestions = @import("suggestions.zig");

/// Enhanced error types
pub const ClappError = error{
    // Argument errors
    MissingRequiredArgs,
    TooManyArgs,
    InvalidArgument,

    // Option errors
    UnknownOption,
    MissingOptionValue,
    InvalidOptionValue,
    DuplicateOption,

    // Command errors
    UnknownCommand,
    CommandNotFound,
    AmbiguousCommand,

    // Config errors
    InvalidConfig,
    ConfigNotFound,
    UnsupportedFormat,

    // General errors
    ValidationFailed,
    ExecutionFailed,
    Cancelled,
};

/// Error context with additional information
pub const ErrorContext = struct {
    allocator: std.mem.Allocator,
    error_type: ClappError,
    message: []const u8,
    suggestions_list: ?[][]const u8 = null,
    hint: ?[]const u8 = null,
    code_snippet: ?[]const u8 = null,

    pub fn init(allocator: std.mem.Allocator, error_type: ClappError, message: []const u8) !ErrorContext {
        return ErrorContext{
            .allocator = allocator,
            .error_type = error_type,
            .message = try allocator.dupe(u8, message),
        };
    }

    pub fn deinit(self: *ErrorContext) void {
        self.allocator.free(self.message);

        if (self.suggestions_list) |sug_list| {
            self.allocator.free(sug_list);
        }

        if (self.hint) |h| {
            self.allocator.free(h);
        }

        if (self.code_snippet) |snippet| {
            self.allocator.free(snippet);
        }
    }

    /// Add suggestions to the error
    pub fn withSuggestions(self: *ErrorContext, sug_list: [][]const u8) void {
        self.suggestions_list = sug_list;
    }

    /// Add a hint to the error
    pub fn withHint(self: *ErrorContext, hint: []const u8) !void {
        self.hint = try self.allocator.dupe(u8, hint);
    }

    /// Add a code snippet to the error
    pub fn withCodeSnippet(self: *ErrorContext, snippet: []const u8) !void {
        self.code_snippet = try self.allocator.dupe(u8, snippet);
    }

    /// Display the error with formatting
    pub fn display(self: *const ErrorContext) !void {
        const stderr = std.io.getStdErr().writer();

        // Error header
        const error_label = try style.err(self.allocator, "Error");
        defer self.allocator.free(error_label);

        const error_name = @errorName(self.error_type);
        const error_name_styled = try style.bold(self.allocator, error_name);
        defer self.allocator.free(error_name_styled);

        try stderr.print("\n{s}: {s}\n", .{ error_label, error_name_styled });

        // Error message
        const message_styled = try style.dim(self.allocator, self.message);
        defer self.allocator.free(message_styled);
        try stderr.print("  {s}\n\n", .{message_styled});

        // Code snippet if available
        if (self.code_snippet) |snippet| {
            const snippet_header = try style.muted(self.allocator, "Code:");
            defer self.allocator.free(snippet_header);
            try stderr.print("{s}\n", .{snippet_header});

            const snippet_styled = try style.dim(self.allocator, snippet);
            defer self.allocator.free(snippet_styled);
            try stderr.print("  {s}\n\n", .{snippet_styled});
        }

        // Suggestions if available
        if (self.suggestions_list) |sug_list| {
            if (sug_list.len > 0) {
                const did_you_mean = try style.cyan(self.allocator, "Did you mean:");
                defer self.allocator.free(did_you_mean);
                try stderr.print("{s}\n", .{did_you_mean});

                for (sug_list) |suggestion| {
                    const suggestion_styled = try style.green(self.allocator, suggestion);
                    defer self.allocator.free(suggestion_styled);
                    try stderr.print("  • {s}\n", .{suggestion_styled});
                }
                try stderr.writeAll("\n");
            }
        }

        // Hint if available
        if (self.hint) |h| {
            const hint_label = try style.info(self.allocator, "Hint:");
            defer self.allocator.free(hint_label);

            const hint_styled = try style.dim(self.allocator, h);
            defer self.allocator.free(hint_styled);

            try stderr.print("{s} {s}\n\n", .{ hint_label, hint_styled });
        }
    }
};

/// Create an error for unknown command
pub fn unknownCommand(
    allocator: std.mem.Allocator,
    command: []const u8,
    available_commands: []const []const u8,
) !ErrorContext {
    const message = try std.fmt.allocPrint(
        allocator,
        "Unknown command '{s}'",
        .{command},
    );
    defer allocator.free(message);

    var ctx = try ErrorContext.init(allocator, ClappError.UnknownCommand, message);

    // Add suggestions
    const sug_list = try suggestions.findSuggestions(allocator, command, available_commands, 3);
    ctx.withSuggestions(sug_list);

    // Add hint
    try ctx.withHint("Run with --help to see available commands");

    return ctx;
}

/// Create an error for unknown option
pub fn unknownOption(
    allocator: std.mem.Allocator,
    option: []const u8,
    available_options: []const []const u8,
) !ErrorContext {
    const message = try std.fmt.allocPrint(
        allocator,
        "Unknown option '{s}'",
        .{option},
    );
    defer allocator.free(message);

    var ctx = try ErrorContext.init(allocator, ClappError.UnknownOption, message);

    // Add suggestions
    const sug_list = try suggestions.findSuggestions(allocator, option, available_options, 3);
    ctx.withSuggestions(sug_list);

    return ctx;
}

/// Create an error for missing required arguments
pub fn missingRequiredArgs(
    allocator: std.mem.Allocator,
    command_name: []const u8,
    required_count: usize,
    provided_count: usize,
) !ErrorContext {
    const message = try std.fmt.allocPrint(
        allocator,
        "Command '{s}' requires {d} argument(s), but {d} were provided",
        .{ command_name, required_count, provided_count },
    );
    defer allocator.free(message);

    var ctx = try ErrorContext.init(allocator, ClappError.MissingRequiredArgs, message);

    try ctx.withHint("Check the command usage with --help");

    return ctx;
}

/// Create an error for missing option value
pub fn missingOptionValue(
    allocator: std.mem.Allocator,
    option: []const u8,
) !ErrorContext {
    const message = try std.fmt.allocPrint(
        allocator,
        "Option '{s}' requires a value",
        .{option},
    );
    defer allocator.free(message);

    var ctx = try ErrorContext.init(allocator, ClappError.MissingOptionValue, message);

    const example = try std.fmt.allocPrint(allocator, "--{s} <value>", .{option});
    try ctx.withCodeSnippet(example);

    return ctx;
}

/// Create an error for validation failure
pub fn validationFailed(
    allocator: std.mem.Allocator,
    field: []const u8,
    reason: []const u8,
) !ErrorContext {
    const message = try std.fmt.allocPrint(
        allocator,
        "Validation failed for '{s}': {s}",
        .{ field, reason },
    );
    defer allocator.free(message);

    return try ErrorContext.init(allocator, ClappError.ValidationFailed, message);
}

/// Pretty print an error to stderr
pub fn displayError(allocator: std.mem.Allocator, err: anyerror, message: []const u8) !void {
    const stderr = std.io.getStdErr().writer();

    const error_label = try style.err(allocator, "Error");
    defer allocator.free(error_label);

    const error_name = @errorName(err);
    const error_name_styled = try style.bold(allocator, error_name);
    defer allocator.free(error_name_styled);

    const message_styled = try style.dim(allocator, message);
    defer allocator.free(message_styled);

    try stderr.print("\n{s}: {s}\n", .{ error_label, error_name_styled });
    try stderr.print("  {s}\n\n", .{message_styled});
}

test "error context creation" {
    const allocator = std.testing.allocator;

    var ctx = try ErrorContext.init(allocator, ClappError.UnknownCommand, "test error");
    defer ctx.deinit();

    try std.testing.expectEqualStrings("test error", ctx.message);
}

test "unknown command error" {
    const allocator = std.testing.allocator;

    const commands = [_][]const u8{ "build", "test", "deploy" };
    var ctx = try unknownCommand(allocator, "biuld", &commands);
    defer ctx.deinit();

    try std.testing.expect(ctx.suggestions_list != null);
    try std.testing.expect(ctx.hint != null);
}
