# clapp-zig

A Zig implementation of the clapp CLI framework - an elegant, feature-rich library for building powerful command-line applications with interactive prompts, beautiful styling, and comprehensive tooling.

## Features

### Core CLI Framework

- **Powerful CLI Framework** - Build robust command-line applications with an elegant API
- **Type-Safe** - Leverages Zig's compile-time safety for reliable CLI applications
- **Command & Option Support** - Full support for commands, options, aliases, and arguments
- **Help & Version Generation** - Automatic help text and version information
- **Flexible Parsing** - Parse command-line arguments with ease
- **Memory Safe** - Explicit memory management with allocators

### Styling & Formatting

- **ANSI Colors** - Full color support (red, green, blue, yellow, cyan, magenta, etc.)
- **Text Decorations** - Bold, italic, underline, dim, strikethrough, and more
- **Themeable** - Customizable theme colors (primary, success, warning, error, info)
- **Box & Panel Drawing** - Beautiful bordered boxes and panels
- **Table Formatting** - Professional table rendering with borders and headers

### Interactive Prompts

- **Text Input** - Prompts with validation, placeholders, and defaults
- **Confirm Prompts** - Yes/no confirmations with default values
- **Select Prompts** - Single-choice selection from a list
- **Multi-Select** - Multiple-choice selections
- **Password Input** - Masked password entry
- **Intro/Outro** - Session start and end messages

### Progress & Feedback

- **Spinners** - Animated loading indicators with multiple styles
- **Progress Bars** - Visual progress tracking with percentages
- **Task Lists** - Track multiple task statuses (pending, running, success, error)
- **Log Messages** - Styled log output

### Advanced Features

- **Config File Support** - Load settings from JSON files
- **Environment Variables** - Parse env vars with prefix filtering
- **Shell Completion** - Generate completion scripts for bash, zsh, fish, PowerShell
- **Typo Suggestions** - "Did you mean?" suggestions using Levenshtein distance
- **Fuzzy Matching** - Smart command and option matching
- **Enhanced Errors** - Beautiful error messages with suggestions and hints

### Testing Utilities

- **Mock Streams** - Mock stdin/stdout/stderr for testing
- **Test Context** - Isolated test environment for CLI apps
- **Assertion Helpers** - Convenient test assertions
- **Output Capture** - Capture and verify CLI output

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

This Zig implementation closely mirrors the TypeScript version's API while leveraging Zig's features:

| Feature | TypeScript | Zig |
|---------|-----------|-----|
| Memory Management | Automatic GC | Explicit allocators |
| Error Handling | Exceptions | Error unions |
| Type System | Structural | Nominal |
| Callbacks | Functions | Function pointers |
| Async | Promises | Async/await (future) |

## License

MIT

## Credits

This is a Zig port of [clapp](https://github.com/stacksjs/clapp), which was inspired by:

- [CAC](https://github.com/cacjs/cac) - The original CLI framework
- [clack](https://github.com/bombshell-dev/clack) - Interactive prompts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
