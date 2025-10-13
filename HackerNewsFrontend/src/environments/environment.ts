export const environment = {
  production: true,
  apiUrl: 'https://app-hackernews-demo-api.azurewebsites.net',
  // Application Insights will be configured via Azure Static Web App settings

  // Auth0 configuration
  auth0: {
    enabled: false, // Feature flag: set to true to enable Auth0 in production
    domain: 'dev-witz8wrgeafg4738.us.auth0.com',
    clientId: '1IccC9p9YwPWoji5fpMzvHzHJeDfL6zc',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: 'https://hackernews-api'
    },
    httpInterceptor: {
      allowedList: [
        'https://app-hackernews-demo-api.azurewebsites.net/api/*'
      ]
    }
  }
};
