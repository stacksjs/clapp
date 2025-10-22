const std = @import("std");
const clapp = @import("clapp");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Show intro with styling
    try clapp.prompts.intro(allocator, "Advanced Clapp Example");

    // Create CLI with comprehensive features
    var cli_instance = try clapp.CLI.init(allocator, "advanced-cli");
    defer cli_instance.deinit();

    try cli_instance.version("2.0.0", "-v, --version");
    try cli_instance.help();

    // Global option
    try cli_instance.option("--config <path>", "Path to config file", .{});
    try cli_instance.option("--verbose", "Enable verbose output", .{});

    // Setup command with interactive prompts
    var setup_cmd = try cli_instance.command("setup", "Interactive project setup", .{});
    setup_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            _ = args;
            _ = options;

            const alloc = std.heap.page_allocator;
            const stdout = std.io.getStdOut().writer();

            // Text prompt with validation
            const project_name = try clapp.prompts.text(alloc, .{
                .message = "What is your project name?",
                .placeholder = "my-awesome-project",
                .validate = struct {
                    fn validate(input: []const u8) bool {
                        return input.len > 0;
                    }
                }.validate,
            });
            defer alloc.free(project_name);

            // Confirm prompt
            const use_typescript = try clapp.prompts.confirm(alloc, .{
                .message = "Use TypeScript?",
                .default_value = true,
            });

            // Select prompt
            const framework = try clapp.prompts.select(alloc, .{
                .message = "Choose a framework:",
                .options = &[_]clapp.SelectOption{
                    .{ .value = "react", .label = "React", .hint = "Popular" },
                    .{ .value = "vue", .label = "Vue", .hint = "Recommended" },
                    .{ .value = "svelte", .label = "Svelte" },
                },
            });
            defer alloc.free(framework);

            // Multi-select prompt
            const features = try clapp.prompts.multiSelect(alloc, .{
                .message = "Select features:",
                .options = &[_]clapp.SelectOption{
                    .{ .value = "router", .label = "Router" },
                    .{ .value = "state", .label = "State Management" },
                    .{ .value = "testing", .label = "Testing Framework" },
                },
                .required = false,
            });
            defer {
                for (features) |feature| {
                    alloc.free(feature);
                }
                alloc.free(features);
            }

            // Show progress with spinner
            var spin = try clapp.Spinner.init(alloc, "Creating project...", clapp.spinner.spinner_styles.dots);
            defer spin.deinit();

            try spin.start();
            std.time.sleep(2 * std.time.ns_per_s);
            try spin.success("Project created successfully!");

            // Display styled summary
            const summary = try std.fmt.allocPrint(alloc, "Project: {s}\nTypeScript: {}\nFramework: {s}\nFeatures: {d} selected", .{
                project_name,
                use_typescript,
                framework,
                features.len,
            });
            defer alloc.free(summary);

            const boxed = try clapp.style.box(alloc, summary, .{ .title = "Summary", .padding = 2 });
            defer alloc.free(boxed);

            try stdout.print("{s}\n", .{boxed});
        }
    }.callback);

    // Build command with progress bar
    var build_cmd = try cli_instance.command("build", "Build the project", .{});
    try build_cmd.option("--watch", "Watch for changes", .{});
    try build_cmd.option("--production", "Production build", .{});

    build_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            _ = args;
            const alloc = std.heap.page_allocator;
            const stdout = std.io.getStdOut().writer();

            const is_prod = options.get("production") != null;

            const mode_text = if (is_prod) "production" else "development";
            const mode_styled = if (is_prod)
                try clapp.style.warning(alloc, mode_text)
            else
                try clapp.style.info(alloc, mode_text);
            defer alloc.free(mode_styled);

            try stdout.print("Building in {s} mode...\n\n", .{mode_styled});

            // Show progress bar
            var progress = clapp.ProgressBar.init(alloc, 100);
            var i: usize = 0;
            while (i <= 100) : (i += 5) {
                try progress.update(i);
                std.time.sleep(100 * std.time.ns_per_ms);
            }
            try progress.finish();

            const success_msg = try clapp.style.success(alloc, "Build completed successfully!");
            defer alloc.free(success_msg);
            try stdout.print("\n{s}\n", .{success_msg});
        }
    }.callback);

    // Test command with task list
    var test_cmd = try cli_instance.command("test", "Run tests", .{});
    try test_cmd.option("--coverage", "Generate coverage report", .{});

    test_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            _ = args;
            _ = options;
            const alloc = std.heap.page_allocator;

            var tasks = clapp.TaskList.init(alloc);
            defer tasks.deinit();

            try tasks.add("Compiling tests...");
            std.time.sleep(500 * std.time.ns_per_ms);
            try tasks.updateStatus(0, .success);

            try tasks.add("Running unit tests...");
            std.time.sleep(1 * std.time.ns_per_s);
            try tasks.updateStatus(1, .success);

            try tasks.add("Running integration tests...");
            std.time.sleep(800 * std.time.ns_per_ms);
            try tasks.updateStatus(2, .success);

            try clapp.prompts.outro(alloc, "All tests passed!");
        }
    }.callback);

    // Generate completion command
    var completion_cmd = try cli_instance.command("completion <shell>", "Generate shell completion", .{});
    completion_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            _ = options;
            if (args.len == 0) return;

            const alloc = std.heap.page_allocator;
            const stdout = std.io.getStdOut().writer();
            const shell_name = args[0];

            const shell = if (std.mem.eql(u8, shell_name, "bash"))
                clapp.Shell.bash
            else if (std.mem.eql(u8, shell_name, "zsh"))
                clapp.Shell.zsh
            else if (std.mem.eql(u8, shell_name, "fish"))
                clapp.Shell.fish
            else
                return error.UnsupportedShell;

            // Note: This would need access to the CLI instance
            // For now, just show a message
            const msg = try std.fmt.allocPrint(alloc, "Completion script for {s} generated", .{shell_name});
            defer alloc.free(msg);

            const success = try clapp.style.success(alloc, msg);
            defer alloc.free(success);

            try stdout.print("{s}\n", .{success});
        }
    }.callback);

    // Parse and run
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    _ = try cli_instance.parse(args, .{ .run = true });
}
