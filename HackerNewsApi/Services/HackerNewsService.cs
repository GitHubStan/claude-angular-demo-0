using HackerNewsApi.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace HackerNewsApi.Services;

public class HackerNewsService : IHackerNewsService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<HackerNewsService> _logger;
    private const string BaseUrl = "https://hacker-news.firebaseio.com/v0";
    private const string TopStoriesKey = "topstories";
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(15);

    public HackerNewsService(HttpClient httpClient, IMemoryCache cache, ILogger<HackerNewsService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Story>> GetTopStoriesAsync(int pageSize = 10, int page = 1)
    {
        _logger.LogInformation("Fetching top stories for page {Page} with size {PageSize}", page, pageSize);

        var storyIds = await GetTopStoryIdsAsync();

        var start = (page - 1) * pageSize;
        var end = start + pageSize;

        if (start >= storyIds.Count)
        {
            return Enumerable.Empty<Story>();
        }

        var pageIds = storyIds.Skip(start).Take(pageSize).ToList();
        _logger.LogInformation("Fetching details for {Count} stories", pageIds.Count);

        var stories = new List<Story>();
        var tasks = pageIds.Select(GetStoryAsync);
        var results = await Task.WhenAll(tasks);

        return results.Where(story => story != null).Cast<Story>();
    }

    public async Task<int> GetTotalPagesAsync(int pageSize = 10)
    {
        var storyIds = await GetTopStoryIdsAsync();
        return (int)Math.Ceiling((double)storyIds.Count / pageSize);
    }

    private async Task<List<int>> GetTopStoryIdsAsync()
    {
        if (_cache.TryGetValue(TopStoriesKey, out List<int>? cachedIds) && cachedIds != null)
        {
            _logger.LogInformation("Using cached story IDs");
            return cachedIds;
        }

        try
        {
            _logger.LogInformation("Fetching story IDs from API");
            var response = await _httpClient.GetStringAsync($"{BaseUrl}/topstories.json");
            var storyIds = JsonSerializer.Deserialize<List<int>>(response);

            if (storyIds == null || !storyIds.Any())
            {
                throw new InvalidOperationException("Invalid response format for story IDs");
            }

            _cache.Set(TopStoriesKey, storyIds, CacheExpiration);
            _logger.LogInformation("Cached {Count} story IDs", storyIds.Count);

            return storyIds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching story IDs");
            throw;
        }
    }

    private async Task<Story?> GetStoryAsync(int id)
    {
        var cacheKey = $"story_{id}";

        if (_cache.TryGetValue(cacheKey, out Story? cachedStory) && cachedStory != null)
        {
            return cachedStory;
        }

        try
        {
            var response = await _httpClient.GetStringAsync($"{BaseUrl}/item/{id}.json");
            var story = JsonSerializer.Deserialize<Story>(response, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (story?.Id == 0)
            {
                _logger.LogWarning("Invalid story data received for ID {Id}", id);
                return null;
            }

            if (story != null)
            {
                _cache.Set(cacheKey, story, CacheExpiration);
                _logger.LogDebug("Cached story {Id}: {Title}", story.Id, story.Title);
            }

            return story;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching story {Id}", id);
            return null;
        }
    }
}