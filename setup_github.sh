#!/bin/bash
# Initialize git
git init
git add .
git commit -m "Initial commit of Tenant Invoicing App"

# Instructions for user
echo "========================================================"
echo "Project is ready for GitHub Personal Hosting (Free)!"
echo "========================================================"
echo "You now need to manually:"
echo "1. Go to https://github.com/new and create a new repository (name it 'tenant-app' or similar)"
echo "2. Copy the commands shown on GitHub under '…or push an existing repository from the command line'"
echo "   It will look like:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/tenant-app.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Run those commands in this terminal."
echo "4. After pushing, run: npm run deploy"
echo "========================================================"
