# Call of Agents 🤖

[![Deploy](https://github.com/YOUR_USERNAME/callofagents/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/callofagents/actions/workflows/deploy.yml)
[![CI](https://github.com/YOUR_USERNAME/callofagents/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/callofagents/actions/workflows/ci.yml)

**AI-Powered Banking Platform with Multi-Agent Orchestration**

🌐 **Live Site:** [https://callofagents.us](https://callofagents.us)

---

## 🚀 Features

### 🤖 AI Chatbot with RAG
- Intelligent conversational AI powered by Nemotron 70B
- Vector search with Milvus for knowledge retrieval
- Streaming responses for real-time interaction
- Context-aware conversations with memory

### 📊 Admin Dashboard
- Real-time analytics and metrics
- Live call feed with auto-refresh (5s)
- Agent performance tracking
- CrewAI trace integration
- Customer interaction timeline

### 📞 Call History & Logs
- Complete conversation archive
- Search and filter capabilities
- Customer name resolution
- AI execution traces
- Event timeline for each call

### 👥 Manual Review System
- Compliance checking
- Intent analysis
- Request approval workflow
- Admin override capabilities

### 💳 Customer Data Management
- Complete customer profiles
- Transaction history
- Account information
- Real-time updates

### 📸 Receipt Processing
- Vision AI (Gemini Flash 1.5)
- Automatic data extraction
- Spending insights
- Category analysis

### 🏦 Financial Services
- **Plaid Integration** - Bank account linking
- **Stripe Integration** - Payment processing
- Real-time balance checking
- Transaction management

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend Integration
- **FastAPI** - Python backend API
- **PostgreSQL** - Dual databases (ivr_ops + IVR_service)
- **Milvus** - Vector database for RAG
- **CrewAI** - Multi-agent orchestration
- **OpenRouter** - LLM gateway

### AI Models
- **Nemotron 70B** - Reasoning & orchestration
- **Gemini Flash 1.5** - Vision processing
- **Sentence Transformers** - Embeddings

### DevOps
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting & deployment
- **Custom Domain** - (configurable)

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/callofagents.git
cd callofagents

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# Visit: http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 🚀 Deployment

### Automated Deployment (CI/CD)

Every push to `main` automatically deploys to **GitHub Pages**!

### Quick Deployment (3 Steps)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/callofagents.git
git branch -M main
git push -u origin main

# 2. Enable GitHub Pages
# Go to: Settings → Pages → Source: GitHub Actions

# 3. Done! Site live at:
# https://YOUR_USERNAME.github.io/callofagents/
```

### Complete Deployment Guide

See **[GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md)** for:
- GitHub Pages setup
- Custom domain configuration (callofagents.us)
- DNS configuration
- HTTPS setup
- Troubleshooting

---

## 📋 Project Structure

```
callofagents/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Continuous Integration
│       └── deploy.yml          # Continuous Deployment
├── src/
│   ├── components/             # React components
│   │   ├── ChatBot.tsx        # AI Chatbot interface
│   │   ├── AdminDashboard.tsx # Admin dashboard
│   │   ├── CallHistory.tsx    # Call logs viewer
│   │   ├── ManualReview.tsx   # Review system
│   │   ├── CustomerData.tsx   # Customer management
│   │   ├── ReceiptProcessing.tsx
│   │   └── FinancialServices.tsx
│   ├── lib/
│   │   └── api.ts             # API client
│   ├── hooks/                  # Custom React hooks
│   ├── pages/
│   │   └── Index.tsx          # Main page
│   └── App.tsx                # App entry point
├── public/                     # Static assets
├── scripts/
│   └── setup-github.sh        # GitHub setup script
├── netlify.toml               # Netlify configuration
├── package.json               # Dependencies
└── vite.config.ts             # Vite configuration
```

---

## 🔧 Configuration

### Environment Variables (Backend)

The frontend connects to the backend API. Backend environment variables are configured in the FastAPI application:

```env
# Backend API
OPENROUTER_API_KEY=your_key
POSTGRES_URL=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
STRIPE_SECRET_KEY=your_key
```

### API Base URL

Update in `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://worldlink-ai.xyz:8100';
```

---

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Deployment
./scripts/setup-github.sh   # Initialize Git & GitHub
```

---

## 🌐 Deployment URLs

### Production (GitHub Pages)
- **Default:** https://YOUR_USERNAME.github.io/callofagents/
- **Custom Domain:** https://callofagents.us (after DNS setup)

### Local Development
- **Dev Server:** http://localhost:8080

---

## 🔒 Security

- ✅ HTTPS enforced (automatic SSL)
- ✅ Security headers configured
- ✅ CORS properly configured
- ✅ XSS protection enabled
- ✅ Content Security Policy
- ✅ Secrets managed via GitHub

---

## 📊 CI/CD Pipeline

### On Push to Main
1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ Build application
4. ✅ Deploy to GitHub Pages
5. ✅ Live in 2-3 minutes!

### On Pull Request
1. ✅ Run build test
2. ✅ Verify build succeeds
3. ✅ Show status on PR
4. ✅ Deploy when merged to main

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 🆘 Support

- **Documentation:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Issues:** Open an issue on GitHub
- **Backend API:** Check backend repository

---

## 🎉 Credits

Built with:
- React + TypeScript
- shadcn/ui components
- TailwindCSS styling
- Vite build tool
- GitHub Pages hosting
- GitHub Actions CI/CD

**Deploy to GitHub Pages in 3 steps!** 🚀
