const std = @import("std");

/// Argument configuration for commands
pub const CommandArg = struct {
    required: bool,
    value: []const u8,
    variadic: bool,
};

/// Configuration for command behavior
pub const CommandConfig = struct {
    allow_unknown_options: bool = false,
    ignore_option_default_value: bool = false,
};

/// Configuration for options
pub const OptionConfig = struct {
    default: ?[]const u8 = null,
};

/// Parsed command line arguments
pub const ParsedArgv = struct {
    args: std.ArrayList([]const u8),
    options: std.StringHashMap([]const u8),

    pub fn deinit(self: *ParsedArgv) void {
        self.args.deinit();
        self.options.deinit();
    }
};

/// Help section structure
pub const HelpSection = struct {
    title: ?[]const u8 = null,
    body: []const u8,
};

/// Command example type
pub const CommandExample = union(enum) {
    string: []const u8,
    function: *const fn ([]const u8) []const u8,
};

/// Parse options for CLI
pub const ParseOptions = struct {
    run: bool = true,
};
