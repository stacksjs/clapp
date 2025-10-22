const std = @import("std");
const clapp = @import("clapp");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Create a CLI instance
    var cli_instance = try clapp.CLI.init(allocator, "todo-app");
    defer cli_instance.deinit();

    // Set version and enable help
    try cli_instance.version("1.0.0", "-v, --version");
    try cli_instance.help();

    // Add a global option
    try cli_instance.option("--config <path>", "Path to config file", .{});

    // Add "add" command
    var add_cmd = try cli_instance.command("add <task>", "Add a new task", .{});
    try add_cmd.option("-p, --priority <level>", "Priority level (high, medium, low)", .{ .default = "medium" });

    add_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            const stdout = std.io.getStdOut().writer();

            if (args.len > 0) {
                const task = args[0];
                const priority = options.get("priority") orelse "medium";

                try stdout.print("Adding task: {s} with priority: {s}\n", .{ task, priority });
            }
        }
    }.callback);

    // Add "list" command
    var list_cmd = try cli_instance.command("list", "List all tasks", .{});
    try list_cmd.option("-a, --all", "Show all tasks including completed ones", .{});

    list_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            _ = args;
            const stdout = std.io.getStdOut().writer();

            const show_all = options.get("all") != null;
            const task_type = if (show_all) "all" else "pending";

            try stdout.print("Listing {s} tasks\n", .{task_type});
        }
    }.callback);

    // Add "remove" command
    var remove_cmd = try cli_instance.command("remove <id>", "Remove a task by ID", .{});
    try remove_cmd.alias("rm");

    remove_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            _ = options;
            const stdout = std.io.getStdOut().writer();

            if (args.len > 0) {
                const id = args[0];
                try stdout.print("Removing task with ID: {s}\n", .{id});
            }
        }
    }.callback);

    // Parse command line arguments
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    _ = try cli_instance.parse(args, .{ .run = true });
}
