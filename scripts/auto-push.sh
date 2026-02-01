#!/bin/bash
set -e

REPO_DIR="/Users/tao.shen/opencode-web"
cd "$REPO_DIR"

if [ -z "$1" ]; then
    COMMIT_MSG="auto: Update from $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Changes detected, committing..."
    git add -A
    git commit -m "$COMMIT_MSG"
    git push origin main
    echo "✅ Changes pushed successfully!"
else
    echo "ℹ️ No changes to commit"
fi
