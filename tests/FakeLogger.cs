using Microsoft.Extensions.Logging;

namespace PersonalExecutionOS.Tests;

/// <summary>
/// Fake logger for testing purposes.
/// </summary>
/// <typeparam name="T">The logger category type.</typeparam>
internal class FakeLogger<T> : ILogger<T>
{
    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

    public bool IsEnabled(LogLevel logLevel) => true;

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        // No-op for testing
    }
}
