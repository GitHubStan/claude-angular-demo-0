@description('The name prefix for all resources')
param namePrefix string = 'hackernews'

@description('The environment (e.g., dev, staging, prod)')
param environment string = 'demo'

@description('The location for all resources')
param location string = resourceGroup().location

var resourcePrefix = '${namePrefix}-${environment}'

// Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'env-${resourcePrefix}'
  location: location
  properties: {
    zoneRedundant: false
  }
  tags: {
    Environment: environment
    Project: 'HackerNews'
  }
}

// Container App for .NET API
resource apiContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'api-${resourcePrefix}'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 5000
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
          allowedHeaders: ['*']
        }
      }
    }
    template: {
      containers: [
        {
          name: 'hackernews-api'
          image: 'mcr.microsoft.com/dotnet/samples:aspnetapp'
          resources: {
            cpu: '0.25'
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
  tags: {
    Environment: environment
    Project: 'HackerNews'
  }
}

// Static Web App for Angular Frontend
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'stapp-${resourcePrefix}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
  tags: {
    Environment: environment
    Project: 'HackerNews'
  }
}

// Outputs
output apiUrl string = 'https://${apiContainerApp.properties.configuration.ingress.fqdn}'
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output resourceGroupName string = resourceGroup().name