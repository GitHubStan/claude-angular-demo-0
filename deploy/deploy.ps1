# Azure Deployment Script for HackerNews App
# This script deploys the infrastructure and application to Azure

param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId,

    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-hackernews-demo",

    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",

    [Parameter(Mandatory=$false)]
    [string]$Environment = "demo"
)

Write-Host "🚀 Starting Azure deployment for HackerNews application" -ForegroundColor Green

# Login check
$context = Get-AzContext -ErrorAction SilentlyContinue
if (-not $context) {
    Write-Host "Please login to Azure first:" -ForegroundColor Yellow
    Write-Host "Connect-AzAccount" -ForegroundColor Cyan
    exit 1
}

# Set subscription if provided
if ($SubscriptionId) {
    Write-Host "Setting subscription to: $SubscriptionId" -ForegroundColor Blue
    Set-AzContext -SubscriptionId $SubscriptionId
}

# Create resource group
Write-Host "📦 Creating resource group: $ResourceGroupName" -ForegroundColor Blue
$resourceGroup = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if (-not $resourceGroup) {
    New-AzResourceGroup -Name $ResourceGroupName -Location $Location
    Write-Host "✅ Resource group created" -ForegroundColor Green
} else {
    Write-Host "✅ Resource group already exists" -ForegroundColor Green
}

# Deploy Bicep template
Write-Host "🏗️  Deploying infrastructure via Bicep template..." -ForegroundColor Blue
$deployment = New-AzResourceGroupDeployment `
    -ResourceGroupName $ResourceGroupName `
    -TemplateFile "./main.bicep" `
    -environment $Environment `
    -location $Location `
    -Verbose

if ($deployment.ProvisioningState -eq "Succeeded") {
    Write-Host "✅ Infrastructure deployment completed successfully!" -ForegroundColor Green

    # Display outputs
    Write-Host "`n📋 Deployment Results:" -ForegroundColor Yellow
    Write-Host "App Service URL: $($deployment.Outputs.appServiceUrl.Value)" -ForegroundColor Cyan
    Write-Host "Static Web App URL: $($deployment.Outputs.staticWebAppUrl.Value)" -ForegroundColor Cyan
    Write-Host "Resource Group: $($deployment.Outputs.resourceGroupName.Value)" -ForegroundColor Cyan

    # Next steps
    Write-Host "`n🔧 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Update your GitHub repository URL in the Static Web App" -ForegroundColor White
    Write-Host "2. Deploy your .NET API to the App Service" -ForegroundColor White
    Write-Host "3. Configure your Angular app with the API endpoint" -ForegroundColor White
    Write-Host "4. Push to GitHub to trigger Static Web App deployment" -ForegroundColor White

} else {
    Write-Host "❌ Infrastructure deployment failed" -ForegroundColor Red
    Write-Host $deployment.ProvisioningState -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Azure deployment script completed!" -ForegroundColor Green