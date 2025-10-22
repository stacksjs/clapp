const std = @import("std");
const types = @import("types.zig");
const utils = @import("utils.zig");

pub const Option = struct {
    allocator: std.mem.Allocator,
    /// Raw name as provided (e.g., "-f, --force")
    raw_name: []const u8,
    /// Option description
    description: []const u8,
    /// Option name (longest name, camelCased)
    name: []const u8,
    /// All option names (camelCased)
    names: std.ArrayList([]const u8),
    /// Whether this is a boolean flag
    is_boolean: bool,
    /// Whether the option is required
    required: ?bool,
    /// Configuration
    config: types.OptionConfig,
    /// Whether this is a negated option (--no-something)
    negated: bool,

    pub fn init(
        allocator: std.mem.Allocator,
        raw_name: []const u8,
        description: []const u8,
        config: types.OptionConfig,
    ) !Option {
        var opt = Option{
            .allocator = allocator,
            .raw_name = try allocator.dupe(u8, raw_name),
            .description = try allocator.dupe(u8, description),
            .name = undefined,
            .names = .{},
            .is_boolean = false,
            .required = null,
            .config = config,
            .negated = false,
        };

        // Remove .* from raw name (for dot-nested options)
        const clean_name = try std.mem.replaceOwned(u8, allocator, raw_name, ".*", "");
        defer allocator.free(clean_name);

        const without_brackets = try utils.removeBrackets(allocator, clean_name);
        defer allocator.free(without_brackets);

        // Split by comma and process each name
        var iter = std.mem.splitSequence(u8, without_brackets, ",");
        while (iter.next()) |part| {
            var trimmed = std.mem.trim(u8, part, " \t\n\r");

            // Remove leading dashes
            while (trimmed.len > 0 and trimmed[0] == '-') {
                trimmed = trimmed[1..];
            }

            // Check for negated options
            if (std.mem.startsWith(u8, trimmed, "no-")) {
                opt.negated = true;
                trimmed = trimmed[3..];
            }

            const camelcased = try utils.camelcaseOptionName(allocator, trimmed);
            try opt.names.append(allocator, camelcased);
        }

        // Sort names by length
        const items = opt.names.items;
        std.mem.sort([]const u8, items, {}, struct {
            fn lessThan(_: void, a: []const u8, b: []const u8) bool {
                return a.len < b.len;
            }
        }.lessThan);

        // Use the longest name as the actual option name
        if (opt.names.items.len > 0) {
            opt.name = opt.names.items[opt.names.items.len - 1];
        }

        // Set default for negated options
        if (opt.negated and opt.config.default == null) {
            opt.config.default = "true";
        }

        // Check for required/optional markers
        if (std.mem.indexOf(u8, raw_name, "<")) |_| {
            opt.required = true;
        } else if (std.mem.indexOf(u8, raw_name, "[")) |_| {
            opt.required = false;
        } else {
            // No arg needed, it's a boolean flag
            opt.is_boolean = true;
        }

        return opt;
    }

    pub fn deinit(self: *Option) void {
        self.allocator.free(self.raw_name);
        self.allocator.free(self.description);
        for (self.names.items) |name| {
            self.allocator.free(name);
        }
        self.names.deinit();
    }

    /// Check if this option has a specific name
    pub fn hasName(self: *const Option, name: []const u8) bool {
        for (self.names.items) |n| {
            if (std.mem.eql(u8, n, name)) {
                return true;
            }
        }
        return false;
    }
};

test "Option.init basic" {
    const allocator = std.testing.allocator;

    var opt = try Option.init(
        allocator,
        "-f, --force",
        "Force the operation",
        .{},
    );
    defer opt.deinit();

    try std.testing.expect(opt.is_boolean);
    try std.testing.expectEqualStrings("force", opt.name);
}

test "Option.init with argument" {
    const allocator = std.testing.allocator;

    var opt = try Option.init(
        allocator,
        "-p, --port <port>",
        "Port number",
        .{},
    );
    defer opt.deinit();

    try std.testing.expect(!opt.is_boolean);
    try std.testing.expect(opt.required.? == true);
    try std.testing.expectEqualStrings("port", opt.name);
}

test "Option.init negated" {
    const allocator = std.testing.allocator;

    var opt = try Option.init(
        allocator,
        "--no-color",
        "Disable colors",
        .{},
    );
    defer opt.deinit();

    try std.testing.expect(opt.negated);
    try std.testing.expectEqualStrings("color", opt.name);
}
