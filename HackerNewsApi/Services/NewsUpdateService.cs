using HackerNewsApi.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;

namespace HackerNewsApi.Services;

/// <summary>
/// Background service that periodically checks for new stories and notifies clients via SignalR
/// </summary>
public class NewsUpdateService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<NewsHub> _hubContext;
    private readonly IMemoryCache _cache;
    private readonly ILogger<NewsUpdateService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes
    private const string LastCheckKey = "last_story_check";
    private List<int> _lastKnownStoryIds = new();

    public NewsUpdateService(
        IServiceScopeFactory scopeFactory,
        IHubContext<NewsHub> hubContext,
        IMemoryCache cache,
        ILogger<NewsUpdateService> logger)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
        _cache = cache;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("News Update Service started");

        // Initialize with current stories
        await InitializeKnownStories();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckForNewStories();
                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking for new stories");
                // Continue running despite errors
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait a minute before retrying
            }
        }

        _logger.LogInformation("News Update Service stopped");
    }

    private async Task InitializeKnownStories()
    {
        using var scope = _scopeFactory.CreateScope();
        var hackerNewsService = scope.ServiceProvider.GetRequiredService<IHackerNewsService>();

        try
        {
            var initialStories = await hackerNewsService.GetTopStoriesAsync(50, 1); // Get first 50 stories
            _lastKnownStoryIds = initialStories.Select(s => s.Id).ToList();
            _logger.LogInformation("Initialized with {Count} known stories", _lastKnownStoryIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize known stories");
        }
    }

    private async Task CheckForNewStories()
    {
        using var scope = _scopeFactory.CreateScope();
        var hackerNewsService = scope.ServiceProvider.GetRequiredService<IHackerNewsService>();

        try
        {
            _logger.LogDebug("Checking for new stories...");

            // Get current top stories (first 50)
            var currentStories = await hackerNewsService.GetTopStoriesAsync(50, 1);
            var currentStoryIds = currentStories.Select(s => s.Id).ToList();

            // Find new stories (stories that weren't in our last known list)
            var newStoryIds = currentStoryIds.Except(_lastKnownStoryIds).ToList();

            if (newStoryIds.Any())
            {
                _logger.LogInformation("Found {Count} new stories", newStoryIds.Count);

                // Get details for new stories
                var newStories = currentStories.Where(s => newStoryIds.Contains(s.Id)).ToList();

                // Notify clients about new stories
                await _hubContext.Clients.Group("NewsUpdates").SendAsync("NewStoriesAvailable", new
                {
                    Count = newStories.Count,
                    Stories = newStories.Take(5), // Send top 5 new stories for preview
                    Timestamp = DateTime.UtcNow
                });

                _logger.LogInformation("Notified clients about {Count} new stories", newStories.Count);
            }
            else
            {
                _logger.LogDebug("No new stories found");
            }

            // Update our known stories list
            _lastKnownStoryIds = currentStoryIds;

            // Update cache with last check time
            _cache.Set(LastCheckKey, DateTime.UtcNow, TimeSpan.FromHours(1));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking for new stories");
        }
    }

    /// <summary>
    /// Get the last time stories were checked
    /// </summary>
    public DateTime? GetLastCheckTime()
    {
        return _cache.TryGetValue(LastCheckKey, out DateTime lastCheck) ? lastCheck : null;
    }
}