namespace PersonalExecutionOS.Core.Interfaces;

/// <summary>
/// Standardized result object for all service operations.
/// </summary>
/// <typeparam name="T">The type of the successful result value</typeparam>
public record ServiceResult<T>(bool IsSuccess, T? Value, string? Error)
{
    /// <summary>
    /// Creates a successful result with the given value.
    /// </summary>
    public static ServiceResult<T> Success(T value) => new(true, value, null);

    /// <summary>
    /// Creates a failed result with the given error message.
    /// </summary>
    public static ServiceResult<T> Failure(string error) => new(false, default, error);
}
