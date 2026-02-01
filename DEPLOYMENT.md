# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Your Gemini API key

## Steps to Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add `GEMINI_API_KEY` = `your-actual-api-key`
5. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, and Development

# Deploy to production
vercel --prod
```

### 3. Environment Variables in Vercel

In your Vercel project settings, add:
- **Name**: `GEMINI_API_KEY`
- **Value**: `AIzaSyD_NtZKOoYkbz9BR05eQpvDar8tEewGWGw`
- **Environments**: Production, Preview, Development

### 4. Verify Deployment

After deployment, test these endpoints:
- `https://your-app.vercel.app/` - Main app
- `https://your-app.vercel.app/api/gemini` - API endpoint (should handle POST requests)

## Security Notes

✅ **Secure**:
- API key is stored in Vercel environment variables (server-side)
- API endpoints are serverless functions
- Frontend calls `/api/gemini` (never exposes key)

❌ **Never**:
- Commit `.env` file to Git
- Use `VITE_` prefix for API keys
- Hardcode API keys in frontend code

## Troubleshooting

### API not working after deployment
- Check Vercel logs in dashboard
- Verify `GEMINI_API_KEY` is set in environment variables
- Check that API calls use `/api/gemini` path

### Build errors
- Run `npm run build` locally first
- Check package.json has all dependencies
- Verify Node version compatibility

### CORS errors
- API endpoint already has CORS headers
- Check browser console for specific errors

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure for Vercel

```
/
├── api/
│   └── gemini.js         # Serverless function (secure)
├── src/                  # Frontend code
├── dist/                 # Build output
├── .env                  # Local env (DO NOT COMMIT)
├── .gitignore           # Ignores .env
├── vercel.json          # Vercel configuration
└── package.json
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test API endpoint directly with curl/Postman
4. Check browser console for errors
