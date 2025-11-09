#!/bin/bash

# Call of Agents - GitHub Repository Setup Script
# This script initializes Git, creates a GitHub repo, and pushes the code

set -e

echo "🚀 Call of Agents - GitHub Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${BLUE}📦 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
else
    echo -e "${GREEN}✅ Git already initialized${NC}"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo -e "${BLUE}📝 Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Misc
.DS_Store
*.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Netlify
.netlify/

# Cache
.cache/
.parcel-cache/
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
fi

# Add all files
echo -e "${BLUE}📦 Staging files...${NC}"
git add .

# Create initial commit if no commits exist
if ! git rev-parse HEAD > /dev/null 2>&1; then
    echo -e "${BLUE}💾 Creating initial commit...${NC}"
    git commit -m "🎉 Initial commit: Call of Agents AI Banking Platform

Features:
- AI Chatbot with RAG
- Admin Dashboard with real-time analytics
- Call History & conversation logs
- Manual Review system
- Customer Data management
- Receipt Processing (Vision AI)
- Financial Services (Plaid + Stripe)
- CrewAI multi-agent orchestration
- Complete CI/CD with GitHub Actions
- Netlify deployment to callofagents.us"
    echo -e "${GREEN}✅ Initial commit created${NC}"
else
    echo -e "${YELLOW}ℹ️  Commits already exist, creating new commit...${NC}"
    git commit -m "🔧 Add CI/CD configuration for callofagents.us

- GitHub Actions workflows (CI + Deploy)
- Netlify configuration with custom domain
- Security headers and caching
- PR preview deployments
- Deployment guide and documentation" || true
fi

echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Create GitHub repository:"
echo "   Go to: https://github.com/new"
echo "   Repository name: callofagents"
echo "   Description: AI-Powered Banking Platform with Multi-Agent Orchestration"
echo "   Public or Private: Your choice"
echo ""
echo "2. Add remote and push:"
echo "   ${BLUE}git remote add origin https://github.com/YOUR_USERNAME/callofagents.git${NC}"
echo "   ${BLUE}git branch -M main${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "3. Configure GitHub Secrets:"
echo "   Go to: Repository → Settings → Secrets and variables → Actions"
echo "   Add: NETLIFY_AUTH_TOKEN"
echo "   Add: NETLIFY_SITE_ID"
echo ""
echo "4. See DEPLOYMENT_GUIDE.md for complete setup instructions"
echo ""
echo -e "${GREEN}✅ Repository ready for GitHub!${NC}"
