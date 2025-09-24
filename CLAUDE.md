# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack application consisting of:

- **Frontend**: Angular 20.3.0 application (`HackerNewsFrontend`) with TypeScript
- **Backend**: .NET 9.0 Web API (`HackerNewsApi`) with C#

The Angular frontend consumes the .NET backend API to display Hacker News stories with pagination and caching.

---

## Angular Frontend (`HackerNewsFrontend`)

### Project Structure

The Angular application follows modern Angular patterns:

- **Standalone components** - No NgModules are used
- **Signal-based state management** - Using Angular signals for reactive state
- **Zoneless change detection** - Using `provideZonelessChangeDetection()`
- **Modular SCSS design system** - Organized into separate files for colors, typography, layout, animations, and effects

### Common Commands

All commands should be run from the `HackerNewsFrontend` directory:

```bash
cd HackerNewsFrontend
```

#### Development

- `npm start` or `ng serve` - Start development server (http://localhost:4200)
- `ng build --watch --configuration development` - Build in watch mode

#### Building

- `npm run build` or `ng build` - Production build
- `ng build --configuration development` - Development build

#### Testing

- `npm test` or `ng test` - Run unit tests with Karma/Jasmine
- No e2e testing framework is configured

#### Code Generation

- `ng generate component component-name` - Generate new component
- `ng generate service service-name` - Generate new service
- `ng generate --help` - See all available schematics

### Architecture

#### Application Bootstrap

- Entry point: `src/main.ts` - Uses `bootstrapApplication()` with standalone components
- Configuration: `src/app/app.config.ts` - Provides routing, HTTP client, and zoneless change detection
- Routing: `src/app/app.routes.ts` - Simple route configuration

#### Component Structure

- **App Component** (`src/app/app.ts`) - Root component with navigation
- **Welcome Component** (`src/app/welcome/`) - Landing page
- **News Component** (`src/app/news/`) - Displays Hacker News stories

#### Services

- **HackerNews Service** (`src/app/services/hacker-news.ts`) - Fetches and caches stories from backend API
  - Implements pagination with caching
  - Uses RxJS operators for data transformation
  - Includes error handling

#### Design System

The project uses a modular SCSS design system located in `src/styles/`:

- `_colors.scss` - Color variables and utilities
- `_typography.scss` - Font and text styling
- `_layout.scss` - Layout and spacing utilities
- `_animations.scss` - Animation definitions
- `_effects.scss` - Visual effects and shadows

All design system modules are imported in `src/styles.scss`.

### TypeScript Configuration

The project uses strict TypeScript settings:

- Strict mode enabled
- Experimental decorators for Angular
- Modern target (ES2022)
- Angular-specific compiler options for strict templates and injection

### Angular Code Style & Patterns

Prettier is configured with:

- 100 character line width
- Single quotes
- Angular parser for HTML templates

#### Important Angular/TypeScript Patterns

1. **Use inject() function** instead of constructor injection in services
2. **Standalone components only** - No NgModules
3. **Signal-based reactivity** - Use `signal()`, `computed()`, `input()`, `output()`
4. **Zoneless change detection** - The app uses zoneless mode
5. **Modern control flow** - Use `@if`, `@for`, `@switch` in templates
6. **SCSS organization** - Follow the modular design system structure

---

## .NET Backend (`HackerNewsApi`)

### Project Structure

- **Controllers** (`Controllers/`) - API endpoints
- **Models** (`Models/`) - Data transfer objects
- **Services** (`Services/`) - Business logic and external API integration

### Common Commands

All commands should be run from the `HackerNewsApi` directory:

```bash
cd HackerNewsApi
```

#### Development

- `dotnet run` - Start development server (http://localhost:5000)
- `dotnet watch run` - Start with hot reload

#### Building

- `dotnet build` - Build the project
- `dotnet clean` - Clean build artifacts

#### Testing

- `dotnet test` - Run unit tests

### Architecture

#### API Structure

- **NewsController** - Provides `/api/news/top-stories` endpoint with pagination
- **HackerNewsService** - Handles external API calls to Hacker News API with caching
- **Story Model** - Data structure for Hacker News stories

#### Features

- Memory caching for improved performance
- CORS configuration for Angular frontend
- Pagination support
- Error handling and logging

### C# Code Style & Patterns

- **Use file-scoped namespaces** - Prefer `namespace MyNamespace;` over block-scoped `namespace MyNamespace { }`
- Follow standard C# naming conventions
- Use modern C# language features
- Dependency injection for services
- Async/await for all I/O operations

---

## Workflow Instructions

- **Before committing, ensure all tests pass and there are no compilation warnings**
- Build and test both Angular and .NET projects before finalizing changes
- Follow the established coding patterns and conventions outlined in this document
- Ensure the backend API is running when testing the Angular frontend

### Full-Stack Development Workflow

1. Start the .NET API: `cd HackerNewsApi && dotnet run`
2. Start the Angular app: `cd HackerNewsFrontend && npm start`
3. The Angular app will consume the API at `http://localhost:5000`

Refer to `.claude/CLAUDE.md` for detailed Angular and TypeScript best practices.
