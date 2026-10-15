#!/bin/bash
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================================="
echo "  DES vs AES: Performance and Security Comparison PBL    "
echo "=========================================================="

if ! lsof -i :3000 > /dev/null 2>&1; then
    echo "Starting Vite server on port 3000..."
    cd "$PROJECT_DIR"
    /opt/homebrew/bin/node ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 3000 > "$PROJECT_DIR/server.log" 2>&1 &
    sleep 2
else
    echo "Vite server is already running on port 3000."
fi

echo "Opening http://localhost:3000..."
open "http://localhost:3000"
echo "Done! The application is open in your browser at http://localhost:3000"
