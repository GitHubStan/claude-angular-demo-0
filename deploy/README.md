# Azure Deployment Guide

This directory contains the infrastructure-as-code templates and deployment scripts for the HackerNews application on Azure.

## Architecture Overview

- **Frontend**: Angular app hosted on Azure Static Web Apps (Free tier)
- **Backend**: .NET 9 API hosted on Azure App Service (F1 Free tier)
- **Monitoring**: Application Insights for telemetry and logging
- **Storage**: Azure Storage Account for any blob storage needs

## Prerequisites

1. Azure CLI installed and authenticated
2. Azure PowerShell module (for PowerShell script)
3. GitHub repository for Static Web App CI/CD

## Deployment Options

### Option 1: PowerShell Script (Recommended)

```powershell
# Navigate to deploy directory
cd deploy

# Run deployment script
.\deploy.ps1 -SubscriptionId "your-subscription-id" -Environment "demo"
```

### Option 2: Azure CLI

```bash
# Create resource group
az group create --name rg-hackernews-demo --location "East US"

# Deploy Bicep template
az deployment group create \
  --resource-group rg-hackernews-demo \
  --template-file main.bicep \
  --parameters environment=demo
```

### Option 3: Azure Portal

1. Upload `main.bicep` to Azure Portal
2. Create custom deployment
3. Fill in parameters and deploy

## Post-Deployment Steps

### 1. Update Static Web App Repository

In the Azure Portal, update the Static Web App with your GitHub repository:
- Repository URL: `https://github.com/your-username/your-repo`
- Branch: `main`
- Build preset: `Angular`
- App location: `/HackerNewsFrontend`
- Output location: `dist/hacker-news-frontend`

### 2. Deploy .NET API

```bash
# From HackerNewsApi directory
cd ../HackerNewsApi
dotnet publish -c Release
az webapp deploy --resource-group rg-hackernews-demo --name app-hackernews-demo-api --src-path bin/Release/net9.0/publish --type zip
```

### 3. Update Angular Configuration

Update `HackerNewsFrontend/src/environments/environment.prod.ts` with your App Service URL.

### 4. GitHub Actions Setup

The Static Web App will automatically create GitHub Actions workflows for CI/CD.

## Resource Naming Convention

- Resource Group: `rg-{namePrefix}-{environment}`
- App Service Plan: `asp-{namePrefix}-{environment}`
- App Service: `app-{namePrefix}-{environment}-api`
- Static Web App: `stapp-{namePrefix}-{environment}-frontend`
- Application Insights: `appi-{namePrefix}-{environment}`
- Storage Account: `st{namePrefix}{environment}{uniqueString}`

## Monitoring and Observability

- **Application Insights**: Automatic telemetry collection
- **Health Checks**: `/health` endpoint on the API
- **Logging**: Structured logging with Serilog (recommended)

## Cost Optimization

- **F1 App Service Plan**: Free tier with limitations
- **Static Web Apps**: Free tier with 100GB bandwidth
- **Application Insights**: 5GB free data ingestion per month
- **Storage**: 5GB free tier

**Total Monthly Cost: $0** (within free tier limits)

## Scaling Considerations

To scale beyond free tier:
1. Update `appServicePlanSku` parameter to `S1` or higher
2. Enable `alwaysOn` in App Service configuration
3. Consider App Service deployment slots for staging
4. Add auto-scaling rules based on metrics

## Security Best Practices

- HTTPS enforced on all services
- CORS properly configured
- Application Insights for security monitoring
- Storage account with secure defaults
- Managed identities for service-to-service authentication (when needed)