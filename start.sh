#!/usr/bin/env bash
# Web Fighting Game — start server
set -e

BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "${BOLD}=== Web Fighting Game ===${RESET}"
echo ""

# ── Dependency check ───────────────────────────────────────────────────────────
if [[ ! -d node_modules ]]; then
  echo "${YELLOW}node_modules not found. Run ./install.sh first.${NC}"
  exit 1
fi

# ── Network info ───────────────────────────────────────────────────────────────
LAN_IP=""
if [[ "$OSTYPE" == "darwin"* ]]; then
  LAN_IP=$(ipconfig getifaddr en0 2>/dev/null \
        || ipconfig getifaddr en1 2>/dev/null \
        || ipconfig getifaddr en2 2>/dev/null \
        || echo "")
fi
if [[ -z "$LAN_IP" ]]; then
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
fi

echo "  Local:  http://localhost:3000"
if [[ -n "$LAN_IP" ]]; then
  echo "  LAN:    http://${LAN_IP}:3000"
  echo ""
  echo "  ${YELLOW}iPad:${NC} open the LAN URL above in Safari (same Wi-Fi required)"
fi
echo ""

# ── Launch ─────────────────────────────────────────────────────────────────────
echo "${GREEN}Starting server…${RESET}"
npm start
