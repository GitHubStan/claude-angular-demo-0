# Professional Azure Deployment Guide

## Overview

This guide walks through deploying this HackerNews application to Azure using enterprise-grade practices and free tier resources.

## 🎯 Interesting Points

- **Infrastructure as Code**: Bicep templates for reproducible deployments
- **CI/CD Pipeline**: GitHub Actions with proper testing and deployment stages
- **Monitoring & Observability**: Application Insights integration
- **Security**: HTTPS enforcement, security headers, CORS configuration
- **Cost Optimization**: F1 free tier with upgrade path to production

## 📋 Prerequisites

1. **Azure Account** with an active subscription
2. **GitHub Account** for repository and Actions
3. **Azure CLI** installed and configured
4. **PowerShell** (for deployment script)

```bash
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login to Azure
az login
```

## 🚀 Step-by-Step Deployment

### 1. Deploy Infrastructure

```powershell
# Navigate to deployment directory
cd deploy

# Run infrastructure deployment
.\deploy.ps1 -SubscriptionId "your-subscription-id" -Environment "demo"
```

**What this creates:**

- Resource Group: `rg-hackernews-demo`
- App Service Plan: `asp-hackernews-demo` (F1 Free)
- App Service: `app-hackernews-demo-api`
- Static Web App: `stapp-hackernews-demo-frontend`
- Application Insights: `appi-hackernews-demo`
- Storage Account: `st-hackernews-demo`

### 2. Configure GitHub Repository

1. **Push your code** to a GitHub repository
2. **Get deployment secrets** from Azure Portal:

   **For App Service:**

   ```bash
   az webapp deployment list-publishing-profiles --name app-hackernews-demo-api --resource-group rg-hackernews-demo --xml
   ```

   **For Static Web App:**

   - Go to Azure Portal → Static Web Apps → `stapp-hackernews-demo-frontend`
   - Copy the deployment token

3. **Add GitHub Secrets:**
   - `AZURE_WEBAPP_PUBLISH_PROFILE` (from step 2)
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` (from step 2)

### 3. Update Static Web App Configuration

In Azure Portal → Static Web Apps → Configuration:

- **Repository URL**: `https://github.com/your-username/your-repo`
- **Branch**: `master`
- **Build preset**: `Angular`
- **App location**: `/HackerNewsFrontend`
- **Output location**: `dist/hacker-news-frontend`

### 4. Deploy Applications

#### Deploy API (Automatic via GitHub Actions)

Push changes to `HackerNewsApi/**` to trigger deployment:

```bash
git add .
git commit -m "Deploy API to Azure"
git push origin master
```

#### Deploy Frontend (Automatic via GitHub Actions)

Push changes to `HackerNewsFrontend/**` to trigger deployment:

```bash
git add .
git commit -m "Deploy frontend to Azure"
git push origin master
```

### 5. Verify Deployment

**API Health Check:**

```
https://app-hackernews-demo-api.azurewebsites.net/health
```

**Frontend Application:**

```
https://stapp-hackernews-demo-frontend.azurestaticapps.net
```

**Application Insights:**

- Monitor telemetry in Azure Portal
- View logs and performance metrics

## 🔧 Configuration Details

### App Service Configuration

- **Runtime**: .NET 9.0
- **HTTPS Only**: Enabled
- **Health Check**: `/health` endpoint
- **CORS**: Configured for Static Web App origins
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

### Static Web App Configuration

- **Custom Domain**: Available (free SSL)
- **CDN**: Built-in Azure CDN
- **API Integration**: Routes to App Service backend

### Application Insights Features

- **Request Tracking**: Automatic API request monitoring
- **Dependency Tracking**: External API calls to Hacker News
- **Exception Tracking**: Unhandled exceptions
- **Performance Monitoring**: Response times and throughput

## 💰 Cost Analysis

### F1 Free Tier Limits

- **App Service**: 60 CPU minutes/day, 1GB RAM, 1GB storage
- **Static Web App**: Free tier with 100GB bandwidth/month
- **Application Insights**: 5GB data ingestion/month
- **Storage Account**: 5GB free tier

**Total Monthly Cost: $0** (within free limits)

### Production Upgrade Path

To scale beyond free tier:

```bicep
// Update main.bicep parameter
param appServicePlanSku string = 'S1' // or 'P1V3'
```

**Production features:**

- Always On (no cold starts)
- Auto-scaling
- Deployment slots
- Custom domains on App Service
- Enhanced security features

## 🛠️ Troubleshooting

### Common Issues

**Cold Start Delays (F1 Tier)**

- Expected behavior - app sleeps after 20 minutes
- First request takes 10-30 seconds
- Consider upgrading to S1+ for production

**CORS Errors**

- Verify Static Web App origin is added to API CORS policy
- Check browser developer tools for exact error

**Build Failures**

- Check GitHub Actions logs
- Verify Node.js version compatibility
- Ensure all dependencies are in package.json

**Health Check Failures**

- Verify `/health` endpoint returns 200 OK
- Check Application Insights for detailed error logs

### Monitoring Commands

```bash
# Check App Service logs
az webapp log tail --name app-hackernews-demo-api --resource-group rg-hackernews-demo

# Get Static Web App details
az staticwebapp show --name stapp-hackernews-demo-frontend --resource-group rg-hackernews-demo
```

## 🎉 Demo Script for Interviews

### Architecture Highlights

1. **"Separation of Concerns"** - Frontend and backend are independently deployable
2. **"Infrastructure as Code"** - All resources defined in Bicep templates
3. **"DevOps Integration"** - Automated CI/CD with testing and deployment
4. **"Observability"** - Application Insights for monitoring and debugging
5. **"Cost Optimization"** - Free tier with clear production upgrade path

### Live Demo Flow

1. Show repository structure and professional organization
2. Walk through Bicep template explaining resource relationships
3. Demonstrate health check endpoint
4. Show Application Insights dashboard
5. Explain scaling strategy and production considerations

### Key Talking Points

- **"I chose F1 for cost-effective demonstration, but the architecture supports seamless scaling"**
- **"The same Bicep template works for dev, staging, and production with parameter changes"**
- **"GitHub Actions provide automated testing and deployment with proper CI/CD practices"**
- **"Application Insights gives us production-ready observability from day one"**

This deployment showcases enterprise-level Azure knowledge while remaining cost-effective for demonstration purposes.
