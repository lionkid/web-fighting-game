# Web Fighting Game — Windows installer (PowerShell 5+)
# Run from project root:  .\install.ps1
# If blocked by execution policy, run first:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

$ErrorActionPreference = "Stop"

Write-Host "`n=== Web Fighting Game Installer ===" -ForegroundColor Cyan
Write-Host ""

# ── Node.js ────────────────────────────────────────────────────────────────────
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCmd) {
    Write-Host "Node.js not found." -ForegroundColor Yellow

    # Try winget (Windows 10 1809+ / Windows 11)
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Host "Installing Node.js LTS via winget..."
        winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        # Refresh PATH in current session
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("PATH","User")
    } else {
        Write-Host "winget not available." -ForegroundColor Yellow
        Write-Host "Please download and install Node.js LTS from https://nodejs.org"
        Write-Host "Then re-run this script."
        exit 1
    }

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCmd) {
        Write-Host "Node.js installation may require a terminal restart." -ForegroundColor Yellow
        Write-Host "Close this window, open a new PowerShell, and re-run: .\install.ps1"
        exit 1
    }
}

$nodeVersion = node --version
$npmVersion  = npm --version
Write-Host "OK  Node.js $nodeVersion / npm $npmVersion" -ForegroundColor Green

# ── Dependencies ───────────────────────────────────────────────────────────────
Write-Host "Installing npm dependencies..."
npm install
Write-Host "OK  Dependencies installed" -ForegroundColor Green

# ── LAN IP (for info) ─────────────────────────────────────────────────────────
$lanIP = ""
try {
    $lanIP = (
        Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } |
        Select-Object -First 1
    ).IPAddress
} catch {}

# ── Done ───────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Ready! Run the game with: npm start ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Local (same machine):  http://localhost:3000"
if ($lanIP) {
    Write-Host "  LAN:                   http://${lanIP}:3000"
    Write-Host ""
    Write-Host "  Other devices (phone/tablet) on the same network can join via the LAN URL." -ForegroundColor Yellow
    Write-Host "  Windows Firewall may prompt you to allow Node.js — click 'Allow'." -ForegroundColor Yellow
}
Write-Host ""
