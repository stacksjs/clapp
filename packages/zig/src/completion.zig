const std = @import("std");
const CLI = @import("cli.zig").CLI;
const Command = @import("command.zig").Command;

/// Shell types for completion generation
pub const Shell = enum {
    bash,
    zsh,
    fish,
    powershell,
};

/// Generate shell completion script
pub fn generateCompletion(allocator: std.mem.Allocator, cli: *const CLI, shell: Shell) ![]const u8 {
    return switch (shell) {
        .bash => try generateBash(allocator, cli),
        .zsh => try generateZsh(allocator, cli),
        .fish => try generateFish(allocator, cli),
        .powershell => try generatePowerShell(allocator, cli),
    };
}

/// Generate Bash completion script
fn generateBash(allocator: std.mem.Allocator, cli: *const CLI) ![]const u8 {
    var result: std.ArrayList(u8) = .{};
    defer result.deinit(allocator);

    const writer = result.writer();

    try writer.print("#!/bin/bash\n\n", .{});
    try writer.print("_{s}() {{\n", .{cli.name});
    try writer.print("    local cur prev opts\n", .{});
    try writer.print("    COMPREPLY=()\n", .{});
    try writer.print("    cur=\"${{COMP_WORDS[COMP_CWORD]}}\"\n", .{});
    try writer.print("    prev=\"${{COMP_WORDS[COMP_CWORD-1]}}\"\n\n", .{});

    // Commands
    if (cli.commands.items.len > 0) {
        try writer.print("    local commands=\"", .{});
        for (cli.commands.items, 0..) |cmd, i| {
            if (i > 0) try writer.print(" ", .{});
            try writer.print("{s}", .{cmd.name});
        }
        try writer.print("\"\n\n", .{});
    }

    // Global options
    try writer.print("    local global_opts=\"", .{});
    for (cli.global_command.options.items, 0..) |opt, i| {
        if (i > 0) try writer.print(" ", .{});
        try writer.print("{s}", .{opt.raw_name});
    }
    try writer.print("\"\n\n", .{});

    // Completion logic
    try writer.print("    if [[ ${{cur}} == -* ]]; then\n", .{});
    try writer.print("        COMPREPLY=( $(compgen -W \"${{global_opts}}\" -- ${{cur}}) )\n", .{});
    try writer.print("        return 0\n", .{});
    try writer.print("    fi\n\n", .{});

    if (cli.commands.items.len > 0) {
        try writer.print("    COMPREPLY=( $(compgen -W \"${{commands}}\" -- ${{cur}}) )\n", .{});
    }

    try writer.print("}}\n\n", .{});
    try writer.print("complete -F _{s} {s}\n", .{ cli.name, cli.name });

    return try result.toOwnedSlice(allocator);
}

/// Generate Zsh completion script
fn generateZsh(allocator: std.mem.Allocator, cli: *const CLI) ![]const u8 {
    var result: std.ArrayList(u8) = .{};
    defer result.deinit(allocator);

    const writer = result.writer();

    try writer.print("#compdef {s}\n\n", .{cli.name});
    try writer.print("_{s}() {{\n", .{cli.name});
    try writer.print("    local -a commands\n", .{});
    try writer.print("    local -a global_opts\n\n", .{});

    // Commands
    if (cli.commands.items.len > 0) {
        try writer.print("    commands=(\n", .{});
        for (cli.commands.items) |cmd| {
            try writer.print("        '{s}:{s}'\n", .{ cmd.name, cmd.description });
        }
        try writer.print("    )\n\n", .{});
    }

    // Global options
    try writer.print("    global_opts=(\n", .{});
    for (cli.global_command.options.items) |opt| {
        try writer.print("        '{s}[{s}]'\n", .{ opt.raw_name, opt.description });
    }
    try writer.print("    )\n\n", .{});

    try writer.print("    _arguments \\\n", .{});
    try writer.print("        '1: :->command' \\\n", .{});
    try writer.print("        '*::arg:->args' \\\n", .{});
    try writer.print("        $global_opts\n\n", .{});

    try writer.print("    case $state in\n", .{});
    try writer.print("        command)\n", .{});
    try writer.print("            _describe 'command' commands\n", .{});
    try writer.print("            ;;\n", .{});
    try writer.print("    esac\n", .{});
    try writer.print("}}\n\n", .{});
    try writer.print("_{s} \"$@\"\n", .{cli.name});

    return try result.toOwnedSlice(allocator);
}

/// Generate Fish completion script
fn generateFish(allocator: std.mem.Allocator, cli: *const CLI) ![]const u8 {
    var result: std.ArrayList(u8) = .{};
    defer result.deinit(allocator);

    const writer = result.writer();

    // Global options
    for (cli.global_command.options.items) |opt| {
        try writer.print("complete -c {s} -s {s} -d \"{s}\"\n", .{ cli.name, opt.name, opt.description });
    }

    // Commands
    for (cli.commands.items) |cmd| {
        try writer.print("complete -c {s} -f -a \"{s}\" -d \"{s}\"\n", .{ cli.name, cmd.name, cmd.description });
    }

    return try result.toOwnedSlice(allocator);
}

/// Generate PowerShell completion script
fn generatePowerShell(allocator: std.mem.Allocator, cli: *const CLI) ![]const u8 {
    var result: std.ArrayList(u8) = .{};
    defer result.deinit(allocator);

    const writer = result.writer();

    try writer.print("Register-ArgumentCompleter -Native -CommandName {s} -ScriptBlock {{\n", .{cli.name});
    try writer.print("    param($wordToComplete, $commandAst, $cursorPosition)\n\n", .{});

    try writer.print("    $commands = @(\n", .{});
    for (cli.commands.items) |cmd| {
        try writer.print("        [CompletionResult]::new('{s}', '{s}', [CompletionResultType]::ParameterValue, '{s}')\n", .{ cmd.name, cmd.name, cmd.description });
    }
    try writer.print("    )\n\n", .{});

    try writer.print("    $commands | Where-Object {{ $_.CompletionText -like \"$wordToComplete*\" }}\n", .{});
    try writer.print("}}\n", .{});

    return try result.toOwnedSlice(allocator);
}

test "bash completion generation" {
    const allocator = std.testing.allocator;

    var cli = try CLI.init(allocator, "test-cli");
    defer cli.deinit();

    _ = try cli.command("build", "Build the project", .{});

    const completion = try generateBash(allocator, &cli);
    defer allocator.free(completion);

    try std.testing.expect(std.mem.indexOf(u8, completion, "_test-cli") != null);
    try std.testing.expect(std.mem.indexOf(u8, completion, "build") != null);
}
