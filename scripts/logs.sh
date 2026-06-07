#!/bin/bash
# Log helper script untuk debugging microservices (Workshop 14.5)
# Usage: ./scripts/logs.sh [command] [args]
#
# Catatan: service item di Docker Compose bernama cuti-service (folder: item-service)

COMPOSE="docker compose"
SERVICES="auth-service cuti-service"

case "$1" in
  all)
    echo "📋 Showing all service logs..."
    $COMPOSE logs -f $SERVICES
    ;;
  errors)
    echo "❌ Showing ERROR logs only..."
    $COMPOSE logs $SERVICES 2>&1 | grep '"level":"ERROR"'
    ;;
  trace)
    if [ -z "$2" ]; then
      echo "Usage: ./scripts/logs.sh trace <correlation-id>"
      exit 1
    fi
    echo "🔗 Tracing correlation ID: $2"
    $COMPOSE logs $SERVICES 2>&1 | grep "$2"
    ;;
  export)
    outfile="logs/all-services-$(date +%Y%m%d).log"
    mkdir -p logs
    echo "💾 Exporting logs to $outfile..."
    $COMPOSE logs --no-color > "$outfile"
    echo "✅ Done: $outfile"
    ;;
  metrics)
    echo "📊 Fetching metrics..."
    echo "--- Auth Service ---"
    curl -sf http://localhost/auth/metrics | python3 -m json.tool 2>/dev/null \
      || curl -sf http://localhost:8001/metrics | python3 -m json.tool 2>/dev/null \
      || curl -s http://localhost:8001/metrics
    echo ""
    echo "--- Item Service ---"
    curl -sf http://localhost/items/metrics | python3 -m json.tool 2>/dev/null \
      || curl -sf http://localhost:8002/metrics | python3 -m json.tool 2>/dev/null \
      || curl -s http://localhost:8002/metrics
    ;;
  *)
    echo "Usage: ./scripts/logs.sh {all|errors|trace <id>|export|metrics}"
    echo ""
    echo "  all              Follow logs auth-service + cuti-service"
    echo "  errors           Filter JSON logs with level ERROR"
    echo "  trace <id>       Filter by correlation ID"
    echo "  export           Save all compose logs to logs/all-services-YYYYMMDD.log"
    echo "  metrics          Fetch metrics via gateway (fallback: direct ports 8001/8002)"
    exit 1
    ;;
esac
