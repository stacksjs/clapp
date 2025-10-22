# clapp-zig

A Zig implementation of the clapp CLI framework - an elegant, feature-rich library for building powerful command-line applications with interactive prompts, beautiful styling, and comprehensive tooling.

## Features

Clapp Zig is a **production-ready, feature-complete** CLI framework with 22+ modules and 5,000+ lines of code. It provides feature parity with the TypeScript version, plus additional Zig-specific enhancements.

### Core CLI Framework

- **Powerful CLI Framework** - Build robust command-line applications with an elegant API
- **Type-Safe** - Leverages Zig's compile-time safety for reliable CLI applications
- **Command & Option Support** - Full support for commands, options, aliases, and arguments
- **Help & Version Generation** - Automatic help text and version information
- **Flexible Parsing** - Parse command-line arguments with ease
- **Memory Safe** - Explicit memory management with allocators

### Styling & Formatting

- **ANSI Colors** - Full 16+ color support (red, green, blue, yellow, cyan, magenta, white, black, etc.)
- **Text Decorations** - Bold, italic, underline, dim, strikethrough, inverse, hidden
- **Themeable** - Customizable theme colors (primary, success, warning, error, info, muted)
- **Box & Panel Drawing** - Beautiful bordered boxes and panels with Unicode characters
- **Table Formatting** - Professional table rendering with borders, headers, and column alignment

### Interactive Prompts

#### Basic Prompts
- **Text Input** - Prompts with validation, placeholders, and defaults
- **Confirm Prompts** - Yes/no confirmations with default values
- **Select Prompts** - Single-choice selection from a list
- **Multi-Select** - Multiple-choice selections with checkboxes
- **Password Input** - Masked password entry for secure input
- **Intro/Outro** - Session start and end messages

#### Advanced Prompts
- **Autocomplete** - Search-as-you-type with fuzzy matching and keyboard navigation
- **Path Picker** - File/directory selection with validation and type checking
- **Number Input** - Numeric input with min/max validation and integer-only mode

### Progress & Feedback

- **Spinners** - 6 animated spinner styles (dots, line, circle, arrow, box, bounce)
- **Progress Bars** - Visual progress tracking with percentages and current/total display
- **Task Lists** - Track multiple task statuses (pending, running, success, error)
- **Log Messages** - Styled log output with severity levels

### Middleware System

- **Middleware Chain** - Pre/post command execution hooks
- **Built-in Middlewares**:
  - Logging middleware - Track command execution
  - Timing middleware - Measure execution time
  - Validation middleware - Validate input before execution
  - Auth middleware - Authentication checks
  - Rate limiting - Throttle command execution
- **Custom Middleware** - Create your own middleware functions

### Signal Handling

- **SIGINT/SIGTERM** - Handle interruption and termination signals
- **Graceful Shutdown** - Clean shutdown with registered cleanup functions
- **Custom Handlers** - Register custom signal handlers for any signal

### Configuration & Data

- **Config File Support** - Load settings from JSON files with typed values
- **Environment Variables** - Parse env vars with prefix filtering
- **Structured Output** - JSON/YAML output formatting for machine-readable results
- **Shell Completion** - Generate completion scripts for bash, zsh, fish, PowerShell

### Error Handling

- **Enhanced Errors** - Beautiful error messages with colored output
- **Typo Suggestions** - "Did you mean?" suggestions using Levenshtein distance algorithm
- **Fuzzy Matching** - Smart command and option matching with fuzzy search
- **Error Context** - Rich error context with hints, code snippets, and suggestions

### Debug & Development

- **Debug Mode** - Toggle debug logging for development
- **Execution Tracing** - Trace execution flow with timestamps
- **Performance Timers** - Built-in Timer struct for profiling operations

### HTTP Client

- **REST Methods** - GET, POST, PUT, DELETE, PATCH support
- **Headers** - Custom header support
- **Timeout Configuration** - Configurable request timeouts
- **Response Handling** - Structured response with status, body, and headers

### Testing Utilities

- **Mock Streams** - Mock stdin/stdout/stderr for testing
- **Test Context** - Isolated test environment for CLI apps
- **Assertion Helpers** - Convenient test assertions (equal, contains, isTrue, etc.)
- **Output Capture** - Capture and verify CLI output in tests

## Installation

### Using Zig Package Manager

Add clapp to your `build.zig.zon`:

```zig
.dependencies = .{
    .clapp = .{
        .path = "path/to/clapp/packages/zig",
    },
},
```

Then in your `build.zig`:

```zig
const clapp = b.dependency("clapp", .{
    .target = target,
    .optimize = optimize,
});

exe.root_module.addImport("clapp", clapp.module("clapp"));
```

## Quick Start

### Basic CLI Example

