const std = @import("std");
const types = @import("types.zig");
const utils = @import("utils.zig");
const Option = @import("option.zig").Option;

/// Action callback type for commands
pub const ActionFn = *const fn (args: []const []const u8, options: std.StringHashMap([]const u8)) anyerror!void;

/// Help callback type
pub const HelpCallback = *const fn (sections: []types.HelpSection) []types.HelpSection;

pub const Command = struct {
    allocator: std.mem.Allocator,
    /// Raw command name with arguments (e.g., "add <task>")
    raw_name: []const u8,
    /// Command description
    description: []const u8,
    /// Parsed command name (without arguments)
    name: []const u8,
    /// Command arguments
    args: std.ArrayList(types.CommandArg),
    /// Command options
    options: std.ArrayList(Option),
    /// Alias names
    alias_names: std.ArrayList([]const u8),
    /// Command action callback
    command_action: ?ActionFn,
    /// Usage text
    usage_text: ?[]const u8,
    /// Version number
    version_number: ?[]const u8,
    /// Examples
    examples: std.ArrayList(types.CommandExample),
    /// Help callback
    help_callback: ?HelpCallback,
    /// Configuration
    config: types.CommandConfig,
    /// Reference to CLI (stored as opaque pointer to avoid circular dependency)
    cli: ?*anyopaque,

    pub fn init(
        allocator: std.mem.Allocator,
        raw_name: []const u8,
        description: []const u8,
        config: types.CommandConfig,
    ) !Command {
        const name = try utils.removeBrackets(allocator, raw_name);
        const args = try utils.findAllBrackets(allocator, raw_name);

        return Command{
            .allocator = allocator,
            .raw_name = try allocator.dupe(u8, raw_name),
            .description = try allocator.dupe(u8, description),
            .name = name,
            .args = args,
            .options = std.ArrayList(Option).init(allocator),
            .alias_names = std.ArrayList([]const u8).init(allocator),
            .command_action = null,
            .usage_text = null,
            .version_number = null,
            .examples = std.ArrayList(types.CommandExample).init(allocator),
            .help_callback = null,
            .config = config,
            .cli = null,
        };
    }

    pub fn deinit(self: *Command) void {
        self.allocator.free(self.raw_name);
        self.allocator.free(self.description);
        self.allocator.free(self.name);

        for (self.args.items) |arg| {
            self.allocator.free(arg.value);
        }
        self.args.deinit();

        for (self.options.items) |*opt| {
            opt.deinit();
        }
        self.options.deinit();

        for (self.alias_names.items) |alias_name| {
            self.allocator.free(alias_name);
        }
        self.alias_names.deinit();

        if (self.usage_text) |text| {
            self.allocator.free(text);
        }

        if (self.version_number) |ver| {
            self.allocator.free(ver);
        }

        self.examples.deinit();
    }

    /// Set usage text for the command
    pub fn usage(self: *Command, text: []const u8) !void {
        if (self.usage_text) |old_text| {
            self.allocator.free(old_text);
        }
        self.usage_text = try self.allocator.dupe(u8, text);
    }

    /// Allow unknown options
    pub fn allowUnknownOptions(self: *Command) void {
        self.config.allow_unknown_options = true;
    }

    /// Ignore option default values
    pub fn ignoreOptionDefaultValue(self: *Command) void {
        self.config.ignore_option_default_value = true;
    }

    /// Set version number
    pub fn version(self: *Command, ver: []const u8, custom_flags: []const u8) !void {
        if (self.version_number) |old_version| {
            self.allocator.free(old_version);
        }
        self.version_number = try self.allocator.dupe(u8, ver);
        try self.option(custom_flags, "Display version number", .{});
    }

    /// Add an example
    pub fn example(self: *Command, ex: types.CommandExample) !void {
        try self.examples.append(ex);
    }

    /// Add an option to the command
    pub fn option(self: *Command, raw_name: []const u8, description: []const u8, config: types.OptionConfig) !void {
        const opt = try Option.init(self.allocator, raw_name, description, config);
        try self.options.append(opt);
    }

    /// Add an alias for the command
    pub fn alias(self: *Command, name: []const u8) !void {
        const alias_copy = try self.allocator.dupe(u8, name);
        try self.alias_names.append(alias_copy);
    }

    /// Set the action callback
    pub fn action(self: *Command, callback: ActionFn) void {
        self.command_action = callback;
    }

    /// Check if a command name matches this command
    pub fn isMatched(self: *const Command, name: []const u8) bool {
        if (std.mem.eql(u8, self.name, name)) {
            return true;
        }
        for (self.alias_names.items) |alias_name| {
            if (std.mem.eql(u8, alias_name, name)) {
                return true;
            }
        }
        return false;
    }

    /// Check if this is the default command
    pub fn isDefaultCommand(self: *const Command) bool {
        if (self.name.len == 0) {
            return true;
        }
        for (self.alias_names.items) |alias_name| {
            if (std.mem.eql(u8, alias_name, "!")) {
                return true;
            }
        }
        return false;
    }

    /// Check if an option is registered in this command
    pub fn hasOption(self: *const Command, name: []const u8) bool {
        // Split by '.' and check first part
        const check_name = if (std.mem.indexOfScalar(u8, name, '.')) |dot_index|
            name[0..dot_index]
        else
            name;

        for (self.options.items) |opt| {
            if (opt.hasName(check_name)) {
                return true;
            }
        }
        return false;
    }

    /// Output help message for this command
    pub fn outputHelp(self: *const Command, cli_name: []const u8) !void {
        const stdout = std.io.getStdOut().writer();

        // Version header
        try stdout.print("{s}", .{cli_name});
        if (self.version_number) |ver| {
            try stdout.print("/{s}", .{ver});
        }
        try stdout.print("\n\n", .{});

        // Usage section
        try stdout.print("Usage:\n", .{});
        const usage_text = self.usage_text orelse self.raw_name;
        try stdout.print("  $ {s} {s}\n\n", .{ cli_name, usage_text });

        // Options section
        if (self.options.items.len > 0) {
            try stdout.print("Options:\n", .{});

            const raw_names = try self.allocator.alloc([]const u8, self.options.items.len);
            defer self.allocator.free(raw_names);

            for (self.options.items, 0..) |opt, i| {
                raw_names[i] = opt.raw_name;
            }

            const longest = utils.findLongest(raw_names);

            for (self.options.items) |opt| {
                const padded = try utils.padRight(self.allocator, opt.raw_name, longest);
                defer self.allocator.free(padded);

                try stdout.print("  {s}  {s}", .{ padded, opt.description });

                if (opt.config.default) |default| {
                    try stdout.print(" (default: {s})", .{default});
                }
                try stdout.print("\n", .{});
            }
            try stdout.print("\n", .{});
        }

        // Examples section
        if (self.examples.items.len > 0) {
            try stdout.print("Examples:\n", .{});
            for (self.examples.items) |ex| {
                switch (ex) {
                    .string => |s| try stdout.print("{s}\n", .{s}),
                    .function => |f| {
                        const result = f(cli_name);
                        try stdout.print("{s}\n", .{result});
                    },
                }
            }
            try stdout.print("\n", .{});
        }
    }

    /// Output version information
    pub fn outputVersion(self: *const Command, cli_name: []const u8) !void {
        if (self.version_number) |ver| {
            const stdout = std.io.getStdOut().writer();
            const platform_info = try getPlatformInfo(self.allocator);
            defer self.allocator.free(platform_info);

            try stdout.print("{s}/{s} {s}\n", .{ cli_name, ver, platform_info });
        }
    }

    /// Check if required arguments are provided
    pub fn checkRequiredArgs(self: *const Command, parsed_args: []const []const u8) !void {
        var min_args: usize = 0;
        for (self.args.items) |arg| {
            if (arg.required) {
                min_args += 1;
            }
        }

        if (parsed_args.len < min_args) {
            return utils.ClappError.MissingRequiredArgs;
        }
    }

    /// Check for unknown options
    pub fn checkUnknownOptions(self: *const Command, options: std.StringHashMap([]const u8)) !void {
        if (self.config.allow_unknown_options) {
            return;
        }

        var iter = options.keyIterator();
        while (iter.next()) |key| {
            if (std.mem.eql(u8, key.*, "--")) {
                continue;
            }
            if (!self.hasOption(key.*)) {
                std.debug.print("Unknown option: {s}\n", .{key.*});
                return utils.ClappError.UnknownOption;
            }
        }
    }

    /// Check if required option values are provided
    pub fn checkOptionValue(self: *const Command, options: std.StringHashMap([]const u8)) !void {
        for (self.options.items) |opt| {
            if (opt.required) |req| {
                if (req) {
                    const name_parts = std.mem.split(u8, opt.name, ".");
                    const first_part = name_parts.first();

                    if (options.get(first_part)) |value| {
                        if (std.mem.eql(u8, value, "true") or std.mem.eql(u8, value, "false")) {
                            return utils.ClappError.MissingOptionValue;
                        }
                    } else {
                        return utils.ClappError.MissingOptionValue;
                    }
                }
            }
        }
    }
};

/// Get platform information string
fn getPlatformInfo(allocator: std.mem.Allocator) ![]const u8 {
    const os_name = @tagName(std.builtin.os.tag);
    const arch_name = @tagName(std.builtin.cpu.arch);
    return try std.fmt.allocPrint(allocator, "{s}-{s}", .{ os_name, arch_name });
}

test "Command.init" {
    const allocator = std.testing.allocator;

    var cmd = try Command.init(
        allocator,
        "add <task>",
        "Add a new task",
        .{},
    );
    defer cmd.deinit();

    try std.testing.expectEqualStrings("add", cmd.name);
    try std.testing.expectEqualStrings("Add a new task", cmd.description);
    try std.testing.expectEqual(@as(usize, 1), cmd.args.items.len);
}

test "Command.isMatched" {
    const allocator = std.testing.allocator;

    var cmd = try Command.init(
        allocator,
        "test",
        "Test command",
        .{},
    );
    defer cmd.deinit();

    try cmd.alias("t");

    try std.testing.expect(cmd.isMatched("test"));
    try std.testing.expect(cmd.isMatched("t"));
    try std.testing.expect(!cmd.isMatched("other"));
}
