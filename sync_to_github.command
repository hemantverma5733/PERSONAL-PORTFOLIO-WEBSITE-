#!/bin/bash
cd "$(dirname "$0")"

echo "====================================="
echo "  GitHub Auto Sync By Antigravity"
echo "====================================="

# Check if git remote is set
REMOTE_URL=$(git config --get remote.origin.url)

if [ -z "$REMOTE_URL" ]; then
    echo "Error: Aapne abhi tak GitHub repository ka link nahi dala hai."
    echo "Pehle terminal me ye command chalayein:"
    echo "git remote add origin <Aapki-GitHub-Repo-Link>"
    echo "Aur fir se is script ko chalayein."
    echo "====================================="
    exit 1
fi

echo "Changes ko GitHub par upload kiya jaa raha hai..."

# Add all changes
git add .

# Commit with a timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Auto sync update: $TIMESTAMP"

# Push to GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo "====================================="
    echo "✅ Success! Aapke changes GitHub par update ho gaye hain."
    echo "====================================="
else
    echo "====================================="
    echo "❌ Error! Kuch problem aayi hai. Please check karein ki aapka internet chal raha hai aur aapne GitHub me login kiya hua hai."
    echo "====================================="
fi
