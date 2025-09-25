@description('The name prefix for all resources')
param namePrefix string = 'hackernews'

@description('The environment (e.g., dev, staging, prod)')
param environment string = 'demo'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The SKU for the App Service Plan')
param appServicePlanSku string = 'F1'

var resourcePrefix = '${namePrefix}-${environment}'

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${resourcePrefix}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
  tags: {
    Environment: environment
    Project: 'HackerNews'
  }
}

// App Service Plan (F1 Free)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'asp-${resourcePrefix}'
  location: location
  sku: {
    name: appServicePlanSku
    tier: 'Free'
    capacity: 1
  }
  properties: {
    reserved: false // Windows
  }
  tags: {
    Environment: environment
    Project: 'HackerNews'
  }
}

// App Service for .NET API
resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: 'app-${resourcePrefix}-api'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      netFrameworkVersion: 'v9.0'
      metadata: [
        {
          name: 'CURRENT_STACK'
          value: 'dotnet'
        }
      ]
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: applicationInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsights.properties.ConnectionString
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://*.azurestaticapps.net'
          'https://localhost:4200' // For local development
        ]
        supportCredentials: false
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
  name: 'stapp-${resourcePrefix}-frontend'
  location: 'Central US' // Static Web Apps have limited regions
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/your-username/your-repo' // Update this
    branch: 'master'
    buildProperties: {
      appLocation: '/HackerNewsFrontend'
      outputLocation: 'dist/hacker-news-frontend'
    }
  }
  tags: {
    Environment: environment
    Project: 'HackerNews'
  }
}

// Storage Account for any blob storage needs
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'st${namePrefix}${environment}${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
  tags: {
    Environment: environment
    Project: 'HackerNews'
  }
}

// Outputs for reference
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output applicationInsightsInstrumentationKey string = applicationInsights.properties.InstrumentationKey
output resourceGroupName string = resourceGroup().name