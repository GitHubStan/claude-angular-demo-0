# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["HackerNewsApi.csproj", "./"]
RUN dotnet restore "HackerNewsApi.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "HackerNewsApi.csproj" -c Release -o /app/build
RUN dotnet publish "HackerNewsApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

# Copy published app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HackerNewsApi.dll"]
