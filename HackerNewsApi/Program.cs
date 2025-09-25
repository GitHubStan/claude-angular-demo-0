using HackerNewsApi.Services;
using HackerNewsApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<IHackerNewsService, HackerNewsService>();
builder.Services.AddScoped<IHackerNewsService, HackerNewsService>();

// Add SignalR
builder.Services.AddSignalR();

// Add background service for news updates
builder.Services.AddHostedService<NewsUpdateService>();

// Add CORS for Angular app (updated for Azure Static Web Apps)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR

        // Add Azure Static Web Apps origins if deployed
        if (!builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin =>
                origin.Contains(".azurestaticapps.net") ||
                origin.Contains("localhost")); // Allow Azure Static Web Apps
        }
    });
});

// Add Application Insights telemetry
builder.Services.AddApplicationInsightsTelemetry();

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngularApp");

// Add security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});

// Map health checks
app.MapHealthChecks("/health");

// Map controllers
app.MapControllers();

// Map SignalR hub
app.MapHub<NewsHub>("/newsHub");

app.Run();
