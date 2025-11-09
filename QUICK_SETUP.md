# Quick Setup Guide 🚀

## Deploy Call of Agents to callofagents.us

**3 Simple Steps to Get Your Site Live!**

---

## Step 1: Push to GitHub (5 minutes)

```bash
cd /home/dev/ivr/callofagents

# Run the setup script
./scripts/setup-github.sh
```

**Then:**
1. Go to https://github.com/new
2. Create repository named: `callofagents`
3. Run these commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/callofagents.git
git branch -M main
git push -u origin main
```

✅ **Done!** Code is now on GitHub

---

## Step 2: Setup Netlify (10 minutes)

### Create Site
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select: `callofagents` repository
5. Settings auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Add Custom Domain
1. Go to: Site Settings → Domain Management
2. Click "Add custom domain"
3. Enter: `callofagents.us`
4. Click "Verify" and follow DNS instructions

### Get Site Info
- **Site ID:** Site Settings → General → Copy Site ID
- **Auth Token:** https://app.netlify.com/user/applications → New access token

✅ **Done!** Site is deployed (temp URL provided)

---

## Step 3: Configure GitHub Secrets (2 minutes)

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click "New repository secret"

Add these 2 secrets:

**Secret 1: NETLIFY_AUTH_TOKEN**
```
Name: NETLIFY_AUTH_TOKEN
Value: [paste token from Netlify]
```

**Secret 2: NETLIFY_SITE_ID**
```
Name: NETLIFY_SITE_ID  
Value: [paste site ID from Netlify]
```

✅ **Done!** CI/CD is configured

---

## DNS Configuration (If using callofagents.us)

### Option A: Use Netlify DNS (Easiest)
Netlify provides nameservers. Update at your domain registrar:
```
dns1.p03.nsone.net
dns2.p03.nsone.net
dns3.p03.nsone.net
dns4.p03.nsone.net
```

### Option B: Use External DNS
Add these records at your DNS provider:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: callofagents.us
```

**Wait 5-60 minutes for DNS propagation**

---

## ✅ Verify Everything Works

### Test CI/CD
```bash
# Make a small change
echo "# Test" >> README.md
git add .
git commit -m "Test CI/CD"
git push

# Watch GitHub Actions
# Go to: Repository → Actions tab
# You should see workflows running
```

### Check Your Site
1. **Temporary URL:** Check Netlify dashboard for URL
2. **Custom Domain:** https://callofagents.us (after DNS propagates)
3. **SSL:** Should auto-enable within 10 minutes

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify site created
- [ ] Custom domain added (callofagents.us)
- [ ] GitHub secrets configured
- [ ] DNS updated
- [ ] CI/CD workflows passing
- [ ] Site accessible at https://callofagents.us
- [ ] SSL certificate active

---

## 🔄 How It Works Now

### Every time you push to main:
```
1. GitHub Actions triggers
2. Runs tests & builds app
3. Deploys to Netlify
4. Live at callofagents.us
```

### For pull requests:
```
1. Creates preview deployment
2. Runs tests
3. Comments preview URL on PR
4. Auto-deploys when merged
```

---

## 📝 What's Included

### GitHub Actions Workflows
- ✅ `.github/workflows/ci.yml` - Tests & builds
- ✅ `.github/workflows/deploy.yml` - Deploys to Netlify

### Configuration Files
- ✅ `netlify.toml` - Netlify settings
- ✅ `package.json` - Dependencies
- ✅ `vite.config.ts` - Build config

### Documentation
- ✅ `README.md` - Full project documentation
- ✅ `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- ✅ `QUICK_SETUP.md` - This file

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Check logs in GitHub Actions
Repository → Actions → Failed workflow → View logs

# Common fix:
npm install
npm run build
```

### Domain Not Working
```bash
# Check DNS
dig callofagents.us

# Wait for propagation (5-60 min)
# Or force SSL renewal in Netlify
```

### Deployment Failed
```bash
# Verify secrets are correct
Repository → Settings → Secrets

# Re-run workflow
Actions → Failed workflow → Re-run jobs
```

---

## 📚 Need More Help?

- **Full Guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Netlify Docs:** https://docs.netlify.com
- **GitHub Actions:** https://docs.github.com/actions

---

## 🎯 Next Steps

Once deployed:
1. ✅ Test all features
2. ✅ Customize branding
3. ✅ Add team members to GitHub
4. ✅ Configure monitoring
5. ✅ Set up analytics

---

**Your Call of Agents platform will be live at callofagents.us! 🚀**

Total setup time: ~20 minutes
