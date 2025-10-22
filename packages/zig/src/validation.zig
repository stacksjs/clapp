const std = @import("std");

/// Validation result
pub const ValidationResult = union(enum) {
    valid,
    invalid: []const u8, // Error message

    pub fn isValid(self: ValidationResult) bool {
        return self == .valid;
    }

    pub fn getError(self: ValidationResult) ?[]const u8 {
        return switch (self) {
            .valid => null,
            .invalid => |msg| msg,
        };
    }
};

/// Validator function type
pub const ValidatorFn = *const fn (value: []const u8) ValidationResult;

/// Common validators
pub const validators = struct {
    /// Validate non-empty string
    pub fn required(value: []const u8) ValidationResult {
        if (value.len == 0) {
            return .{ .invalid = "This field is required" };
        }
        return .valid;
    }

    /// Validate minimum length
    pub fn minLength(min: usize) ValidatorFn {
        const Closure = struct {
            fn validate(value: []const u8) ValidationResult {
                if (value.len < min) {
                    return .{ .invalid = "Minimum length not met" };
                }
                return .valid;
            }
        };
        return Closure.validate;
    }

    /// Validate maximum length
    pub fn maxLength(max: usize) ValidatorFn {
        const Closure = struct {
            fn validate(value: []const u8) ValidationResult {
                if (value.len > max) {
                    return .{ .invalid = "Maximum length exceeded" };
                }
                return .valid;
            }
        };
        return Closure.validate;
    }

    /// Validate email format
    pub fn email(value: []const u8) ValidationResult {
        if (std.mem.indexOf(u8, value, "@") == null) {
            return .{ .invalid = "Invalid email format" };
        }
        const at_pos = std.mem.indexOf(u8, value, "@").?;
        if (at_pos == 0 or at_pos == value.len - 1) {
            return .{ .invalid = "Invalid email format" };
        }
        const after_at = value[at_pos + 1 ..];
        if (std.mem.indexOf(u8, after_at, ".") == null) {
            return .{ .invalid = "Invalid email format" };
        }
        return .valid;
    }

    /// Validate URL format
    pub fn url(value: []const u8) ValidationResult {
        if (!std.mem.startsWith(u8, value, "http://") and !std.mem.startsWith(u8, value, "https://")) {
            return .{ .invalid = "URL must start with http:// or https://" };
        }
        if (value.len < 10) {
            return .{ .invalid = "Invalid URL format" };
        }
        return .valid;
    }

    /// Validate numeric string
    pub fn numeric(value: []const u8) ValidationResult {
        for (value) |c| {
            if (!std.ascii.isDigit(c) and c != '.' and c != '-') {
                return .{ .invalid = "Must be a number" };
            }
        }
        return .valid;
    }

    /// Validate integer string
    pub fn integer(value: []const u8) ValidationResult {
        for (value) |c| {
            if (!std.ascii.isDigit(c) and c != '-') {
                return .{ .invalid = "Must be an integer" };
            }
        }
        return .valid;
    }

    /// Validate alphabetic string
    pub fn alpha(value: []const u8) ValidationResult {
        for (value) |c| {
            if (!std.ascii.isAlphabetic(c)) {
                return .{ .invalid = "Must contain only letters" };
            }
        }
        return .valid;
    }

    /// Validate alphanumeric string
    pub fn alphanumeric(value: []const u8) ValidationResult {
        for (value) |c| {
            if (!std.ascii.isAlphanumeric(c)) {
                return .{ .invalid = "Must contain only letters and numbers" };
            }
        }
        return .valid;
    }
};

