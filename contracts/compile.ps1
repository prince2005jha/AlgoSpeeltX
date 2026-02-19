# Compile Algopy Smart Contract
Write-Host "Compiling escrow_claim_link.py..." -ForegroundColor Cyan

# Check Python
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "Error: Python not found" -ForegroundColor Red
    exit 1
}

# Compile
python -m puyapy escrow_claim_link.py --out-dir ./out

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Check ./out directory for TEAL files" -ForegroundColor Green
} else {
    Write-Host "Compilation failed" -ForegroundColor Red
}
