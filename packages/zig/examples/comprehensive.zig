const std = @import("std");
const clapp = @import("clapp");

/// Comprehensive example showcasing all Clapp features
pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Setup signal handling and graceful shutdown
    try clapp.signals.init(allocator);
    defer clapp.signals.deinit();

    var shutdown = clapp.GracefulShutdown.init(allocator);
    defer shutdown.deinit();

    try clapp.signals.onSigInt(struct {
        fn handle() void {
            std.debug.print("\nShutting down gracefully...\n", .{});
            std.process.exit(0);
        }
    }.handle);

    // Initialize CLI
    var cli = try clapp.CLI.init(allocator, "clapp-demo");
    defer cli.deinit();

    try cli.version("1.0.0", "-v, --version");
    try cli.help();

    // Setup middleware chain
    var middleware_chain = clapp.MiddlewareChain.init(allocator);
    defer middleware_chain.deinit();

    try middleware_chain.use(clapp.middleware.loggingMiddleware);
    try middleware_chain.use(clapp.middleware.timingMiddleware);

    // Command 1: Interactive prompts showcase
    var prompts_cmd = try cli.command("prompts", "Interactive prompts showcase", .{});
    prompts_cmd.action(struct {
        fn run(cmd: *clapp.Command) !void {
            const alloc = cmd.allocator;

            // Text prompt
            const styled_title = try clapp.style.bold(alloc, "Interactive Prompts Demo");
            defer alloc.free(styled_title);
            std.debug.print("{s}\n\n", .{styled_title});

            const name = try clapp.prompts.text(alloc, .{
                .message = "What's your name?",
                .default = "User",
            });
            defer alloc.free(name);

            // Confirm prompt
            const confirmed = try clapp.prompts.confirm(alloc, .{
                .message = "Do you want to continue?",
                .default = true,
            });

            if (!confirmed) {
                std.debug.print("Cancelled!\n", .{});
                return;
            }

            // Select prompt
            const colors = [_][]const u8{ "Red", "Green", "Blue", "Yellow" };
            const color = try clapp.prompts.select(alloc, .{
                .message = "Pick your favorite color:",
                .options = &colors,
            });
            defer alloc.free(color);

            // Number prompt
            const age = try clapp.number_prompt.number(alloc, .{
                .message = "Enter your age:",
                .min = 1,
                .max = 150,
                .integer_only = true,
            });

            // Autocomplete prompt
            const frameworks = [_][]const u8{ "React", "Vue", "Angular", "Svelte", "Solid" };
            const framework = try clapp.autocomplete.autocomplete(alloc, .{
                .message = "Search for a framework:",
                .options = &frameworks,
                .fuzzy = true,
                .max_suggestions = 5,
            });
            defer alloc.free(framework);

            // Display results with styling
            const summary = try std.fmt.allocPrint(alloc,
                \\
                \\Summary:
                \\  Name: {s}
                \\  Favorite Color: {s}
                \\  Age: {d}
                \\  Framework: {s}
            , .{ name, color, age, framework });
            defer alloc.free(summary);

            const boxed = try clapp.style.box(alloc, summary, .{
                .title = "Results",
                .padding = 1,
            });
            defer alloc.free(boxed);
            std.debug.print("{s}\n", .{boxed});
        }
    }.run);

    // Command 2: Progress indicators
    var progress_cmd = try cli.command("progress", "Progress indicators showcase", .{});
    progress_cmd.action(struct {
        fn run(cmd: *clapp.Command) !void {
            const alloc = cmd.allocator;

            // Spinner demo
            var spinner = try clapp.Spinner.init(alloc, "Processing data...", clapp.spinner.spinner_styles.dots);
            try spinner.start();

            std.time.sleep(2 * std.time.ns_per_s);
            try spinner.success("Data processed successfully!");

            // Progress bar demo
            std.debug.print("\n", .{});
            var progress = clapp.ProgressBar.init(alloc, 100);
            for (0..101) |i| {
                try progress.update(i);
                std.time.sleep(20 * std.time.ns_per_ms);
            }
            std.debug.print("\n\n", .{});

            // Task list demo
            var task_list = clapp.TaskList.init(alloc);
            defer task_list.deinit();

            try task_list.addTask("Initialize project", .pending);
            try task_list.addTask("Install dependencies", .pending);
            try task_list.addTask("Build application", .pending);
            try task_list.render();

            std.time.sleep(1 * std.time.ns_per_s);
            try task_list.updateTask(0, .running);
            try task_list.render();

            std.time.sleep(1 * std.time.ns_per_s);
            try task_list.updateTask(0, .success);
            try task_list.updateTask(1, .running);
            try task_list.render();

            std.time.sleep(1 * std.time.ns_per_s);
            try task_list.updateTask(1, .success);
            try task_list.updateTask(2, .running);
            try task_list.render();

            std.time.sleep(1 * std.time.ns_per_s);
            try task_list.updateTask(2, .success);
            try task_list.render();
        }
    }.run);

    // Command 3: Styling showcase
    var style_cmd = try cli.command("style", "Styling and colors showcase", .{});
    style_cmd.action(struct {
        fn run(cmd: *clapp.Command) !void {
            const alloc = cmd.allocator;

            // Colors
            const red_text = try clapp.style.red(alloc, "Red text");
            defer alloc.free(red_text);
            const green_text = try clapp.style.green(alloc, "Green text");
            defer alloc.free(green_text);
            const blue_text = try clapp.style.blue(alloc, "Blue text");
            defer alloc.free(blue_text);

            std.debug.print("{s} | {s} | {s}\n\n", .{ red_text, green_text, blue_text });

            // Decorations
            const bold_text = try clapp.style.bold(alloc, "Bold");
            defer alloc.free(bold_text);
            const italic_text = try clapp.style.italic(alloc, "Italic");
            defer alloc.free(italic_text);
            const underline_text = try clapp.style.underline(alloc, "Underline");
            defer alloc.free(underline_text);

            std.debug.print("{s} | {s} | {s}\n\n", .{ bold_text, italic_text, underline_text });

            // Box
            const boxed = try clapp.style.box(alloc, "This is a boxed message!", .{
                .title = "Info",
                .padding = 1,
            });
            defer alloc.free(boxed);
            std.debug.print("{s}\n\n", .{boxed});

            // Panel
            const panel_content = "This is a panel with\nmultiple lines of text\nand custom styling!";
            const panel = try clapp.style.panel(alloc, panel_content, .{
                .title = "Panel Demo",
                .border_color = clapp.style.codes.cyan,
            });
            defer alloc.free(panel);
            std.debug.print("{s}\n", .{panel});
        }
    }.run);

    // Command 4: Config and output
    var config_cmd = try cli.command("config", "Config and output showcase", .{});
    config_cmd.action(struct {
        fn run(cmd: *clapp.Command) !void {
            const alloc = cmd.allocator;

            // JSON output
            var json = clapp.JsonOutput.init(alloc);
            defer json.deinit();

            try json.addString("app_name", "clapp-demo");
            try json.addString("version", "1.0.0");
            try json.addNumber("port", 3000);
            try json.addBool("production", false);

            const output = try json.write();
            defer alloc.free(output);

            const title = try clapp.style.bold(alloc, "JSON Configuration:");
            defer alloc.free(title);
            std.debug.print("{s}\n{s}\n\n", .{ title, output });

            // Environment parser demo
            const env_parser = clapp.EnvParser{ .prefix = "APP_" };
            var env_config = try env_parser.parse(alloc);
            defer env_config.deinit();

            std.debug.print("Environment variables with APP_ prefix loaded\n", .{});
        }
    }.run);

    // Command 5: HTTP client
    var http_cmd = try cli.command("http", "HTTP client showcase", .{});
    http_cmd.action(struct {
        fn run(cmd: *clapp.Command) !void {
            const alloc = cmd.allocator;

            var spinner = try clapp.Spinner.init(alloc, "Making HTTP request...", clapp.spinner.spinner_styles.dots);
            try spinner.start();

            var client = clapp.HttpClient.init(alloc);
            var response = try client.get("https://api.example.com/data");
            defer response.deinit(alloc);

            try spinner.success("Request completed!");

            std.debug.print("\nStatus: {d}\n", .{response.status_code});
            std.debug.print("Body: {s}\n", .{response.body});
        }
    }.run);

    // Command 6: Debug and timing
    var debug_cmd = try cli.command("debug", "Debug mode showcase", .{});
    debug_cmd.action(struct {
        fn run(cmd: *clapp.Command) !void {
            const alloc = cmd.allocator;

            clapp.debug.setDebugMode(true);
            clapp.debug.setTraceMode(true);

            try clapp.debug.debug(alloc, "Debug mode enabled", .{});
            try clapp.debug.trace(alloc, "Tracing execution", .{});

            var timer = clapp.Timer.start("Operation");
            std.time.sleep(500 * std.time.ns_per_ms);
            try timer.stop(alloc);

            clapp.debug.setDebugMode(false);
            clapp.debug.setTraceMode(false);
        }
    }.run);

    // Command 7: Error handling
    var error_cmd = try cli.command("error", "Error handling showcase", .{});
    error_cmd.action(struct {
        fn run(cmd: *clapp.Command) !void {
            const alloc = cmd.allocator;

            const commands = [_][]const u8{ "prompts", "progress", "style", "config", "http", "debug" };
            var err = try clapp.errors.unknownCommand(alloc, "prompt", &commands);
            defer err.deinit(alloc);

            try err.display();
        }
    }.run);

    // Parse and execute
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    // Execute middleware
    var ctx = clapp.MiddlewareContext.init(allocator, "demo");
    defer ctx.deinit();
    try middleware_chain.execute(&ctx);

    _ = try cli.parse(args, .{ .run = true });
}
