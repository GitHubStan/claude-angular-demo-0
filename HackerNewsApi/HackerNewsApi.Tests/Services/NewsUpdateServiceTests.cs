using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using HackerNewsApi.Hubs;
using HackerNewsApi.Models;
using HackerNewsApi.Services;

namespace HackerNewsApi.Tests.Services;

public class NewsUpdateServiceTests : IDisposable
{
    private readonly Mock<IServiceScopeFactory> _mockScopeFactory;
    private readonly Mock<IServiceScope> _mockScope;
    private readonly Mock<IServiceProvider> _mockServiceProvider;
    private readonly Mock<IHubContext<NewsHub>> _mockHubContext;
    private readonly Mock<IClientProxy> _mockClientProxy;
    private readonly Mock<IHubClients> _mockClients;
    private readonly Mock<IHackerNewsService> _mockHackerNewsService;
    private readonly Mock<ILogger<NewsUpdateService>> _mockLogger;
    private readonly IMemoryCache _memoryCache;
    private readonly NewsUpdateService _newsUpdateService;

    public NewsUpdateServiceTests()
    {
        _mockScopeFactory = new Mock<IServiceScopeFactory>();
        _mockScope = new Mock<IServiceScope>();
        _mockServiceProvider = new Mock<IServiceProvider>();
        _mockHubContext = new Mock<IHubContext<NewsHub>>();
        _mockClientProxy = new Mock<IClientProxy>();
        _mockClients = new Mock<IHubClients>();
        _mockHackerNewsService = new Mock<IHackerNewsService>();
        _mockLogger = new Mock<ILogger<NewsUpdateService>>();
        _memoryCache = new MemoryCache(new MemoryCacheOptions());

        // Setup dependency injection mocks
        _mockScopeFactory.Setup(x => x.CreateScope()).Returns(_mockScope.Object);
        _mockScope.Setup(x => x.ServiceProvider).Returns(_mockServiceProvider.Object);
        _mockServiceProvider.Setup(x => x.GetService(typeof(IHackerNewsService)))
                           .Returns(_mockHackerNewsService.Object);

        // Setup SignalR mocks
        _mockHubContext.Setup(x => x.Clients).Returns(_mockClients.Object);
        _mockClients.Setup(x => x.Group("NewsUpdates")).Returns(_mockClientProxy.Object);

        _newsUpdateService = new NewsUpdateService(
            _mockScopeFactory.Object,
            _mockHubContext.Object,
            _memoryCache,
            _mockLogger.Object
        );
    }