```zig
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

    // Add "add" command
    var add_cmd = try cli_instance.command("add <task>", "Add a new task", .{});
    try add_cmd.option("-p, --priority <level>", "Priority level", .{ .default = "medium" });

    add_cmd.action(struct {
        fn callback(args: []const []const u8, options: std.StringHashMap([]const u8)) !void {
            const stdout = std.io.getStdOut().writer();
            const task = args[0];
            const priority = options.get("priority") orelse "medium";
            try stdout.print("Adding task: {s} with priority: {s}\n", .{ task, priority });
        }
    }.callback);

    // Parse command line arguments
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    _ = try cli_instance.parse(args, .{ .run = true });
}
```

### Commands

Commands define actions your CLI can perform:

```zig
// Command with required argument
var cmd = try cli_instance.command("install <package>", "Install a package", .{});

// Command with optional argument
var cmd = try cli_instance.command("list [filter]", "List items", .{});

// Command with variadic arguments
var cmd = try cli_instance.command("remove <...files>", "Remove files", .{});
```

### Options

Add options to commands or globally:

```zig
// Global option (available to all commands)
try cli_instance.option("--config <path>", "Config file path", .{});

// Command-specific option
var cmd = try cli_instance.command("build", "Build the project", .{});
try cmd.option("-o, --output <dir>", "Output directory", .{ .default = "dist" });

// Boolean flag
try cmd.option("-w, --watch", "Watch for changes", .{});

// Negated option
try cmd.option("--no-color", "Disable colors", .{});
```

### Aliases

Commands can have aliases:

```zig
var cmd = try cli_instance.command("install <package>", "Install a package", .{});
try cmd.alias("i");
try cmd.alias("add");
```

### Examples

Add usage examples to your CLI:

```zig
try cli_instance.example(.{ .string = "  $ myapp install lodash" });
try cli_instance.example(.{ .string = "  $ myapp install lodash --save-dev" });
```

## Advanced Usage Examples

### Middleware Chain

```zig
var chain = clapp.MiddlewareChain.init(allocator);
defer chain.deinit();

try chain.use(clapp.middleware.loggingMiddleware);
try chain.use(clapp.middleware.timingMiddleware);
try chain.use(clapp.middleware.authMiddleware);

var ctx = clapp.MiddlewareContext.init(allocator, "my-command");
try chain.execute(&ctx);
```

### Signal Handling

```zig
try clapp.signals.init(allocator);
defer clapp.signals.deinit();

var shutdown = clapp.GracefulShutdown.init(allocator);
defer shutdown.deinit();

try shutdown.onShutdown(cleanup_fn);
try clapp.signals.onSigInt(struct {
    fn handle() void {
        std.debug.print("Shutting down gracefully...\n", .{});
    }
}.handle);
```

### Autocomplete Prompt

```zig
const options = [_][]const u8{ "React", "Vue", "Angular", "Svelte", "Solid" };
const result = try clapp.autocomplete.autocomplete(allocator, .{
    .message = "Search for a framework:",
    .options = &options,
    .fuzzy = true,
    .max_suggestions = 5,
});
defer allocator.free(result);
```

### Spinners and Progress

```zig
// Spinner
var spinner = try clapp.Spinner.init(allocator, "Loading...", clapp.spinner.spinner_styles.dots);
try spinner.start();
// Do work...
try spinner.success("Done!");

// Progress bar
var progress = clapp.ProgressBar.init(allocator, 100);
for (0..100) |i| {
    try progress.update(i);
}

// Task list
var tasks = clapp.TaskList.init(allocator);
defer tasks.deinit();
try tasks.addTask("Initialize", .pending);
try tasks.addTask("Build", .running);
try tasks.addTask("Deploy", .success);
try tasks.render();
```

### Styled Output

```zig
// Colors and decorations
const error_msg = try clapp.style.red(allocator, "Error!");
const success_msg = try clapp.style.green(allocator, "Success!");
const bold_text = try clapp.style.bold(allocator, "Important");

// Boxes and panels
const boxed = try clapp.style.box(allocator, "Message", .{
    .title = "Info",
    .padding = 1,
});

// Tables
const data = [_][]const []const u8{
    &[_][]const u8{ "Name", "Age", "City" },
    &[_][]const u8{ "Alice", "30", "NYC" },
    &[_][]const u8{ "Bob", "25", "LA" },
};
try clapp.style.table(allocator, &data, .{ .border = true, .header = true });
```

### Config and Output

```zig
// Load JSON config
var config = try clapp.Config.loadFromFile(allocator, "config.json");
defer config.deinit();

if (config.getString("api_key")) |key| {
    // Use API key
}

// JSON output
var json = clapp.JsonOutput.init(allocator);
defer json.deinit();

try json.addString("status", "success");
try json.addNumber("count", 42);
try json.addBool("enabled", true);

const output = try json.write();
defer allocator.free(output);
```

### Debug and Timing

