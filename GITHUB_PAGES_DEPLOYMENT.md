# GitHub Pages Deployment Guide 🚀

## Automatic Deployment with CI/CD

Your Call of Agents app will automatically deploy to GitHub Pages on every push to `main`!

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Push to GitHub (2 minutes)

```bash
cd /home/dev/ivr/callofagents

# Initialize git if needed
git init
git add .
git commit -m "🚀 Initial commit: Call of Agents with GitHub Pages CI/CD"

# Create repository on GitHub at: https://github.com/new
# Name it: callofagents

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/callofagents.git
git branch -M main
git push -u origin main
```

---

### Step 2: Enable GitHub Pages (1 minute)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**:
   - Source: **GitHub Actions** ✅
4. That's it! No other configuration needed.

---

### Step 3: Wait for Deployment (2-3 minutes)

1. Go to **Actions** tab
2. Watch the "Deploy to GitHub Pages" workflow
3. When complete, your site is live!

**URL:** `https://YOUR_USERNAME.github.io/callofagents/`

---

## 🌐 Your Site URLs

### Standard Deployment
```
https://YOUR_USERNAME.github.io/callofagents/
```

### If you want a custom domain (callofagents.us)
See "Custom Domain Setup" section below.

---

## ✅ What Happens Automatically

### Every Push to Main:
```
1. GitHub Actions triggers
2. Installs dependencies
3. Builds production bundle
4. Deploys to GitHub Pages
5. ✅ Live in 2-3 minutes!
```

### Every Pull Request:
```
1. GitHub Actions runs build test
2. Verifies build succeeds
3. Shows status on PR
4. (No deployment until merged)
```

---

## 🔧 Configuration Files

### `.github/workflows/github-pages.yml`
- ✅ Builds on every push to main
- ✅ Auto-deploys to GitHub Pages
- ✅ Uses GitHub Actions cache for speed

### `vite.config.ts`
- ✅ Base path configured: `/callofagents/`
- ✅ Production mode optimization
- ✅ Works with GitHub Pages routing

---

## 🎨 Custom Domain Setup (Optional)

### If you own callofagents.us:

#### Step 1: Add CNAME File
```bash
echo "callofagents.us" > public/CNAME
git add public/CNAME
git commit -m "Add custom domain"
git push
```

#### Step 2: Configure DNS
Add these records at your DNS provider:

**For apex domain (callofagents.us):**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

#### Step 3: Enable in GitHub
1. Go to Settings → Pages
2. Under "Custom domain", enter: `callofagents.us`
3. Click "Save"
4. Check "Enforce HTTPS" (after DNS propagates)

#### Step 4: Update vite.config.ts
```typescript
base: mode === 'production' ? '/' : '/',
```
(Remove `/callofagents/` for custom domain)

---

## 📊 Deployment Status

### Check Deployment Status:
1. Go to **Actions** tab
2. See workflow runs
3. Green checkmark = successful deployment

### View Live Site:
- Click on the workflow run
- See "Deploy to GitHub Pages" step
- URL shown in output

---

## 🛠️ Troubleshooting

### Build Fails
```bash
# Test build locally first
npm install
npm run build

# Check the error in GitHub Actions logs
# Repository → Actions → Failed workflow → View logs
```

### 404 Error on Page
```typescript
// Update vite.config.ts base path
// For repo: base: '/callofagents/'
// For custom domain: base: '/'
```

### Custom Domain Not Working
```bash
# Wait for DNS propagation (5-60 minutes)
# Check DNS:
dig callofagents.us

# Verify CNAME file exists:
cat public/CNAME
```

### Pages Not Enabled
```
Settings → Pages → Source → GitHub Actions
```

---

## 🔄 Update Deployment

### To update your site:
```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# GitHub Actions automatically redeploys!
```

---

## 📋 Workflow Details

### Workflow File: `.github/workflows/github-pages.yml`

**Jobs:**

1. **Build Job**
   - Checkout code
   - Setup Node.js 18
   - Install dependencies
   - Build production bundle
   - Upload to GitHub Pages

2. **Deploy Job** (only on main branch)
   - Deploy artifacts to Pages
   - Output deployment URL
   - Set environment variables

**Permissions:**
- `contents: read` - Read repository
- `pages: write` - Deploy to Pages
- `id-token: write` - OIDC authentication

---

## 🚀 First Deployment

### After pushing to GitHub:

1. **Wait 2-3 minutes** for first deployment
2. **Check Actions tab** for progress
3. **Visit your site** when deployment completes
4. **Bookmark the URL** for easy access

---

## 🎯 Site Will Be Live At:

### Default URL:
```
https://YOUR_USERNAME.github.io/callofagents/
```

### With Custom Domain (after setup):
```
https://callofagents.us
```

---

## 💡 Pro Tips

1. **Always test locally** before pushing:
   ```bash
   npm run build
   npm run preview
   ```

2. **Use branches** for development:
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create PR → Merge to main → Auto-deploy!
   ```

3. **Monitor deployments** in Actions tab

4. **Keep dependencies updated**:
   ```bash
   npm update
   ```

---

## 📊 Build Info

### Build Output:
- Location: `dist/` folder
- Optimized: Yes
- Minified: Yes
- Gzipped: Automatic by GitHub Pages

### Performance:
- CDN: GitHub's global CDN
- HTTPS: Automatic
- Caching: Optimized

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Source set to "GitHub Actions"
- [ ] First deployment completed
- [ ] Site accessible at URL
- [ ] HTTPS working

### For Custom Domain:
- [ ] CNAME file added
- [ ] DNS configured
- [ ] Custom domain added in Settings
- [ ] HTTPS enforced

---

## 🎉 You're Done!

Your Call of Agents platform will now automatically deploy to GitHub Pages every time you push to main!

**No manual deployment needed!** 🚀

### Next Steps:
1. Push your code to GitHub
2. Enable GitHub Pages
3. Visit your live site!
4. (Optional) Add custom domain

---

## 🆘 Need Help?

- **GitHub Pages Docs:** https://docs.github.com/pages
- **GitHub Actions Docs:** https://docs.github.com/actions
- **Custom Domain Guide:** https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site

---

**Your site will be live at:**
`https://YOUR_USERNAME.github.io/callofagents/`

**Deployment time:** ~2-3 minutes after push! ⚡
