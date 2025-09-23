using HackerNewsApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using HackerNewsApi.Hubs;

namespace HackerNewsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsController : ControllerBase
{
    private readonly IHackerNewsService _hackerNewsService;
    private readonly ILogger<NewsController> _logger;
    private readonly IHubContext<NewsHub> _hubContext;

    public NewsController(IHackerNewsService hackerNewsService,
                          ILogger<NewsController> logger,
                          IHubContext<NewsHub> hubContext)
    {
        _hackerNewsService = hackerNewsService;
        _logger = logger;
        _hubContext = hubContext;
    }

    [HttpGet("top-stories")]
    public async Task<IActionResult> GetTopStories([FromQuery] int pageSize = 10, [FromQuery] int page = 1)
    {
        try
        {
            if (pageSize <= 0 || pageSize > 100)
            {
                return BadRequest("Page size must be between 1 and 100");
            }

            if (page <= 0)
            {
                return BadRequest("Page must be greater than 0");
            }

            _logger.LogInformation("Fetching top stories - Page: {Page}, PageSize: {PageSize}", page, pageSize);

            var stories = await _hackerNewsService.GetTopStoriesAsync(pageSize, page);
            var totalPages = await _hackerNewsService.GetTotalPagesAsync(pageSize);

            var response = new
            {
                Stories = stories,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top stories");
            return StatusCode(500, "An error occurred while fetching stories");
        }
    }

    [HttpPost("test/trigger-notification")]
    public async Task<IActionResult> TriggerTestNotification()
    {
        try
        {
            _logger.LogInformation("Triggering test SignalR notification");

            // Create mock notification data
            var testNotification = new
            {
                Count = 2,
                Stories = new[]
                {
                    new
                    {
                        Id = 888888,
                        Title = "🧪 Test Notification: Backend Triggered Story",
                        Url = "https://example.com/backend-test",
                        Score = 200,
                        By = "test-backend",
                        Time = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                        Descendants = 30
                    },
                    new
                    {
                        Id = 888887,
                        Title = "🧪 Another Backend Test Story",
                        Url = "https://example.com/backend-test-2",
                        Score = 175,
                        By = "test-backend-2",
                        Time = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                        Descendants = 22
                    }
                },
                Timestamp = DateTime.UtcNow.ToString("O")
            };

            // Send notification to all clients in NewsUpdates group
            await _hubContext.Clients.Group("NewsUpdates").SendAsync("NewStoriesAvailable", testNotification);

            _logger.LogInformation("Test notification sent successfully");

            return Ok(new { message = "Test notification sent", notification = testNotification });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending test notification");
            return StatusCode(500, "An error occurred while sending test notification");
        }
    }
}