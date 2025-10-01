#!/bin/bash

# バックエンドプロセスを停止（もし実行中であれば）
# nodemonまたはnode server.jsのプロセスを停止する

PORT=8080 # Expressのデフォルトポートを8080に修正
PID=$(lsof -t -i :$PORT)

if [ -n "$PID" ]; then
  echo "Stopping backend process on port $PORT (PID: $PID)..."
  kill -9 $PID
  sleep 2
fi

echo "Starting backend development server with nodemon..."
cd backend
npm run dev
