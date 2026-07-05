#!/bin/bash
set -e

echo "🚀 Starting frontend deployment..."

# 1. Pull the latest code updates from the dev branch
echo "📥 Pulling latest updates from GitHub..."
git pull origin dev

# 2. Install any new dependencies
echo "📦 Installing package dependencies..."
npm install

# 3. Build the React app
echo "🏗️ Compiling the React production build..."
npm run build

# 3. Copy the compiled build to the web server path
echo "📦 Copying files to Nginx static folder..."
sudo cp -r build/* /var/www/html/

echo "✅ Frontend deployed successfully!"
