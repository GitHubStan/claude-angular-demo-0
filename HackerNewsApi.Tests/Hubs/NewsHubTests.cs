using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using HackerNewsApi.Hubs;
using System.Security.Claims;
using Xunit;

namespace HackerNewsApi.Tests.Hubs;

public class NewsHubTests
{
    private readonly Mock<ILogger<NewsHub>> _mockLogger;
    private readonly Mock<HubCallerContext> _mockContext;
    private readonly Mock<IGroupManager> _mockGroups;
    private readonly Mock<IHubCallerClients> _mockClients;
    private readonly NewsHub _newsHub;

    public NewsHubTests()
    {
        _mockLogger = new Mock<ILogger<NewsHub>>();
        _mockContext = new Mock<HubCallerContext>();
        _mockGroups = new Mock<IGroupManager>();
        _mockClients = new Mock<IHubCallerClients>();

        _newsHub = new NewsHub(_mockLogger.Object)
        {
            Context = _mockContext.Object,
            Groups = _mockGroups.Object,
            Clients = _mockClients.Object
        };

        // Setup context
        _mockContext.Setup(x => x.ConnectionId).Returns("test-connection-id");
        _mockContext.Setup(x => x.User).Returns(new ClaimsPrincipal());
    }

    [Fact]
    public async Task OnConnectedAsync_ShouldAddToGroupAndLogConnection()
    {
        // Arrange
        _mockGroups.Setup(x => x.AddToGroupAsync("test-connection-id", "NewsUpdates", default))
                   .Returns(Task.CompletedTask);

        // Act
        await _newsHub.OnConnectedAsync();

        // Assert
        _mockGroups.Verify(x => x.AddToGroupAsync("test-connection-id", "NewsUpdates", default), Times.Once);
        VerifyLoggerCalled(LogLevel.Information, "Client connected: test-connection-id");
    }

    [Fact]
    public async Task OnDisconnectedAsync_ShouldRemoveFromGroupAndLogDisconnection()
    {
        // Arrange
        _mockGroups.Setup(x => x.RemoveFromGroupAsync("test-connection-id", "NewsUpdates", default))
                   .Returns(Task.CompletedTask);

        // Act
        await _newsHub.OnDisconnectedAsync(null);

        // Assert
        _mockGroups.Verify(x => x.RemoveFromGroupAsync("test-connection-id", "NewsUpdates", default), Times.Once);
        VerifyLoggerCalled(LogLevel.Information, "Client disconnected: test-connection-id");
    }

    [Fact]
    public async Task OnDisconnectedAsync_WithException_ShouldStillRemoveFromGroupAndLog()
    {
        // Arrange
        var exception = new Exception("Test exception");
        _mockGroups.Setup(x => x.RemoveFromGroupAsync("test-connection-id", "NewsUpdates", default))
                   .Returns(Task.CompletedTask);

        // Act
        await _newsHub.OnDisconnectedAsync(exception);

        // Assert
        _mockGroups.Verify(x => x.RemoveFromGroupAsync("test-connection-id", "NewsUpdates", default), Times.Once);
        VerifyLoggerCalled(LogLevel.Information, "Client disconnected: test-connection-id");
    }

    [Fact]
    public async Task JoinNewsUpdates_ShouldAddToGroupAndLog()
    {
        // Arrange
        _mockGroups.Setup(x => x.AddToGroupAsync("test-connection-id", "NewsUpdates", default))
                   .Returns(Task.CompletedTask);

        // Act
        await _newsHub.JoinNewsUpdates();

        // Assert
        _mockGroups.Verify(x => x.AddToGroupAsync("test-connection-id", "NewsUpdates", default), Times.Once);
        VerifyLoggerCalled(LogLevel.Debug, "Client test-connection-id joined news updates group");
    }

    [Fact]
    public async Task LeaveNewsUpdates_ShouldRemoveFromGroupAndLog()
    {
        // Arrange
        _mockGroups.Setup(x => x.RemoveFromGroupAsync("test-connection-id", "NewsUpdates", default))
                   .Returns(Task.CompletedTask);

        // Act
        await _newsHub.LeaveNewsUpdates();

        // Assert
        _mockGroups.Verify(x => x.RemoveFromGroupAsync("test-connection-id", "NewsUpdates", default), Times.Once);
        VerifyLoggerCalled(LogLevel.Debug, "Client test-connection-id left news updates group");
    }

    [Fact]
    public async Task OnConnectedAsync_GroupAddFails_ShouldStillLogConnection()
    {
        // Arrange
        _mockGroups.Setup(x => x.AddToGroupAsync("test-connection-id", "NewsUpdates", default))
                   .ThrowsAsync(new Exception("Group add failed"));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(() => _newsHub.OnConnectedAsync());
        Assert.Equal("Group add failed", exception.Message);

        VerifyLoggerCalled(LogLevel.Information, "Client connected: test-connection-id");
    }

    private void VerifyLoggerCalled(LogLevel level, string message)
    {
        _mockLogger.Verify(
            x => x.Log(
                level,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains(message)),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}