# Log helper script untuk debugging microservices (Workshop 14.5)
# Usage: powershell -File scripts/logs.ps1 [command] [args]

param(
    [Parameter(Position = 0)]
    [string]$Command = "help",
    [Parameter(Position = 1)]
    [string]$Arg = ""
)

$Services = @("auth-service", "cuti-service")

switch ($Command) {
    "all" {
        Write-Host "Showing all service logs..."
        docker compose logs -f @Services
    }
    "errors" {
        Write-Host "Showing ERROR logs only..."
        docker compose logs @Services 2>&1 | Select-String '"level":"ERROR"'
    }
    "trace" {
        if (-not $Arg) {
            Write-Host "Usage: .\scripts\logs.ps1 trace <correlation-id>"
            exit 1
        }
        Write-Host "Tracing correlation ID: $Arg"
        docker compose logs @Services 2>&1 | Select-String $Arg
    }
    "export" {
        $outfile = "logs/all-services-$(Get-Date -Format 'yyyyMMdd').log"
        New-Item -ItemType Directory -Force -Path logs | Out-Null
        Write-Host "Exporting logs to $outfile..."
        docker compose logs --no-color | Out-File -FilePath $outfile -Encoding utf8
        Write-Host "Done: $outfile"
    }
    "metrics" {
        Write-Host "--- Auth Service ---"
        $authMetrics = curl.exe -sf http://localhost/auth/metrics 2>$null
        if (-not $authMetrics) { $authMetrics = curl.exe -s http://localhost:8001/metrics }
        $authMetrics | python -m json.tool 2>$null
        if (-not $?) { Write-Host $authMetrics }
        Write-Host ""
        Write-Host "--- Item Service ---"
        $itemMetrics = curl.exe -sf http://localhost/items/metrics 2>$null
        if (-not $itemMetrics) { $itemMetrics = curl.exe -s http://localhost:8002/metrics }
        $itemMetrics | python -m json.tool 2>$null
        if (-not $?) { Write-Host $itemMetrics }
    }
    default {
        Write-Host "Usage: .\scripts\logs.ps1 {all|errors|trace <id>|export|metrics}"
    }
}
