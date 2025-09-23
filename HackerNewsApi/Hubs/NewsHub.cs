using Microsoft.AspNetCore.SignalR;

namespace HackerNewsApi.Hubs;

/// <summary>
/// SignalR hub for real-time news story updates
/// </summary>
public class NewsHub : Hub
{
    private readonly ILogger<NewsHub> _logger;

    public NewsHub(ILogger<NewsHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, "NewsUpdates");
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "NewsUpdates");
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Method that can be called by clients to join the news updates group
    /// </summary>
    public async Task JoinNewsUpdates()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "NewsUpdates");
        _logger.LogDebug("Client {ConnectionId} joined news updates group", Context.ConnectionId);
    }

    /// <summary>
    /// Method that can be called by clients to leave the news updates group
    /// </summary>
    public async Task LeaveNewsUpdates()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "NewsUpdates");
        _logger.LogDebug("Client {ConnectionId} left news updates group", Context.ConnectionId);
    }
}