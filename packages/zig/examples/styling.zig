const std = @import("std");
const clapp = @import("clapp");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const stdout = std.io.getStdOut().writer();

    // Basic colors
    try stdout.writeAll("\n=== Basic Colors ===\n");

    const red_text = try clapp.style.red(allocator, "Error message");
    defer allocator.free(red_text);
    try stdout.print("{s}\n", .{red_text});

    const green_text = try clapp.style.green(allocator, "Success message");
    defer allocator.free(green_text);
    try stdout.print("{s}\n", .{green_text});

    const yellow_text = try clapp.style.yellow(allocator, "Warning message");
    defer allocator.free(yellow_text);
    try stdout.print("{s}\n", .{yellow_text});

    const cyan_text = try clapp.style.cyan(allocator, "Info message");
    defer allocator.free(cyan_text);
    try stdout.print("{s}\n", .{cyan_text});

    // Text decorations
    try stdout.writeAll("\n=== Text Decorations ===\n");

    const bold_text = try clapp.style.bold(allocator, "Bold text");
    defer allocator.free(bold_text);
    try stdout.print("{s}\n", .{bold_text});

    const italic_text = try clapp.style.italic(allocator, "Italic text");
    defer allocator.free(italic_text);
    try stdout.print("{s}\n", .{italic_text});

    const underline_text = try clapp.style.underline(allocator, "Underlined text");
    defer allocator.free(underline_text);
    try stdout.print("{s}\n", .{underline_text});

    // Theme colors
    try stdout.writeAll("\n=== Theme Colors ===\n");

    const primary_text = try clapp.style.primary(allocator, "Primary");
    defer allocator.free(primary_text);
    try stdout.print("{s}\n", .{primary_text});

    const success_text = try clapp.style.success(allocator, "Success");
    defer allocator.free(success_text);
    try stdout.print("{s}\n", .{success_text});

    const warning_text = try clapp.style.warning(allocator, "Warning");
    defer allocator.free(warning_text);
    try stdout.print("{s}\n", .{warning_text});

    const error_text = try clapp.style.err(allocator, "Error");
    defer allocator.free(error_text);
    try stdout.print("{s}\n", .{error_text});

    // Box drawing
    try stdout.writeAll("\n=== Box Drawing ===\n");

    const box_content = "This is a message inside a box!\nIt supports multiple lines.";
    const boxed = try clapp.style.box(allocator, box_content, .{
        .title = "Notification",
        .padding = 1,
    });
    defer allocator.free(boxed);
    try stdout.print("{s}\n", .{boxed});

    // Panel drawing
    try stdout.writeAll("\n=== Panel Drawing ===\n");

    const panel_content = "This is a panel with double borders.\nGreat for important messages!";
    const panel = try clapp.style.panel(allocator, panel_content, .{
        .title = "Important",
    });
    defer allocator.free(panel);
    try stdout.print("{s}\n", .{panel});

    // Table
    try stdout.writeAll("\n=== Table ===\n");

    const table_data = [_][]const []const u8{
        &[_][]const u8{ "Name", "Age", "City" },
        &[_][]const u8{ "Alice", "30", "New York" },
        &[_][]const u8{ "Bob", "25", "London" },
        &[_][]const u8{ "Charlie", "35", "Tokyo" },
    };

    try clapp.style.table(allocator, &table_data, .{
        .border = true,
        .header = true,
    });

    // Multiple styles combined
    try stdout.writeAll("\n=== Combined Styles ===\n");

    const codes = [_]clapp.AnsiCode{
        clapp.style.codes.bold,
        clapp.style.codes.green,
        clapp.style.codes.underline,
    };

    const multi_styled = try clapp.style.applyMultiple(allocator, "Bold Green Underlined", &codes);
    defer allocator.free(multi_styled);
    try stdout.print("{s}\n\n", .{multi_styled});
}
