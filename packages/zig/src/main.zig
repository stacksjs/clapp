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

// Re-export advanced prompts
pub const autocomplete = @import("prompts/autocomplete.zig");
pub const AutocompleteOptions = autocomplete.AutocompleteOptions;
pub const path_prompt = @import("prompts/path.zig");
pub const PathOptions = path_prompt.PathOptions;
pub const PathType = path_prompt.PathType;
pub const number_prompt = @import("prompts/number.zig");
pub const NumberOptions = number_prompt.NumberOptions;
pub const advanced_prompts = @import("prompts/advanced.zig");
pub const GroupResult = advanced_prompts.GroupResult;
pub const SelectKeyOption = advanced_prompts.SelectKeyOption;
pub const SelectKeyOptions = advanced_prompts.SelectKeyOptions;
pub const StreamType = advanced_prompts.StreamType;

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

// Re-export middleware
pub const middleware = @import("middleware.zig");
pub const MiddlewareChain = middleware.MiddlewareChain;
pub const MiddlewareContext = middleware.MiddlewareContext;
pub const MiddlewareFn = middleware.MiddlewareFn;

// Re-export signals
pub const signals = @import("signals.zig");
pub const SignalHandlerFn = signals.SignalHandlerFn;
pub const GracefulShutdown = signals.GracefulShutdown;

// Re-export output
pub const output = @import("output.zig");
pub const OutputFormat = output.OutputFormat;
pub const JsonOutput = output.JsonOutput;

// Re-export debug
pub const debug = @import("debug.zig");
pub const Timer = debug.Timer;

// Re-export http
pub const http = @import("http.zig");
pub const HttpClient = http.HttpClient;
pub const HttpMethod = http.HttpMethod;
pub const HttpResponse = http.HttpResponse;

// Re-export terminal utilities
pub const terminal = @import("terminal.zig");

// Re-export state management
pub const state = @import("state.zig");
pub const State = state.State;
pub const Action = state.Action;
pub const Settings = state.Settings;

// Re-export validation
pub const validation = @import("validation.zig");
pub const ValidationResult = validation.ValidationResult;
pub const ValidatorFn = validation.ValidatorFn;
pub const ValidatorChain = validation.ValidatorChain;
pub const FieldValidator = validation.FieldValidator;

// Re-export logging
pub const log = @import("log.zig");

// Re-export events
pub const events = @import("events.zig");
pub const EventEmitter = events.EventEmitter;
pub const ListenerFn = events.ListenerFn;

// Re-export task log
pub const task_log = @import("task_log.zig");
pub const TaskExecutor = task_log.TaskExecutor;
pub const TaskLog = task_log.TaskLog;
pub const Task = task_log.Task;
pub const TaskFn = task_log.TaskFn;

test {
    // Run all tests in imported modules
    std.testing.refAllDecls(@This());
    _ = @import("utils.zig");
    _ = @import("option.zig");
    _ = @import("command.zig");
    _ = @import("cli.zig");
    _ = @import("style.zig");
    _ = @import("prompts.zig");
    _ = @import("prompts/autocomplete.zig");
    _ = @import("prompts/path.zig");
    _ = @import("prompts/number.zig");
    _ = @import("prompts/advanced.zig");
    _ = @import("spinner.zig");
    _ = @import("config.zig");
    _ = @import("completion.zig");
    _ = @import("suggestions.zig");
    _ = @import("errors.zig");
    _ = @import("test_utils.zig");
    _ = @import("middleware.zig");
    _ = @import("signals.zig");
    _ = @import("output.zig");
    _ = @import("debug.zig");
    _ = @import("http.zig");
    _ = @import("terminal.zig");
    _ = @import("state.zig");
    _ = @import("validation.zig");
    _ = @import("log.zig");
    _ = @import("events.zig");
    _ = @import("task_log.zig");
}
