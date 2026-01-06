using Xunit;
using PersonalExecutionOS.Core.Interfaces;

namespace PersonalExecutionOS.Tests.Unit.Core.Interfaces;

/// <summary>
/// Unit tests for ServiceResult{T} pattern.
/// </summary>
public class ServiceResultTests
{
    [Fact]
    public void Success_WithValidValue_CreatesSuccessResult()
    {
        // Arrange
        var value = "test value";

        // Act
        var result = ServiceResult<string>.Success(value);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(value, result.Value);
        Assert.Null(result.Error);
    }

    [Fact]
    public void Failure_WithErrorMessage_CreatesFailureResult()
    {
        // Arrange
        var errorMessage = "Something went wrong";

        // Act
        var result = ServiceResult<string>.Failure(errorMessage);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Null(result.Value);
        Assert.Equal(errorMessage, result.Error);
    }

    [Fact]
    public void Failure_WithEmptyErrorMessage_CreatesFailureResult()
    {
        // Arrange & Act
        var result = ServiceResult<int>.Failure("");

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(0, result.Value);
        Assert.Equal("", result.Error);
    }
}