```zig
clapp.debug.setDebugMode(true);
clapp.debug.setTraceMode(true);

try clapp.debug.debug(allocator, "Debug message: {s}", .{"info"});
try clapp.debug.trace(allocator, "Tracing execution", .{});

var timer = clapp.Timer.start("Database query");
// Do work...
try timer.stop(allocator); // Prints: "Database query took Xms"
```

### HTTP Client

```zig
var client = clapp.HttpClient.init(allocator);
var response = try client.get("https://api.example.com/data");
defer response.deinit(allocator);

std.debug.print("Status: {d}\n", .{response.status_code});
std.debug.print("Body: {s}\n", .{response.body});
```

## API Reference

### CLI

- `init(allocator, name)` - Create a new CLI instance
- `deinit()` - Clean up resources
- `command(raw_name, description, config)` - Add a command
- `option(raw_name, description, config)` - Add a global option
- `version(version, flags)` - Set version number
- `help()` - Enable help flag
- `parse(argv, options)` - Parse command line arguments

### Command

- `option(raw_name, description, config)` - Add an option to the command
- `alias(name)` - Add an alias for the command
- `action(callback)` - Set the action callback
- `usage(text)` - Set custom usage text
- `example(example)` - Add an example

### Configuration

#### CommandConfig

```zig
pub const CommandConfig = struct {
    allow_unknown_options: bool = false,
    ignore_option_default_value: bool = false,
};
```

#### OptionConfig

```zig
pub const OptionConfig = struct {
    default: ?[]const u8 = null,
};
```

## Building

Build the library:

```bash
zig build
```

Run tests:

```bash
zig build test
```

Build and run the example:

```bash
zig build example
zig build run-example
```

## Comparison with TypeScript Version

This Zig implementation not only achieves feature parity with the TypeScript version but adds several production-ready features:

| Feature | TypeScript | Zig | Status |
|---------|-----------|-----|--------|
| Core CLI | ✅ | ✅ | ✅ Parity |
| Commands & Options | ✅ | ✅ | ✅ Parity |
| Styling & Colors | ✅ | ✅ | ✅ Parity |
| Basic Prompts | ✅ | ✅ | ✅ Parity |
| Advanced Prompts | ✅ | ✅ | ✅ Enhanced |
| Spinners & Progress | ✅ | ✅ | ✅ Parity |
| Config Management | ✅ | ✅ | ✅ Parity |
| Shell Completion | ✅ | ✅ | ✅ Parity |
| Testing Utils | ✅ | ✅ | ✅ Parity |
| Middleware System | ❌ | ✅ | 🎉 New in Zig |
| Signal Handling | ❌ | ✅ | 🎉 New in Zig |
| Debug Mode | ❌ | ✅ | 🎉 New in Zig |
| HTTP Client | ❌ | ✅ | 🎉 New in Zig |
| Memory Management | GC | Explicit allocators | Different approach |
| Error Handling | Exceptions | Error unions | Type-safe |

### Key Differences

- **Memory Management**: Zig uses explicit allocators vs TypeScript's garbage collection
- **Error Handling**: Zig's compile-time error unions vs TypeScript's runtime exceptions
- **Type System**: Zig's compile-time guarantees provide stronger safety
- **Performance**: Zig compiles to native code with zero-cost abstractions
- **Dependencies**: Zig version has zero dependencies (pure stdlib)

## Examples

The `examples/` directory contains several demonstration programs:

- **`basic.zig`** - Simple todo app demonstrating core CLI features
- **`advanced.zig`** - Comprehensive showcase of all advanced features
- **`styling.zig`** - Visual demonstration of colors, decorations, boxes, and tables
- **`comprehensive.zig`** - Complete feature showcase with all 22+ modules

Run examples with:
```bash
zig build-exe examples/comprehensive.zig --mod clapp::src/main.zig
./comprehensive prompts  # Interactive prompts demo
./comprehensive progress # Progress indicators demo
./comprehensive style    # Styling showcase
./comprehensive config   # Config and output demo
```

## Module Reference

See [FEATURES.md](./FEATURES.md) for a complete list of all 22+ modules with detailed usage examples and API documentation.

## Platform Support

- **Linux**: ✅ Full support
- **macOS**: ✅ Full support
- **Windows**: ⚠️ Partial support (some terminal features may be limited)

Requires Zig 0.15.1 or later.

## Statistics

- **22+ Source Files** - Comprehensive module coverage
- **5,000+ Lines of Code** - Production-ready implementation
- **Unit Tests** - All modules have test coverage
- **Zero Dependencies** - Pure Zig stdlib implementation
- **Memory Safe** - Explicit allocator-based memory management

## License

MIT

## Credits

This is a Zig port of [clapp](https://github.com/stacksjs/clapp), which was inspired by:

- [CAC](https://github.com/cacjs/cac) - The original CLI framework
- [clack](https://github.com/bombshell-dev/clack) - Interactive prompts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
