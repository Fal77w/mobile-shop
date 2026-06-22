#!/bin/sh
# Daily backup cron helper — run from host or Docker sidecar
# Example crontab: 0 2 * * * /path/to/scripts/backup-cron.sh
set -e
BACKUP_DIR="${BACKUP_DIR:-./backups}"
APP_URL="${APP_URL:-http://localhost:3022}"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y-%m-%d)
curl -sf -H "Cookie: $(cat "${BACKUP_COOKIE_FILE:-/dev/null}" 2>/dev/null)" \
  "$APP_URL/api/backup" -o "$BACKUP_DIR/moblies-shop-$DATE.json" || \
  echo "Backup failed — ensure admin session cookie or run export from Settings UI"
