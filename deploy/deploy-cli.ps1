# Azure Deployment Script using Azure CLI
# This script deploys the infrastructure and application to Azure using Azure CLI

param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId,

    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-hackernews-demo",

    [Parameter(Mandatory=$false)]
    [string]$Location = "West US 2",

    [Parameter(Mandatory=$false)]
    [string]$Environment = "demo"
)

Write-Host "Starting Azure deployment for HackerNews application" -ForegroundColor Green

# Check if Azure CLI is installed and logged in
try {
    $accountInfo = az account show 2>$null | ConvertFrom-Json
    if (-not $accountInfo) {
        Write-Host "Please login to Azure first:" -ForegroundColor Yellow
        Write-Host "az login" -ForegroundColor Cyan
        exit 1
    }
    Write-Host "Logged in as: $($accountInfo.user.name)" -ForegroundColor Blue
} catch {
    Write-Host "Azure CLI not found or not logged in. Please run:" -ForegroundColor Yellow
    Write-Host "az login" -ForegroundColor Cyan
    exit 1
}

# Set subscription if provided
if ($SubscriptionId) {
    Write-Host "Setting subscription to: $SubscriptionId" -ForegroundColor Blue
    az account set --subscription $SubscriptionId
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to set subscription" -ForegroundColor Red
        exit 1
    }
}

# Create resource group
Write-Host "Creating resource group: $ResourceGroupName" -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create resource group" -ForegroundColor Red
    exit 1
}
Write-Host "Resource group created or already exists" -ForegroundColor Green

# Deploy Bicep template
Write-Host "Deploying infrastructure via Bicep template..." -ForegroundColor Blue

# Run deployment and capture result
az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file "./main.bicep" `
    --parameters environment=$Environment location=$Location `
    --verbose

if ($LASTEXITCODE -ne 0) {
    Write-Host "Infrastructure deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "Infrastructure deployment completed successfully!" -ForegroundColor Green

# Get deployment outputs separately
Write-Host "`nDeployment Results:" -ForegroundColor Yellow
try {
    $appServiceName = "app-hackernews-$Environment-api"
    $staticWebAppName = "stapp-hackernews-$Environment-frontend"

    Write-Host "App Service URL: https://$appServiceName.azurewebsites.net" -ForegroundColor Cyan
    Write-Host "Static Web App: Check Azure Portal for URL after configuration" -ForegroundColor Cyan
    Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Cyan
} catch {
    Write-Host "Deployment completed but couldn't retrieve all outputs" -ForegroundColor Yellow
}

# Next steps
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Update your GitHub repository URL in the Static Web App" -ForegroundColor White
Write-Host "2. Deploy your .NET API to the App Service" -ForegroundColor White
Write-Host "3. Configure your Angular app with the API endpoint" -ForegroundColor White
Write-Host "4. Push to GitHub to trigger Static Web App deployment" -ForegroundColor White

Write-Host "`nAzure deployment script completed!" -ForegroundColor Green