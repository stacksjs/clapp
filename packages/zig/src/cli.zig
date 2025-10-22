const std = @import("std");
const types = @import("types.zig");
const utils = @import("utils.zig");
const Command = @import("command.zig").Command;
const Option = @import("option.zig").Option;

pub const CLI = struct {
    allocator: std.mem.Allocator,
    /// The program name to display in help and version message
    name: []const u8,
    /// List of commands
    commands: std.ArrayList(Command),
    /// Global command
    global_command: Command,
    /// Matched command from parsing
    matched_command: ?*Command,
    /// Matched command name
    matched_command_name: ?[]const u8,
    /// Raw CLI arguments
    raw_args: []const []const u8,
    /// Parsed arguments
    args: std.ArrayList([]const u8),
    /// Parsed options
    options: std.StringHashMap([]const u8),
    /// Show help on exit
    show_help_on_exit: bool,
    /// Show version on exit
    show_version_on_exit: bool,

    pub fn init(allocator: std.mem.Allocator, name: []const u8) !CLI {
        const global_cmd = try Command.init(allocator, "@@global@@", "", .{});

        return CLI{
            .allocator = allocator,
            .name = try allocator.dupe(u8, name),
            .commands = .{},
            .global_command = global_cmd,
            .matched_command = null,
            .matched_command_name = null,
            .raw_args = &[_][]const u8{},
            .args = .{},
            .options = std.StringHashMap([]const u8).init(allocator),
            .show_help_on_exit = false,
            .show_version_on_exit = false,
        };
    }

    pub fn deinit(self: *CLI) void {
        self.allocator.free(self.name);

        for (self.commands.items) |*cmd| {
            cmd.deinit();
        }
        self.commands.deinit();

        self.global_command.deinit();

        self.args.deinit();
        self.options.deinit();
    }

    /// Add a global usage text
    pub fn usage(self: *CLI, text: []const u8) !void {
        try self.global_command.usage(text);
    }

    /// Add a sub-command
    pub fn command(self: *CLI, raw_name: []const u8, description: []const u8, config: types.CommandConfig) !*Command {
        var cmd = try Command.init(self.allocator, raw_name, description, config);
        cmd.cli = @ptrCast(self);
        try self.commands.append(self.allocator, cmd);

        // Return pointer to the command in the ArrayList
        return &self.commands.items[self.commands.items.len - 1];
    }

    /// Add a global CLI option
    pub fn option(self: *CLI, raw_name: []const u8, description: []const u8, config: types.OptionConfig) !void {
        try self.global_command.option(raw_name, description, config);
    }

    /// Show help message when `-h, --help` flags appear
    pub fn help(self: *CLI) !void {
        try self.global_command.option("-h, --help", "Display this message", .{});
        self.show_help_on_exit = true;
    }

    /// Show version number when `-v, --version` flags appear
    pub fn version(self: *CLI, ver: []const u8, custom_flags: []const u8) !void {
        try self.global_command.version(ver, custom_flags);
        self.show_version_on_exit = true;
    }

    /// Add a global example
    pub fn example(self: *CLI, ex: types.CommandExample) !void {
        try self.global_command.example(ex);
    }

    /// Output the corresponding help message
    pub fn outputHelp(self: *const CLI) !void {
        if (self.matched_command) |cmd| {
            try cmd.outputHelp(self.name);
        } else {
            try self.global_command.outputHelp(self.name);
        }
    }

    /// Output the version number
    pub fn outputVersion(self: *const CLI) !void {
        try self.global_command.outputVersion(self.name);
    }

    /// Parse argv
    pub fn parse(self: *CLI, argv: []const []const u8, parse_options: types.ParseOptions) !types.ParsedArgv {
        self.raw_args = argv;

        // Determine CLI name from argv if not set
        if (self.name.len == 0 and argv.len > 0) {
            self.allocator.free(self.name);
            self.name = try utils.getFileName(self.allocator, argv[0]);
        }

        var should_parse = true;
        const args_to_parse = if (argv.len > 1) argv[1..] else &[_][]const u8{};

        // Search sub-commands
        for (self.commands.items) |*cmd| {
            const parsed = try self.parseArgs(args_to_parse, cmd);
            defer {
                parsed.args.deinit();
                parsed.options.deinit();
            }

            if (parsed.args.items.len > 0) {
                const command_name = parsed.args.items[0];
                if (cmd.isMatched(command_name)) {
                    should_parse = false;

                    // Copy args (skipping command name)
                    self.args.clearRetainingCapacity();
                    for (parsed.args.items[1..]) |arg| {
                        try self.args.append(self.allocator, try self.allocator.dupe(u8, arg));
                    }

                    // Copy options
                    self.options.clearRetainingCapacity();
                    var iter = parsed.options.iterator();
                    while (iter.next()) |entry| {
                        try self.options.put(
                            try self.allocator.dupe(u8, entry.key_ptr.*),
                            try self.allocator.dupe(u8, entry.value_ptr.*),
                        );
                    }

                    self.matched_command = cmd;
                    self.matched_command_name = try self.allocator.dupe(u8, command_name);
                    break;
                }
            }
        }

        // Parse as global if no command matched
        if (should_parse) {
            const parsed = try self.parseArgs(args_to_parse, null);
            defer {
                parsed.args.deinit();
                parsed.options.deinit();
            }

            self.args.clearRetainingCapacity();
            for (parsed.args.items) |arg| {
                try self.args.append(self.allocator, try self.allocator.dupe(u8, arg));
            }

            self.options.clearRetainingCapacity();
            var iter = parsed.options.iterator();
            while (iter.next()) |entry| {
                try self.options.put(
                    try self.allocator.dupe(u8, entry.key_ptr.*),
                    try self.allocator.dupe(u8, entry.value_ptr.*),
                );
            }
        }

        // Check for help flag
        if (self.options.get("help")) |_| {
            if (self.show_help_on_exit) {
                try self.outputHelp();
                self.matched_command = null;
            }
        }

        // Check for version flag
        if (self.options.get("version")) |_| {
            if (self.show_version_on_exit and self.matched_command_name == null) {
                try self.outputVersion();
                self.matched_command = null;
            }
        }

        // Run matched command if requested
        if (parse_options.run and self.matched_command != null) {
            try self.runMatchedCommand();
        }

        return types.ParsedArgv{
            .args = self.args,
            .options = self.options,
        };
    }

    /// Parse command line arguments
    fn parseArgs(self: *CLI, argv: []const []const u8, cmd: ?*Command) !types.ParsedArgv {
        var parsed_args: std.ArrayList([]const u8) = .{};
        var parsed_options = std.StringHashMap([]const u8).init(self.allocator);

        // Collect all options (global + command-specific)
        var all_options: std.ArrayList(*const Option) = .{};
        defer all_options.deinit();

        for (self.global_command.options.items) |*opt| {
            try all_options.append(self.allocator, opt);
        }
        if (cmd) |matched_cmd| {
            for (matched_cmd.options.items) |*opt| {
                try all_options.append(self.allocator, opt);
            }
        }

        // Simple argument parser
        var i: usize = 0;
        while (i < argv.len) : (i += 1) {
            const arg = argv[i];

            if (std.mem.startsWith(u8, arg, "--")) {
                // Long option
                const opt_name = arg[2..];

                if (std.mem.indexOf(u8, opt_name, "=")) |eq_index| {
                    // --option=value format
                    const name = opt_name[0..eq_index];
                    const value = opt_name[eq_index + 1 ..];
                    const camelcased = try utils.camelcaseOptionName(self.allocator, name);
                    try parsed_options.put(camelcased, try self.allocator.dupe(u8, value));
                } else {
                    // Check if this is a boolean option
                    const camelcased = try utils.camelcaseOptionName(self.allocator, opt_name);
                    var is_boolean = false;

                    for (all_options.items) |opt| {
                        if (opt.hasName(camelcased) and opt.is_boolean) {
                            is_boolean = true;
                            break;
                        }
                    }

                    if (is_boolean) {
                        try parsed_options.put(camelcased, try self.allocator.dupe(u8, "true"));
                    } else if (i + 1 < argv.len) {
                        i += 1;
                        try parsed_options.put(camelcased, try self.allocator.dupe(u8, argv[i]));
                    }
                }
            } else if (std.mem.startsWith(u8, arg, "-") and arg.len > 1) {
                // Short option(s)
                const opts = arg[1..];

                for (opts, 0..) |c, j| {
                    const opt_char = [_]u8{c};
                    const camelcased = try utils.camelcaseOptionName(self.allocator, &opt_char);

                    var is_boolean = false;
                    for (all_options.items) |opt| {
                        if (opt.hasName(camelcased) and opt.is_boolean) {
                            is_boolean = true;
                            break;
                        }
                    }

                    if (is_boolean) {
                        try parsed_options.put(camelcased, try self.allocator.dupe(u8, "true"));
                    } else if (j == opts.len - 1 and i + 1 < argv.len) {
                        // Last option in the group, take next arg as value
                        i += 1;
                        try parsed_options.put(camelcased, try self.allocator.dupe(u8, argv[i]));
                    }
                }
            } else {
                // Regular argument
                try parsed_args.append(self.allocator, try self.allocator.dupe(u8, arg));
            }
        }

        return types.ParsedArgv{
            .args = parsed_args,
            .options = parsed_options,
        };
    }

    /// Run the matched command
    fn runMatchedCommand(self: *CLI) !void {
        if (self.matched_command) |cmd| {
            // Prepare arguments for the action
            const args_slice = try self.allocator.alloc([]const u8, self.args.items.len);
            defer self.allocator.free(args_slice);

            for (self.args.items, 0..) |arg, i| {
                args_slice[i] = arg;
            }

            // Check validations
            try cmd.checkUnknownOptions(self.options);
            try cmd.checkOptionValue(self.options);
            try cmd.checkRequiredArgs(args_slice);

            // Run the action
            if (cmd.command_action) |action| {
                try action(args_slice, self.options);
            }
        }
    }

    /// Unset matched command
    pub fn unsetMatchedCommand(self: *CLI) void {
        self.matched_command = null;
        if (self.matched_command_name) |name| {
            self.allocator.free(name);
            self.matched_command_name = null;
        }
    }
};

/// Create a new CLI instance
pub fn cli(allocator: std.mem.Allocator, name: []const u8) !CLI {
    return try CLI.init(allocator, name);
}

test "CLI.init" {
    const allocator = std.testing.allocator;

    var c = try CLI.init(allocator, "test-cli");
    defer c.deinit();

    try std.testing.expectEqualStrings("test-cli", c.name);
}

test "CLI.command" {
    const allocator = std.testing.allocator;

    var c = try CLI.init(allocator, "test");
    defer c.deinit();

    _ = try c.command("add <task>", "Add a task", .{});

    try std.testing.expectEqual(@as(usize, 1), c.commands.items.len);
}
