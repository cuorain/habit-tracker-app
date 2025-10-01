#!/bin/bash

# フロントエンドプロセスを停止（もし実行中であれば）
# Viteのdevサーバーは通常 'vite' コマンドで実行されるため、それを停止する
# pkill -f "vite" は少し強引なので、より安全な方法としてpidファイルなどを利用することも検討できる
# 今回は簡易的に、ポート番号を調べて強制終了する

PORT=5173 # Viteのデフォルトポート
PID=$(lsof -t -i :$PORT)

if [ -n "$PID" ]; then
  echo "Stopping frontend process on port $PORT (PID: $PID)..."
  kill -9 $PID
  sleep 2
fi

echo "Starting frontend development server..."
cd frontend
npm run dev


