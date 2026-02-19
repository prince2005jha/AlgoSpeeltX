#!/bin/bash

# Quick deployment script for AlgoSplit
echo "🚀 Starting AlgoSplit Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  echo "Please create .env file with your Supabase credentials"
  exit 1
fi

echo "✓ .env file found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
  echo "✓ Build successful!"
  
  # Check if Vercel CLI is installed
  if command -v vercel &> /dev/null; then
    echo "🌐 Deploying to Vercel..."
    vercel --prod
  else
    echo ""
    echo "⚠️  Vercel CLI not found. Install it with:"
    echo "   npm install -g vercel"
    echo ""
    echo "Or deploy manually at: https://vercel.com/new"
    echo ""
    echo "📝 Remember to add these environment variables in Vercel:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - VITE_ALGORAND_NETWORK"
    echo ""
    echo "Your build is ready in the 'dist' folder!"
  fi
else
  echo "❌ Build failed!"
  exit 1
fi

