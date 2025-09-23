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

// Add CORS for Angular app (updated for SignalR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngularApp");
app.MapControllers();

// Map SignalR hub
app.MapHub<NewsHub>("/newsHub");

app.Run();
