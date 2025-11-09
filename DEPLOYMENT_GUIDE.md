# Call of Agents - Deployment Guide 🚀

## Custom Domain: callofagents.us

Complete CI/CD setup with GitHub Actions and Netlify deployment.

---

## 📋 Prerequisites

1. **GitHub Repository** - Your code pushed to GitHub
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Domain** - callofagents.us registered and ready
4. **GitHub Secrets** - Required secrets configured

---

## 🔧 Setup Steps

### Step 1: Create Netlify Site

1. **Login to Netlify**
   ```
   Go to: https://app.netlify.com
   ```

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository
   - Select: `/home/dev/ivr/callofagents`

3. **Build Settings** (Auto-detected from netlify.toml)
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Get Site ID**
   - Go to Site Settings → General
   - Copy the "Site ID" (looks like: `abc123-def456-ghi789`)

---

### Step 2: Configure Custom Domain

1. **Add Domain in Netlify**
   - Go to: Site Settings → Domain Management
   - Click "Add custom domain"
   - Enter: `callofagents.us`
   - Click "Verify"

2. **DNS Configuration**
   
   **Option A: Netlify DNS (Recommended)**
   - Netlify will provide nameservers
   - Update at your domain registrar:
     ```
     dns1.p03.nsone.net
     dns2.p03.nsone.net
     dns3.p03.nsone.net
     dns4.p03.nsone.net
     ```

   **Option B: External DNS**
   - Add A record pointing to Netlify's load balancer:
     ```
     Type: A
     Name: @
     Value: 75.2.60.5
     ```
   - Add CNAME for www:
     ```
     Type: CNAME
     Name: www
     Value: callofagents.us
     ```

3. **Enable HTTPS**
   - Netlify auto-provisions SSL certificate
   - Wait 5-10 minutes for DNS propagation
   - SSL will be automatically enabled

---

### Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. **Go to GitHub Repository Settings**
   ```
   Repository → Settings → Secrets and variables → Actions
   ```

2. **Add Secrets**

   **NETLIFY_AUTH_TOKEN**
   ```
   1. Go to Netlify: https://app.netlify.com/user/applications
   2. Click "New access token"
   3. Name it: "GitHub Actions Deploy"
   4. Copy the token
   5. Add as secret in GitHub
   ```

   **NETLIFY_SITE_ID**
   ```
   1. Go to Netlify Site Settings
   2. Copy the Site ID from General settings
   3. Add as secret in GitHub
   ```

---

## 🚀 GitHub Actions Workflows

### Workflow 1: CI (Continuous Integration)
**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to main/master/develop
- Pull requests to main/master

**Actions:**
- ✅ Runs on multiple Node versions (18.x, 20.x)
- ✅ Installs dependencies
- ✅ Runs linter
- ✅ Builds application
- ✅ Reports build size

**Status:** Runs on every push/PR

---

### Workflow 2: Deploy (Continuous Deployment)
**File:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to main/master (production)
- Pull requests (preview deployments)

**Actions:**
- ✅ Builds application
- ✅ Deploys to Netlify
- ✅ Comments deployment URL on PR
- ✅ Production deploys to callofagents.us

**Status:** Auto-deploys on merge to main

---

## 📁 Project Structure

```
callofagents/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI workflow
│       └── deploy.yml      # Deploy workflow
├── src/                    # React source code
├── public/                 # Static assets
├── dist/                   # Build output (auto-generated)
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies
└── vite.config.ts         # Vite configuration
```

---

## 🔄 Deployment Flow

### Production Deployment
```
1. Push to main branch
   ↓
2. GitHub Actions triggers
   ↓
3. CI workflow runs (test & build)
   ↓
4. Deploy workflow runs
   ↓
5. Build artifacts uploaded to Netlify
   ↓
6. Site deployed to callofagents.us
   ↓
7. ✅ Live at https://callofagents.us
```

### Preview Deployment (PR)
```
1. Create pull request
   ↓
2. GitHub Actions triggers
   ↓
3. CI workflow runs
   ↓
4. Deploy workflow creates preview
   ↓
5. Preview URL commented on PR
   ↓
6. ✅ Test at https://deploy-preview-123--callofagents.netlify.app
```

---

## 🌐 URLs

### Production
```
Primary: https://callofagents.us
WWW:     https://www.callofagents.us (redirects to primary)
```

### Netlify Default
```
https://callofagents.netlify.app (backup URL)
```

### Preview Deployments
```
https://deploy-preview-[PR-NUMBER]--callofagents.netlify.app
```

---

## 🛠️ Manual Deployment (Alternative)

If you need to deploy manually:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the application
npm run build

# Deploy to production
netlify deploy --prod --dir=dist

# Or deploy for testing
netlify deploy --dir=dist
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] GitHub Actions workflows are running
- [ ] CI workflow passes on push
- [ ] Deploy workflow succeeds
- [ ] Site accessible at https://callofagents.us
- [ ] HTTPS/SSL certificate active
- [ ] WWW redirect works (www.callofagents.us → callofagents.us)
- [ ] PR preview deployments working
- [ ] Build status badge shows passing

---

## 📊 Build Status Badge

Add to your README.md:

```markdown
[![Deploy](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml)
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
```

---

## 🔒 Security Features

✅ **Security Headers** (configured in netlify.toml)
- X-Frame-Options: DENY
- X-XSS-Protection: enabled
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

✅ **Performance Optimizations**
- Asset caching (1 year)
- Immutable assets
- Gzip compression (automatic)

✅ **HTTPS**
- Automatic SSL certificate
- HTTP → HTTPS redirect (automatic)
- HSTS enabled

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check GitHub Actions logs
# Go to: Actions tab → Failed workflow → View logs

# Common fixes:
1. Check package.json dependencies
2. Verify Node version (18 or 20)
3. Check for TypeScript errors
4. Review build logs for specific errors
```

### Domain Not Working
```bash
# Check DNS propagation
dig callofagents.us

# Check Netlify DNS
netlify status

# Force SSL renewal
# Netlify Dashboard → Domain Settings → HTTPS → Renew certificate
```

### Deployment Failed
```bash
# Check secrets are set correctly
# Repository → Settings → Secrets → Verify both secrets exist

# Retry deployment
# Go to Actions → Failed workflow → Re-run jobs
```

---

## 📞 Support

**Netlify Docs:** https://docs.netlify.com
**GitHub Actions:** https://docs.github.com/actions
**Domain DNS:** Check your registrar's documentation

---

## 🎉 Success!

Once everything is set up:

1. **Push to main** → Auto-deploys to production
2. **Create PR** → Auto-creates preview deployment
3. **Merge PR** → Auto-deploys to callofagents.us
4. **Site Live** → https://callofagents.us

---

**Your Call of Agents platform is now live with full CI/CD! 🚀**

Every push to main automatically deploys to production at **callofagents.us**!
