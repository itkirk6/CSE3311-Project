# /srv/myproject/git-auto-pull.sh
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/kirk-admin/projects/CSE3311-Project"
BRANCH="main"
LOG="/var/log/git-auto-pull.log"
LOCK="/var/lock/git-auto-pull.lock"

# Prevent overlapping runs
exec 9>"$LOCK"
flock -n 9 || exit 0

cd "$REPO_DIR"

# Make sure we’re on the right branch and have the remote
git remote update origin --prune
LOCAL="$(git rev-parse "$BRANCH")"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "[$(date -Is)] Detected new commits on $BRANCH; pulling…" | tee -a "$LOG"
  git checkout "$BRANCH" >/dev/null 2>&1 || true
  git pull --ff-only origin "$BRANCH" | tee -a "$LOG"

  # Optional: rebuild/restart your app
  if [ -f docker-compose.yml ] || [ -f docker-compose.yaml ]; then
    echo "[$(date -Is)] Rebuilding containers…" | tee -a "$LOG"
    docker compose build >> "$LOG" 2>&1
    docker compose up -d >> "$LOG" 2>&1
  fi
fi