/// Validator chain - combine multiple validators
pub const ValidatorChain = struct {
    allocator: std.mem.Allocator,
    validators_list: std.ArrayList(ValidatorFn),

    pub fn init(allocator: std.mem.Allocator) ValidatorChain {
        return ValidatorChain{
            .allocator = allocator,
            .validators_list = .{},
        };
    }

    pub fn deinit(self: *ValidatorChain) void {
        self.validators_list.deinit();
    }

    /// Add validator to chain
    pub fn add(self: *ValidatorChain, validator: ValidatorFn) !void {
        try self.validators_list.append(self.allocator, validator);
    }

    /// Validate value against all validators
    pub fn validate(self: *const ValidatorChain, value: []const u8) ValidationResult {
        for (self.validators_list.items) |validator| {
            const result = validator(value);
            if (!result.isValid()) {
                return result;
            }
        }
        return .valid;
    }
};

/// Field validation with retry logic
pub const FieldValidator = struct {
    name: []const u8,
    validator: ValidatorFn,
    max_retries: usize = 3,
    retry_count: usize = 0,

    pub fn init(name: []const u8, validator: ValidatorFn) FieldValidator {
        return FieldValidator{
            .name = name,
            .validator = validator,
        };
    }

    /// Validate and track retries
    pub fn validateWithRetry(self: *FieldValidator, value: []const u8) !ValidationResult {
        const result = self.validator(value);

        if (!result.isValid()) {
            self.retry_count += 1;
            if (self.retry_count >= self.max_retries) {
                return error.MaxRetriesExceeded;
            }
        } else {
            self.retry_count = 0;
        }

        return result;
    }

    pub fn canRetry(self: *const FieldValidator) bool {
        return self.retry_count < self.max_retries;
    }

    pub fn reset(self: *FieldValidator) void {
        self.retry_count = 0;
    }
};

/// Validation error display
pub fn displayValidationError(allocator: std.mem.Allocator, field: []const u8, error_msg: []const u8) !void {
    const stderr = std.io.getStdErr().writer();

    const style = @import("style.zig");
    const error_prefix = try style.red(allocator, "✗");
    defer allocator.free(error_prefix);

    const field_styled = try style.bold(allocator, field);
    defer allocator.free(field_styled);

    try stderr.print("{s} {s}: {s}\n", .{ error_prefix, field_styled, error_msg });
}

test "validators" {
    try std.testing.expect(validators.required("test").isValid());
    try std.testing.expect(!validators.required("").isValid());

    try std.testing.expect(validators.email("test@example.com").isValid());
    try std.testing.expect(!validators.email("invalid").isValid());

    try std.testing.expect(validators.url("https://example.com").isValid());
    try std.testing.expect(!validators.url("invalid").isValid());

    try std.testing.expect(validators.numeric("123.45").isValid());
    try std.testing.expect(!validators.numeric("abc").isValid());

    try std.testing.expect(validators.integer("123").isValid());
    try std.testing.expect(!validators.integer("12.3").isValid());

    try std.testing.expect(validators.alpha("abc").isValid());
    try std.testing.expect(!validators.alpha("abc123").isValid());

    try std.testing.expect(validators.alphanumeric("abc123").isValid());
    try std.testing.expect(!validators.alphanumeric("abc-123").isValid());
}

test "validator chain" {
    const allocator = std.testing.allocator;

    var chain = ValidatorChain.init(allocator);
    defer chain.deinit();

    try chain.add(validators.required);
    try chain.add(validators.alpha);

    try std.testing.expect(chain.validate("test").isValid());
    try std.testing.expect(!chain.validate("").isValid());
    try std.testing.expect(!chain.validate("test123").isValid());
}

test "field validator with retry" {
    var validator = FieldValidator.init("email", validators.email);
    validator.max_retries = 2;

    _ = try validator.validateWithRetry("invalid");
    try std.testing.expect(validator.retry_count == 1);
    try std.testing.expect(validator.canRetry());

    _ = try validator.validateWithRetry("invalid");
    try std.testing.expect(validator.retry_count == 2);
    try std.testing.expect(!validator.canRetry());

    const result = validator.validateWithRetry("invalid");
    try std.testing.expectError(error.MaxRetriesExceeded, result);

    validator.reset();
    try std.testing.expect(validator.retry_count == 0);
}
