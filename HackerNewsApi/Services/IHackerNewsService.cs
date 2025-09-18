using HackerNewsApi.Models;

namespace HackerNewsApi.Services;

public interface IHackerNewsService
{
    Task<IEnumerable<Story>> GetTopStoriesAsync(int pageSize = 10, int page = 1);
    Task<int> GetTotalPagesAsync(int pageSize = 10);
}