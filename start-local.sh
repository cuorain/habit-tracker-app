#!/bin/bash

# ログファイル名
BACKEND_LOG="backend.log"
FRONTEND_LOG="frontend.log"

echo "Starting Habit Tracker Application locally..."

# 古いログファイルを削除

# Start Backend
echo "Installing backend dependencies..."
cd backend && npm install
echo "Starting backend server... (Logs redirected to $BACKEND_LOG)"
npm start > ../$BACKEND_LOG 2>&1 &
cd ..

# Start Frontend
echo "Installing frontend dependencies..."
cd frontend && npm install
echo "Starting frontend development server... (Logs redirected to $FRONTEND_LOG)"
npm run dev > ../$FRONTEND_LOG 2>&1 &
cd ..

echo "Application started. Backend is running in the background, Frontend is running in the background."
echo "You can access the frontend at http://localhost:5174/ (or another port if 5173 is in use)"
echo "Tailing logs. Press Ctrl+C to stop tailing and clean up logs."
wait
tail -f $BACKEND_LOG $FRONTEND_LOG

# Ctrl+Cでtailが終了した後のクリーンアップ
echo "To clean up log files, run: rm $BACKEND_LOG $FRONTEND_LOG"

