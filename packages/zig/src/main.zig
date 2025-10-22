const std = @import("std");

// Re-export core CLI types and functions
pub const CLI = @import("cli.zig").CLI;
pub const cli = @import("cli.zig").cli;
pub const Command = @import("command.zig").Command;
pub const Option = @import("option.zig").Option;

// Re-export core types
pub const CommandArg = @import("types.zig").CommandArg;
pub const CommandConfig = @import("types.zig").CommandConfig;
pub const OptionConfig = @import("types.zig").OptionConfig;
pub const ParsedArgv = @import("types.zig").ParsedArgv;
pub const HelpSection = @import("types.zig").HelpSection;
pub const CommandExample = @import("types.zig").CommandExample;
pub const ParseOptions = @import("types.zig").ParseOptions;

// Re-export utilities
pub const utils = @import("utils.zig");

// Re-export styling module
pub const style = @import("style.zig");
pub const AnsiCode = style.AnsiCode;
pub const Theme = style.Theme;
pub const BoxOptions = style.BoxOptions;
pub const PanelOptions = style.PanelOptions;
pub const TableOptions = style.TableOptions;

// Re-export prompts
pub const prompts = @import("prompts.zig");
pub const TextOptions = prompts.TextOptions;
pub const ConfirmOptions = prompts.ConfirmOptions;
pub const SelectOption = prompts.SelectOption;
pub const SelectOptions = prompts.SelectOptions;
pub const MultiSelectOptions = prompts.MultiSelectOptions;
pub const PasswordOptions = prompts.PasswordOptions;

// Re-export spinner and progress
pub const spinner = @import("spinner.zig");
pub const Spinner = spinner.Spinner;
pub const SpinnerFrames = spinner.SpinnerFrames;
pub const ProgressBar = spinner.ProgressBar;
pub const TaskList = spinner.TaskList;
pub const TaskStatus = spinner.TaskStatus;

// Re-export config
pub const config = @import("config.zig");
pub const Config = config.Config;
pub const ConfigValue = config.ConfigValue;
pub const ConfigFormat = config.ConfigFormat;
pub const EnvParser = config.EnvParser;

// Re-export completion
pub const completion = @import("completion.zig");
pub const Shell = completion.Shell;

// Re-export suggestions
pub const suggestions = @import("suggestions.zig");

// Re-export errors
pub const errors = @import("errors.zig");
pub const ClappError = errors.ClappError;
pub const ErrorContext = errors.ErrorContext;

// Re-export testing utilities
pub const test_utils = @import("test_utils.zig");
pub const MockStreams = test_utils.MockStreams;
pub const TestContext = test_utils.TestContext;
pub const ExecResult = test_utils.ExecResult;
pub const Expect = test_utils.Expect;

test {
    // Run all tests in imported modules
    std.testing.refAllDecls(@This());
    _ = @import("utils.zig");
    _ = @import("option.zig");
    _ = @import("command.zig");
    _ = @import("cli.zig");
    _ = @import("style.zig");
    _ = @import("prompts.zig");
    _ = @import("spinner.zig");
    _ = @import("config.zig");
    _ = @import("completion.zig");
    _ = @import("suggestions.zig");
    _ = @import("errors.zig");
    _ = @import("test_utils.zig");
}
