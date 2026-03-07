# Web Fighting Game — start server (PowerShell 5+)
# Run from project root:  .\start.ps1
# If blocked by execution policy, run first:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

$ErrorActionPreference = "Stop"

Write-Host "`n=== Web Fighting Game ===" -ForegroundColor Cyan
Write-Host ""

# ── Dependency check ───────────────────────────────────────────────────────────
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Run .\install.ps1 first." -ForegroundColor Yellow
    exit 1
}

# ── LAN IP ────────────────────────────────────────────────────────────────────
$lanIP = ""
try {
    $lanIP = (
        Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } |
        Select-Object -First 1
    ).IPAddress
} catch {}

Write-Host "  Local:  http://localhost:3000"
if ($lanIP) {
    Write-Host "  LAN:    http://${lanIP}:3000"
    Write-Host ""
    Write-Host "  Other devices on the same network can join via the LAN URL." -ForegroundColor Yellow
    Write-Host "  Windows Firewall may prompt you to allow Node.js — click 'Allow'." -ForegroundColor Yellow
}
Write-Host ""

# ── Launch ─────────────────────────────────────────────────────────────────────
Write-Host "Starting server..." -ForegroundColor Green
npm start
