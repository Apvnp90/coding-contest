# Azure Deployment Setup Guide

## Files Created

✅ `.github/workflows/azure-deploy-frontend.yml` - Frontend deployment workflow
✅ `.github/workflows/azure-deploy-backend.yml` - Backend deployment workflow
✅ `code-challenge-api/.mvn/maven-settings.xml` - Maven build configuration

## Prerequisites

You mentioned you already have:
1. ✅ Azure App Service for API
2. ✅ Azure Static Web Apps for UI
3. ✅ Azure Database for PostgreSQL

## Step 1: Update Workflow Files

### Backend Workflow (`azure-deploy-backend.yml`)

**Update Line 13:**
```yaml
AZURE_WEBAPP_NAME: coding-contest-api    # Change to YOUR actual App Service name
```

To find your App Service name:
```bash
az webapp list --query "[?kind=='app'].{Name:name, URL:defaultHostName}" --output table
```

### Frontend Workflow (`azure-deploy-frontend.yml`)

**Update Line 33:**
```yaml
REACT_APP_API_URL: https://coding-contest-api.azurewebsites.net  # Change to YOUR backend URL
```

**Update Line 39:**
You'll need your Static Web Apps deployment token (see Step 2)

## Step 2: Configure GitHub Secrets

Go to your GitHub repository: `https://github.com/Apvnp90/coding-contest`

Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required Secrets:

#### 1. Backend Deployment Secret

**Secret Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`

**How to get it:**
```bash
# Option 1: Azure CLI
az webapp deployment list-publishing-profiles \
  --name YOUR-APP-SERVICE-NAME \
  --resource-group YOUR-RESOURCE-GROUP \
  --xml

# Option 2: Azure Portal
# Go to: App Service → Deployment Center → Manage publish profile → Download
```

Copy the entire XML content and paste it as the secret value.

#### 2. Frontend Deployment Secret

**Secret Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`

**How to get it:**
```bash
# Option 1: Azure CLI
az staticwebapp secrets list \
  --name YOUR-STATIC-WEB-APP-NAME \
  --resource-group YOUR-RESOURCE-GROUP \
  --query "properties.apiKey" -o tsv

# Option 2: Azure Portal
# Go to: Static Web App → Overview → Manage deployment token → Copy
```

## Step 3: Configure Azure App Service Environment Variables

Set these in your **Azure App Service** (Backend):

```bash
# Using Azure CLI:
az webapp config appsettings set \
  --name YOUR-APP-SERVICE-NAME \
  --resource-group YOUR-RESOURCE-GROUP \
  --settings \
    SPRING_PROFILES_ACTIVE="prod" \
    SPRING_DATASOURCE_URL="jdbc:postgresql://YOUR-DB-SERVER.postgres.database.azure.com:5432/code-challenge-db?sslmode=require" \
    SPRING_DATASOURCE_USERNAME="YOUR-DB-USERNAME" \
    SPRING_DATASOURCE_PASSWORD="YOUR-DB-PASSWORD" \
    SPRING_JPA_SHOW_SQL="false" \
    SPRING_JPA_FORMAT_SQL="false"
```

**Or via Azure Portal:**
1. Go to: App Service → Configuration → Application settings
2. Add these settings:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://[your-db].postgres.database.azure.com:5432/code-challenge-db?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` = `[your-db-username]`
   - `SPRING_DATASOURCE_PASSWORD` = `[your-db-password]`
   - `SPRING_JPA_SHOW_SQL` = `false`
   - `SPRING_JPA_FORMAT_SQL` = `false`

3. Click **Save** and **Continue**

## Step 4: Configure CORS (Allow Frontend to Access Backend)

**Your Backend API URL:**
`https://coding-contest-api-fqh8agb3gga3h7d2.canadacentral-01.azurewebsites.net`

**Your Frontend URL (use one of these based on your setup):**
- If using Static Web App: `https://[your-static-app-name].azurestaticapps.net`
- If using App Service: `https://coding-contest-ui-bge9e5fugugqgubn.canadacentral-01.azurewebsites.net`

