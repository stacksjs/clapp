const std = @import("std");

pub const HttpMethod = enum {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH,
};

pub const HttpResponse = struct {
    status_code: u16,
    body: []const u8,
    headers: std.StringHashMap([]const u8),

    pub fn deinit(self: *HttpResponse, allocator: std.mem.Allocator) void {
        allocator.free(self.body);
        var iter = self.headers.iterator();
        while (iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        self.headers.deinit();
    }
};

pub const HttpClient = struct {
    allocator: std.mem.Allocator,
    timeout_ms: u32 = 30000,

    pub fn init(allocator: std.mem.Allocator) HttpClient {
        return HttpClient{ .allocator = allocator };
    }

    pub fn get(self: *const HttpClient, url: []const u8) !HttpResponse {
        return self.request(.GET, url, null, null);
    }

    pub fn post(self: *const HttpClient, url: []const u8, body: ?[]const u8) !HttpResponse {
        return self.request(.POST, url, body, null);
    }

    pub fn request(
        self: *const HttpClient,
        method: HttpMethod,
        url: []const u8,
        body: ?[]const u8,
        headers: ?std.StringHashMap([]const u8),
    ) !HttpResponse {
        _ = method;
        _ = url;
        _ = body;
        _ = headers;

        // Simplified placeholder - full implementation would use std.http
        return HttpResponse{
            .status_code = 200,
            .body = try self.allocator.dupe(u8, "{}"),
            .headers = std.StringHashMap([]const u8).init(self.allocator),
        };
    }
};
