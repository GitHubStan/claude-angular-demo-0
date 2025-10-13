# Auth0 Integration Guide

This document describes the Auth0 authentication implementation in this application.

## Overview

This application includes Auth0 authentication integration with a **feature flag** that allows you to enable/disable authentication in both frontend and backend independently.

## Feature Flag Configuration

### Frontend (Angular)

Located in environment files:
- **Development**: `HackerNewsFrontend/src/environments/environment.development.ts`
- **Production**: `HackerNewsFrontend/src/environments/environment.ts`

```typescript
auth0: {
  enabled: true, // Set to false to disable Auth0
  domain: 'dev-witz8wrgeafg4738.us.auth0.com',
  clientId: '1IccC9p9YwPWoji5fpMzvHzHJeDfL6zc',
  authorizationParams: {
    redirect_uri: 'http://localhost:4200',
    audience: 'https://hackernews-api'
  }
}
```

### Backend (.NET)

Located in appsettings files:
- **Development**: `HackerNewsApi/appsettings.Development.json`
- **Production**: `HackerNewsApi/appsettings.json`

```json
{
  "Auth0": {
    "Enabled": true,
    "Domain": "dev-witz8wrgeafg4738.us.auth0.com",
    "Audience": "https://hackernews-api"
  }
}
```

## Auth0 Dashboard Configuration

### 1. Application Settings (Single Page Application)

In your Auth0 Dashboard:

**Allowed Callback URLs:**
```
http://localhost:4200
```

**Allowed Logout URLs:**
```
http://localhost:4200
```

**Allowed Web Origins:**
```
http://localhost:4200
```

### 2. API Settings

**API Identifier (Audience):**
```
https://hackernews-api
```

## Architecture

### Frontend Components

1. **AuthService** (`src/app/services/auth.service.ts`)
   - Wrapper around Auth0 SDK
   - Provides login/logout methods
   - Exposes authentication state observables
   - Feature flag aware (returns empty observables when disabled)

2. **Auth Guard** (`src/app/guards/auth.guard.ts`)
   - Protects routes requiring authentication
   - Automatically allows access when Auth0 is disabled
   - Usage: Add `canActivate: [authGuard]` to route configuration

3. **HTTP Interceptor** (`src/app/interceptors/auth.interceptor.ts`)
   - Automatically attaches JWT tokens to API requests
   - Only applies to URLs in the configured allowedList
   - Gracefully handles token retrieval errors

4. **UI Components**
   - Login/Logout buttons in navigation bar
   - Displays user name/email when authenticated
   - Only visible when Auth0 is enabled

### Backend Components

1. **JWT Authentication** (`Program.cs`)
   - Validates JWT tokens from Auth0
   - Only enabled when `Auth0:Enabled` is true
   - Validates issuer, audience, and signature

2. **Authorization Attributes** (`Controllers/NewsController.cs`)
   - Optional `[Authorize]` attribute (commented out by default)
   - Uncomment to require authentication for endpoints
   - Can be applied at controller or action level

## Testing the Implementation

### 1. Start the Backend API
```bash
cd HackerNewsApi
dotnet run
```

The API will be available at `http://localhost:5000`

### 2. Start the Angular Frontend
```bash
cd HackerNewsFrontend
npm start
```

The app will be available at `http://localhost:4200`

### 3. Test Authentication Flow

1. Navigate to `http://localhost:4200`
2. Click the **Login** button in the navigation bar
3. You'll be redirected to Auth0's Universal Login page
4. Sign in with your Auth0 credentials (or create an account)
5. After successful authentication, you'll be redirected back to the app
6. Your name/email will appear in the navigation bar
7. Click **Logout** to sign out

### 4. Test API with Authentication (Optional)

To require authentication for API endpoints:

1. Open `HackerNewsApi/Controllers/NewsController.cs`
2. Uncomment the `[Authorize]` attribute on line 12
3. Restart the backend
4. The API will now require valid JWT tokens for all requests

## Disabling Auth0

### For Development/Demo

To disable Auth0 without removing the code:

**Frontend:**
```typescript
// environment.development.ts
auth0: {
  enabled: false, // Changed from true
  // ... rest of config
}
```

**Backend:**
```json
// appsettings.Development.json
{
  "Auth0": {
    "Enabled": false,
    "Domain": "dev-witz8wrgeafg4738.us.auth0.com",
    "Audience": "https://hackernews-api"
  }
}
```

When disabled:
- Login/Logout buttons will not appear
- Auth guard will allow all routes
- HTTP interceptor will not add tokens
- Backend will not validate JWT tokens

## Free Tier Limits

Auth0 Free Tier includes:
- Up to **7,500 active users** per month
- Unlimited logins
- Social login providers (Google, GitHub, etc.)
- Username/password authentication
- Multi-factor authentication (MFA)

Perfect for demos, portfolios, and small projects!

## Interview Talking Points

When discussing this implementation in your interview:

1. **Full-stack OAuth/OIDC flow**: Demonstrates understanding of modern authentication
2. **Feature flags**: Shows architectural flexibility and deployment strategies
3. **Security best practices**: JWT validation, CORS, HTTPS
4. **Angular patterns**: Modern standalone components, signals, dependency injection
5. **.NET middleware**: Authentication/authorization pipeline, configuration management
6. **User experience**: Seamless login/logout flow with Universal Login
7. **Production-ready**: Environment-based configuration, error handling

## Troubleshooting

### "Invalid state" error after login
- Check that callback URLs are configured correctly in Auth0 Dashboard
- Ensure `redirect_uri` in environment file matches Auth0 settings

### "Audience validation failed" error
- Verify the API identifier in Auth0 matches the `audience` configuration
- Check that the audience is included in the token request

### CORS errors
- Ensure backend CORS policy includes frontend origin
- Check that credentials are allowed for Auth0 requests

### Token not being sent to API
- Verify API URL matches pattern in `httpInterceptor.allowedList`
- Check browser console for interceptor errors

## Resources

- [Auth0 Angular SDK Documentation](https://auth0.com/docs/quickstart/spa/angular)
- [Auth0 .NET Web API Documentation](https://auth0.com/docs/quickstart/backend/aspnet-core-webapi)
- [JWT.io - JWT Debugger](https://jwt.io/)
