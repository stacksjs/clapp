const std = @import("std");

pub fn build(b: *std.Build) void {
    // Create module for use as dependency
    _ = b.addModule("clapp", .{
        .root_source_file = b.path("src/main.zig"),
    });
}
