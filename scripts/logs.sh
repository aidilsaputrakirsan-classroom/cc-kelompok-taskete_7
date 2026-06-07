#!/bin/bash
# Log helper script untuk debugging microservices
# Usage: ./scripts/logs.sh [command] [args]

case "$1" in
  all)
    echo "📋 Showing all service logs..."
    docker compose logs -f auth-service cuti-service
    ;;
  errors)
    echo "❌ Showing ERROR logs only..."
    docker compose logs auth-service cuti-service 2>&1 | grep '"level":"ERROR"'
    ;;
  trace)
    if [ -z "$2" ]; then
      echo "Usage: ./scripts/logs.sh trace <correlation-id>"
      exit 1
    fi
    echo "🔗 Tracing correlation ID: $2"
    docker compose logs auth-service cuti-service 2>&1 | grep "$2"
    ;;
  metrics)
    echo "📊 Fetching metrics..."
    echo "--- Auth Service ---"
    curl -s http://localhost:8001/metrics | python3 -m json.tool
    echo ""
    echo "--- Item Service ---"
    curl -s http://localhost:8002/metrics | python3 -m json.tool
    ;;
  *)
    echo "Usage: ./scripts/logs.sh {all|errors|trace <id>|metrics}"
    exit 1
    ;;
esac
