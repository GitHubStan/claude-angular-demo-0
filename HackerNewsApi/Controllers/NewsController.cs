using HackerNewsApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HackerNewsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly IHackerNewsService _hackerNewsService;
        private readonly ILogger<NewsController> _logger;

        public NewsController(IHackerNewsService hackerNewsService, ILogger<NewsController> logger)
        {
            _hackerNewsService = hackerNewsService;
            _logger = logger;
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
    }
}