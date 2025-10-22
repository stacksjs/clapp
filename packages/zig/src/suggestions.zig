const std = @import("std");

/// Calculate Levenshtein distance between two strings
pub fn levenshteinDistance(a: []const u8, b: []const u8) usize {
    if (a.len == 0) return b.len;
    if (b.len == 0) return a.len;

    const rows = a.len + 1;
    const cols = b.len + 1;

    // We only need two rows at a time
    const allocator = std.heap.page_allocator;
    var prev_row: std.ArrayList(usize) = .{};
    defer prev_row.deinit(allocator);
    var curr_row: std.ArrayList(usize) = .{};
    defer curr_row.deinit(allocator);

    // Initialize
    var i: usize = 0;
    while (i < cols) : (i += 1) {
        prev_row.append(allocator, i) catch return 0;
    }
    curr_row.resize(allocator, cols) catch return 0;

    // Calculate distances
    i = 1;
    while (i < rows) : (i += 1) {
        curr_row.items[0] = i;

        var j: usize = 1;
        while (j < cols) : (j += 1) {
            const cost: usize = if (a[i - 1] == b[j - 1]) 0 else 1;

            const deletion = prev_row.items[j] + 1;
            const insertion = curr_row.items[j - 1] + 1;
            const substitution = prev_row.items[j - 1] + cost;

            curr_row.items[j] = @min(@min(deletion, insertion), substitution);
        }

        // Swap rows
        const temp = prev_row;
        prev_row = curr_row;
        curr_row = temp;
    }

    return prev_row.items[b.len];
}

/// Find suggestions for a typo
pub fn findSuggestions(
    allocator: std.mem.Allocator,
    input: []const u8,
    candidates: []const []const u8,
    max_suggestions: usize,
) ![][]const u8 {
    if (candidates.len == 0) {
        return try allocator.alloc([]const u8, 0);
    }

    // Calculate distances
    const DistancePair = struct {
        word: []const u8,
        distance: usize,
    };

    var distances: std.ArrayList(DistancePair) = .{};
    defer distances.deinit();

    for (candidates) |candidate| {
        const distance = levenshteinDistance(input, candidate);
        try distances.append(allocator, .{ .word = candidate, .distance = distance });
    }

    // Sort by distance
    std.mem.sort(DistancePair, distances.items, {}, struct {
        fn lessThan(_: void, a: DistancePair, b: DistancePair) bool {
            return a.distance < b.distance;
        }
    }.lessThan);

    // Get top suggestions (only if distance is reasonable)
    const max_distance = @max(input.len / 2, 3);
    var suggestions: std.ArrayList([]const u8) = .{};
    defer suggestions.deinit();

    var count: usize = 0;
    for (distances.items) |pair| {
        if (count >= max_suggestions) break;
        if (pair.distance > max_distance) break;

        try suggestions.append(allocator, pair.word);
        count += 1;
    }

    return try suggestions.toOwnedSlice(allocator);
}

/// Find the closest match
pub fn findClosest(input: []const u8, candidates: []const []const u8) ?[]const u8 {
    if (candidates.len == 0) return null;

    var closest: ?[]const u8 = null;
    var min_distance: usize = std.math.maxInt(usize);

    for (candidates) |candidate| {
        const distance = levenshteinDistance(input, candidate);
        if (distance < min_distance) {
            min_distance = distance;
            closest = candidate;
        }
    }

    // Only return if reasonably close
    const max_distance = @max(input.len / 2, 3);
    if (min_distance <= max_distance) {
        return closest;
    }

    return null;
}

/// Check if string starts with prefix
pub fn startsWith(haystack: []const u8, needle: []const u8) bool {
    return std.mem.startsWith(u8, haystack, needle);
}

/// Filter candidates by prefix
pub fn filterByPrefix(
    allocator: std.mem.Allocator,
    prefix: []const u8,
    candidates: []const []const u8,
) ![][]const u8 {
    var result: std.ArrayList([]const u8) = .{};
    defer result.deinit(allocator);

    for (candidates) |candidate| {
        if (startsWith(candidate, prefix)) {
            try result.append(allocator, candidate);
        }
    }

    return try result.toOwnedSlice(allocator);
}

/// Fuzzy match score (higher is better)
pub fn fuzzyScore(input: []const u8, candidate: []const u8) usize {
    var score: usize = 0;
    var input_idx: usize = 0;
    var candidate_idx: usize = 0;

    while (input_idx < input.len and candidate_idx < candidate.len) {
        if (input[input_idx] == candidate[candidate_idx]) {
            score += 1;
            // Bonus for consecutive matches
            if (input_idx > 0 and input[input_idx - 1] == candidate[candidate_idx - 1]) {
                score += 5;
            }
            input_idx += 1;
        }
        candidate_idx += 1;
    }

    // Penalty for leftover characters
    const leftover = input.len - input_idx;
    if (score > leftover * 2) {
        score -= leftover * 2;
    }

    return score;
}

/// Find best fuzzy matches
pub fn fuzzyMatch(
    allocator: std.mem.Allocator,
    input: []const u8,
    candidates: []const []const u8,
    max_results: usize,
) ![][]const u8 {
    const ScorePair = struct {
        word: []const u8,
        score: usize,
    };

    var scores: std.ArrayList(ScorePair) = .{};
    defer scores.deinit();

    for (candidates) |candidate| {
        const score = fuzzyScore(input, candidate);
        if (score > 0) {
            try scores.append(allocator, .{ .word = candidate, .score = score });
        }
    }

    // Sort by score (descending)
    std.mem.sort(ScorePair, scores.items, {}, struct {
        fn lessThan(_: void, a: ScorePair, b: ScorePair) bool {
            return a.score > b.score;
        }
    }.lessThan);

    var result: std.ArrayList([]const u8) = .{};
    defer result.deinit(allocator);

    const limit = @min(max_results, scores.items.len);
    for (scores.items[0..limit]) |pair| {
        try result.append(allocator, pair.word);
    }

    return try result.toOwnedSlice(allocator);
}

test "levenshtein distance" {
    try std.testing.expectEqual(@as(usize, 0), levenshteinDistance("hello", "hello"));
    try std.testing.expectEqual(@as(usize, 1), levenshteinDistance("hello", "hallo"));
    try std.testing.expectEqual(@as(usize, 3), levenshteinDistance("kitten", "sitting"));
}

test "find suggestions" {
    const allocator = std.testing.allocator;

    const candidates = [_][]const u8{ "build", "test", "install", "deploy" };
    const suggestions = try findSuggestions(allocator, "biuld", &candidates, 3);
    defer allocator.free(suggestions);

    try std.testing.expect(suggestions.len > 0);
    try std.testing.expectEqualStrings("build", suggestions[0]);
}

test "fuzzy score" {
    try std.testing.expect(fuzzyScore("bld", "build") > 0);
    try std.testing.expect(fuzzyScore("bld", "build") > fuzzyScore("bld", "delete"));
}

test "filter by prefix" {
    const allocator = std.testing.allocator;

    const candidates = [_][]const u8{ "build", "bundle", "test", "deploy" };
    const filtered = try filterByPrefix(allocator, "bu", &candidates);
    defer allocator.free(filtered);

    try std.testing.expectEqual(@as(usize, 2), filtered.len);
}
