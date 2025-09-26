# Azure Portal Deployment Instructions

Since Azure CLI is having issues, let's deploy via the Azure Portal for your demo.

## Steps:

### 1. Go to Azure Portal
- Navigate to [portal.azure.com](https://portal.azure.com)
- Login with your account

### 2. Create Template Deployment
- Click "Create a resource"
- Search for "Template deployment"
- Click "Template deployment (deploy using custom templates)"
- Click "Create"

### 3. Build Your Own Template
- Click "Build your own template in the editor"
- Delete the default template content
- Copy and paste the entire contents of `main.bicep` file
- Click "Save"

### 4. Fill in Parameters
- **Subscription**: Select your subscription
- **Resource Group**: Create new → `rg-hackernews-demo`
- **Region**: `West US 2`
- **Name Prefix**: `hackernews`
- **Environment**: `demo`
- **Location**: `West US 2`
- **App Service Plan Sku**: `F1`

### 5. Deploy
- Click "Review + Create"
- Click "Create"

This will deploy all your Azure resources without CLI issues!

### 6. After Deployment
- Note the URLs from the deployment outputs
- Continue with GitHub Actions setup

## Benefits for Interview
- Shows you know multiple deployment methods
- Portal deployment is still professional
- You can still show the Infrastructure as Code (Bicep template)
- Demonstrates adaptability when tools have issues