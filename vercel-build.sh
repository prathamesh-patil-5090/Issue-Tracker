#!/bin/bash

# Vercel build script for Issue Tracker
echo "🚀 Starting Vercel build process..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is not set"
  exit 1
fi

if [ -z "$AUTH_SECRET" ]; then
  echo "❌ AUTH_SECRET environment variable is not set"
  exit 1
fi

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo "❌ Google OAuth credentials are not set"
  exit 1
fi

echo "✅ Environment variables are configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate database types (optional, for type safety)
echo "🗄️ Generating database types..."
npm run db:generate

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
