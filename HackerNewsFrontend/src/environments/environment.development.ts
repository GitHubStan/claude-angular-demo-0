export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
  // No Application Insights needed for local development

  // Auth0 configuration
  auth0: {
    enabled: true, // Feature flag: set to false to disable Auth0
    domain: 'dev-witz8wrgeafg4738.us.auth0.com',
    clientId: '1IccC9p9YwPWoji5fpMzvHzHJeDfL6zc',
    authorizationParams: {
      redirect_uri: 'http://localhost:4200',
      audience: 'https://hackernews-api'
    },
    httpInterceptor: {
      allowedList: [
        'http://localhost:5000/api/*'
      ]
    }
  }
};
