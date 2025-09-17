# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an Angular application (`my-sample-app`) that uses Angular 20.3.0 with TypeScript. The project follows modern Angular patterns:

- **Standalone components** - No NgModules are used
- **Signal-based state management** - Using Angular signals for reactive state
- **Zoneless change detection** - Using `provideZonelessChangeDetection()`
- **Modular SCSS design system** - Organized into separate files for colors, typography, layout, animations, and effects

## Common Commands

All commands should be run from the `my-sample-app` directory:

```bash
cd my-sample-app
```

### Development
- `npm start` or `ng serve` - Start development server (http://localhost:4200)
- `ng build --watch --configuration development` - Build in watch mode

### Building
- `npm run build` or `ng build` - Production build
- `ng build --configuration development` - Development build

### Testing
- `npm test` or `ng test` - Run unit tests with Karma/Jasmine
- No e2e testing framework is configured

### Code Generation
- `ng generate component component-name` - Generate new component
- `ng generate service service-name` - Generate new service
- `ng generate --help` - See all available schematics

## Architecture

### Application Bootstrap
- Entry point: `src/main.ts` - Uses `bootstrapApplication()` with standalone components
- Configuration: `src/app/app.config.ts` - Provides routing, HTTP client, and zoneless change detection
- Routing: `src/app/app.routes.ts` - Simple route configuration

### Component Structure
- **App Component** (`src/app/app.ts`) - Root component with navigation
- **Welcome Component** (`src/app/welcome/`) - Landing page
- **News Component** (`src/app/news/`) - Displays Hacker News stories

### Services
- **HackerNews Service** (`src/app/services/hacker-news.ts`) - Fetches and caches stories from Hacker News API
  - Implements pagination with caching
  - Uses RxJS operators for data transformation
  - Includes error handling

### Design System
The project uses a modular SCSS design system located in `src/styles/`:
- `_colors.scss` - Color variables and utilities
- `_typography.scss` - Font and text styling
- `_layout.scss` - Layout and spacing utilities
- `_animations.scss` - Animation definitions
- `_effects.scss` - Visual effects and shadows

All design system modules are imported in `src/styles.scss`.

## TypeScript Configuration

The project uses strict TypeScript settings:
- Strict mode enabled
- Experimental decorators for Angular
- Modern target (ES2022)
- Angular-specific compiler options for strict templates and injection

## Code Style

Prettier is configured with:
- 100 character line width
- Single quotes
- Angular parser for HTML templates

## Important Patterns

1. **Use inject() function** instead of constructor injection in services
2. **Standalone components only** - No NgModules
3. **Signal-based reactivity** - Use `signal()`, `computed()`, `input()`, `output()`
4. **Zoneless change detection** - The app uses zoneless mode
5. **Modern control flow** - Use `@if`, `@for`, `@switch` in templates
6. **SCSS organization** - Follow the modular design system structure

Refer to `.claude/CLAUDE.md` for detailed Angular and TypeScript best practices.