```bash
# Using Azure CLI - Replace with your actual resource group and frontend URL
az webapp cors add \
  --name coding-contest-api-fqh8agb3gga3h7d2 \
  --resource-group YOUR-RESOURCE-GROUP \
  --allowed-origins https://[YOUR-FRONTEND-URL]

# Example for Static Web App:
az webapp cors add \
  --name coding-contest-api-fqh8agb3gga3h7d2 \
  --resource-group YOUR-RESOURCE-GROUP \
  --allowed-origins https://your-static-app-name.azurestaticapps.net

# Example for App Service:
az webapp cors add \
  --name coding-contest-api-fqh8agb3gga3h7d2 \
  --resource-group YOUR-RESOURCE-GROUP \
  --allowed-origins https://coding-contest-ui-bge9e5fugugqgubn.canadacentral-01.azurewebsites.net

# Also allow localhost for local testing:
az webapp cors add \
  --name coding-contest-api-fqh8agb3gga3h7d2 \
  --resource-group YOUR-RESOURCE-GROUP \
  --allowed-origins http://localhost:3000
```

**Or via Azure Portal:**
1. Go to: App Service → **coding-contest-api-fqh8agb3gga3h7d2**
2. In left menu, click **CORS**
3. Add these allowed origins:
   - `https://[your-frontend-url]` (your Static Web App or App Service URL)
   - `http://localhost:3000` (for local development)
4. Click **Save**

## Step 5: Update Local `.env.production` File

Edit: `code-challenge-ui/.env.production`

This is already configured with your backend URL:

```env
REACT_APP_API_URL=https://coding-contest-api-fqh8agb3gga3h7d2.canadacentral-01.azurewebsites.net
```

## Step 6: Commit and Push to GitHub

```bash
# Check what files changed
git status

# Add all files
git add .

# Commit with message
git commit -m "Add Azure deployment workflows and configuration"

# Push to GitHub
git push origin main
```

## Step 7: Monitor Deployment

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You should see two workflows running:
   - "Deploy Backend to Azure"
   - "Deploy Frontend to Azure"

4. Click on each to see the deployment progress

## Step 8: Verify Deployment

### Test Backend API:
```bash
curl https://YOUR-APP-SERVICE-NAME.azurewebsites.net/api/buyers
```

### Test Frontend:
Open browser to: `https://YOUR-STATIC-WEB-APP.azurestaticapps.net`

## Troubleshooting

### Backend Issues

**View logs:**
```bash
az webapp log tail --name YOUR-APP-SERVICE-NAME --resource-group YOUR-RESOURCE-GROUP
```

**Common issues:**
- Database connection: Verify connection string includes `?sslmode=require`
- Firewall: Check PostgreSQL allows Azure services
- Environment variables: Verify all settings are correct in App Service Configuration

### Frontend Issues

**Common issues:**
- Wrong API URL: Check `.env.production` has correct backend URL
- CORS errors: Verify backend CORS settings include frontend URL
- Build errors: Check workflow logs in GitHub Actions

### Workflow Triggers

Workflows automatically run when you push changes to:
- Frontend: Changes in `code-challenge-ui/**`
- Backend: Changes in `code-challenge-api/**`

**Manual trigger:**
1. Go to GitHub → Actions
2. Select workflow
3. Click "Run workflow" button

## Quick Reference: Your Azure Resources

| Resource | Name | URL |
|----------|------|-----|
| App Service (Backend) | `coding-contest-api-fqh8agb3gga3h7d2` | `https://coding-contest-api-fqh8agb3gga3h7d2.canadacentral-01.azurewebsites.net` |
| Static Web App (Frontend) | `[YOUR-STATIC-APP-NAME]` | `https://[YOUR-STATIC-APP-NAME].azurestaticapps.net` |
| App Service (Frontend - if used) | `coding-contest-ui-bge9e5fugugqgubn` | `https://coding-contest-ui-bge9e5fugugqgubn.canadacentral-01.azurewebsites.net` |
| PostgreSQL Database | `[YOUR-DB-SERVER]` | `[YOUR-DB-SERVER].postgres.database.azure.com` |
| Resource Group | `[YOUR-RG]` | - |

**CORS Configuration:**
- Backend must allow: Your frontend URL (Static Web App or App Service)
- For local testing: Also allow `http://localhost:3000`

## Next Steps

1. ✅ Update workflow files with your Azure resource names
2. ✅ Add GitHub secrets (publish profiles and deployment tokens)
3. ✅ Configure App Service environment variables
4. ✅ Set up CORS
5. ✅ Update `.env.production` with backend URL
6. ✅ Commit and push to GitHub
7. ✅ Monitor deployment in GitHub Actions
8. ✅ Test the deployed application

---

**Need help?** Check the GitHub Actions logs for detailed error messages.