    [Fact]
    public void GetLastCheckTime_WhenNoCacheEntry_ShouldReturnNull()
    {
        // Act
        var result = _newsUpdateService.GetLastCheckTime();

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void GetLastCheckTime_WhenCacheEntryExists_ShouldReturnDateTime()
    {
        // Arrange
        var testTime = DateTime.UtcNow;
        _memoryCache.Set("last_story_check", testTime, TimeSpan.FromHours(1));

        // Act
        var result = _newsUpdateService.GetLastCheckTime();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(testTime, result.Value);
    }

    [Fact]
    public async Task CheckForNewStories_WithNoNewStories_ShouldNotNotifyClients()
    {
        // Arrange
        var existingStories = new List<Story>
        {
            new() { Id = 1, Title = "Story 1", Url = "https://example.com/1", Score = 100, By = "user1", Time = 1234567890, Descendants = 10 },
            new() { Id = 2, Title = "Story 2", Url = "https://example.com/2", Score = 90, By = "user2", Time = 1234567891, Descendants = 5 }
        };

        _mockHackerNewsService.SetupSequence(x => x.GetTopStoriesAsync(50, 1))
                             .ReturnsAsync(existingStories) // First call for initialization
                             .ReturnsAsync(existingStories); // Second call finds no new stories

        // Act
        var cancellationTokenSource = new CancellationTokenSource();
        var task = _newsUpdateService.StartAsync(cancellationTokenSource.Token);

        // Give the service a moment to initialize
        await Task.Delay(100);

        // Cancel to stop the service
        cancellationTokenSource.Cancel();

        try
        {
            await task;
        }
        catch (OperationCanceledException)
        {
            // Expected when cancellation is requested
        }

        // Assert
        _mockClientProxy.Verify(
            x => x.SendCoreAsync("NewStoriesAvailable", It.IsAny<object[]>(), default),
            Times.Never
        );
    }

    [Fact]
    public async Task CheckForNewStories_WithNewStories_ShouldNotifyClients()
    {
        // Arrange
        var initialStories = new List<Story>
        {
            new() { Id = 1, Title = "Story 1", Url = "https://example.com/1", Score = 100, By = "user1", Time = 1234567890, Descendants = 10 },
            new() { Id = 2, Title = "Story 2", Url = "https://example.com/2", Score = 90, By = "user2", Time = 1234567891, Descendants = 5 }
        };

        var updatedStories = new List<Story>
        {
            new() { Id = 3, Title = "New Story", Url = "https://example.com/3", Score = 120, By = "user3", Time = 1234567892, Descendants = 15 },
            new() { Id = 1, Title = "Story 1", Url = "https://example.com/1", Score = 100, By = "user1", Time = 1234567890, Descendants = 10 },
            new() { Id = 2, Title = "Story 2", Url = "https://example.com/2", Score = 90, By = "user2", Time = 1234567891, Descendants = 5 }
        };

        _mockHackerNewsService.SetupSequence(x => x.GetTopStoriesAsync(50, 1))
                             .ReturnsAsync(initialStories) // Initialization
                             .ReturnsAsync(updatedStories); // Check finds new story

        // Act
        var cancellationTokenSource = new CancellationTokenSource();
        var task = _newsUpdateService.StartAsync(cancellationTokenSource.Token);

        // Give the service time to initialize and make one check
        await Task.Delay(500);

        cancellationTokenSource.Cancel();

        try
        {
            await task;
        }
        catch (OperationCanceledException)
        {
            // Expected when cancellation is requested
        }

        // Assert
        _mockClientProxy.Verify(
            x => x.SendCoreAsync(
                "NewStoriesAvailable",
                It.Is<object[]>(args =>
                    args.Length == 1 &&
                    args[0] != null &&
                    args[0].GetType().GetProperty("Count") != null
                ),
                default
            ),
            Times.AtLeastOnce
        );
    }

    [Fact]
    public async Task Service_InitializationFailure_ShouldContinueRunning()
    {
        // Arrange
        _mockHackerNewsService.Setup(x => x.GetTopStoriesAsync(50, 1))
                             .ThrowsAsync(new Exception("API failure"));

        // Act
        var cancellationTokenSource = new CancellationTokenSource();
        var task = _newsUpdateService.StartAsync(cancellationTokenSource.Token);

        // Give the service time to fail initialization
        await Task.Delay(200);

        cancellationTokenSource.Cancel();

        try
        {
            await task;
        }
        catch (OperationCanceledException)
        {
            // Expected when cancellation is requested
        }

        // Assert - Service should have logged the error but continued running
        VerifyLoggerCalled(LogLevel.Error, "Failed to initialize known stories");
    }

    [Fact]
    public async Task Service_CheckFailure_ShouldContinueRunning()
    {
        // Arrange
        var initialStories = new List<Story>
        {
            new() { Id = 1, Title = "Story 1", Url = "https://example.com/1", Score = 100, By = "user1", Time = 1234567890, Descendants = 10 }
        };

        _mockHackerNewsService.SetupSequence(x => x.GetTopStoriesAsync(50, 1))
                             .ReturnsAsync(initialStories) // Successful initialization
                             .ThrowsAsync(new Exception("Check failure")); // Failed check

        // Act
        var cancellationTokenSource = new CancellationTokenSource();
        var task = _newsUpdateService.StartAsync(cancellationTokenSource.Token);

        // Give the service time to initialize and attempt a check
        await Task.Delay(300);

        cancellationTokenSource.Cancel();

        try
        {
            await task;
        }
        catch (OperationCanceledException)
        {
            // Expected when cancellation is requested
        }

        // Assert - Service should have logged the error but continued running
        VerifyLoggerCalled(LogLevel.Error, "Error checking for new stories");
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
            Times.AtLeastOnce);
    }

    public void Dispose()
    {
        _memoryCache?.Dispose();
    }
}