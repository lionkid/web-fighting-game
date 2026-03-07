#!/usr/bin/env bash
# Web Fighting Game — macOS/Linux installer
# iPad: connect to the same WiFi, then open the LAN URL in Safari
set -e

BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "${BOLD}=== Web Fighting Game Installer ===${RESET}"
echo ""

# ── Node.js ────────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "${YELLOW}Node.js not found.${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v brew &>/dev/null; then
      echo "Installing Homebrew..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      # Add brew to PATH for Apple Silicon
      if [[ -f /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
      fi
    fi
    echo "Installing Node.js via Homebrew..."
    brew install node
  else
    echo "Please install Node.js from https://nodejs.org (LTS recommended), then re-run this script."
    exit 1
  fi
fi

echo "${GREEN}✓${NC} Node.js $(node --version) / npm $(npm --version)"

# ── Dependencies ───────────────────────────────────────────────────────────────
echo "Installing npm dependencies..."
npm install
echo "${GREEN}✓${NC} Dependencies installed"

# ── Network info for iPad ──────────────────────────────────────────────────────
LAN_IP=""
if [[ "$OSTYPE" == "darwin"* ]]; then
  # Try Wi-Fi (en0) then Ethernet (en1)
  LAN_IP=$(ipconfig getifaddr en0 2>/dev/null \
        || ipconfig getifaddr en1 2>/dev/null \
        || ipconfig getifaddr en2 2>/dev/null \
        || echo "")
fi
if [[ -z "$LAN_IP" ]]; then
  # Linux fallback
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
fi

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
echo "${BOLD}=== Ready! Run the game with: npm start ===${RESET}"
echo ""
echo "  Local (same machine):  http://localhost:3000"
if [[ -n "$LAN_IP" ]]; then
  echo "  LAN / iPad (Safari):   http://${LAN_IP}:3000"
  echo ""
  echo "  ${YELLOW}iPad:${NC} make sure this Mac and the iPad are on the same Wi-Fi network,"
  echo "  then open the LAN URL above in Safari."
fi
echo ""
