#!/bin/bash

# Call of Agents - GitHub Pages Deployment Script
# This script sets up Git and provides deployment instructions

set -e

echo "🚀 Call of Agents - GitHub Pages Deployment"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Cache
.cache/
.parcel-cache/
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
fi

# Stage all files
echo -e "${BLUE}📦 Staging files...${NC}"
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    # Create commit
    echo -e "${BLUE}💾 Creating commit...${NC}"
    git commit -m "🚀 Deploy Call of Agents to GitHub Pages

Features:
- AI Chatbot with RAG
- Admin Dashboard with real-time analytics
- Call History & conversation logs
- Manual Review system
- Customer Data management
- Receipt Processing (Vision AI)
- Financial Services (Plaid + Stripe)
- GitHub Pages CI/CD deployment
- Auto-deploy on push to main

Tech Stack:
- React 18 + TypeScript
- Vite + TailwindCSS
- shadcn/ui components
- GitHub Actions workflow
- GitHub Pages hosting" || echo -e "${YELLOW}⚠️  Commit may have failed or nothing to commit${NC}"
fi

echo ""
echo -e "${GREEN}✅ Repository ready for GitHub Pages!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1️⃣  Create GitHub repository:"
echo "   ${BLUE}https://github.com/new${NC}"
echo ""
echo "2️⃣  Repository settings:"
echo "   Name: callofagents"
echo "   Description: AI-Powered Banking Platform"
echo "   Public or Private: Your choice"
echo ""
echo "3️⃣  Push to GitHub:"
echo "   ${BLUE}git remote add origin https://github.com/YOUR_USERNAME/callofagents.git${NC}"
echo "   ${BLUE}git branch -M main${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "4️⃣  Enable GitHub Pages:"
echo "   Go to: Repository → Settings → Pages"
echo "   Source: ${GREEN}GitHub Actions${NC}"
echo ""
echo "5️⃣  Wait 2-3 minutes for deployment"
echo ""
echo "6️⃣  Your site will be live at:"
echo "   ${GREEN}https://YOUR_USERNAME.github.io/callofagents/${NC}"
echo ""
echo -e "${BLUE}📚 For detailed instructions, see:${NC}"
echo "   - GITHUB_PAGES_DEPLOYMENT.md"
echo "   - README.md"
echo ""
echo -e "${GREEN}🎉 GitHub Pages deployment configured!${NC}"
echo ""
echo -e "${YELLOW}💡 Pro Tip:${NC} Every push to main will auto-deploy!"
echo ""
