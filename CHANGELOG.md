All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-01

### Added
- Initial release of TypeScript Typed Logger
- Full TypeScript support with strict typing
- Multiple transport support (Console, File, HTTP, Memory)
- Configurable formatters (JSON, Console, Simple, Dev)
- Middleware system for extensible log processing
- Child logger support with inherited metadata
- Performance logging with timing and profiling
- Logger factory with environment-based configurations
- Comprehensive test suite with >80% coverage
- Complete documentation and examples

### Features
- **Core Logging**: Support for all standard log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
- **Structured Logging**: Rich context and metadata support
- **Transport System**: Pluggable transports with individual level configuration
- **Formatting**: Multiple built-in formatters with customization options
- **Performance**: Built-in timing and profiling capabilities
- **Extensibility**: Middleware system for custom log processing
- **Testing**: Memory transport and utilities for testing
- **Production Ready**: File rotation, HTTP batching, error handling
