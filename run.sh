#!/bin/bash

# ==========================================
# TransitOPS Local Development Runner
# ==========================================
# This script starts both the backend and frontend
# servers concurrently for local development.

echo "🚀 Starting TransitOPS Local Environment..."

# Function to handle cleanup on Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Shutting down TransitOPS..."
    trap - SIGINT SIGTERM # clear the trap
    kill 0
    exit 0
}

# Catch SIGINT (Ctrl+C) and SIGTERM and call cleanup
trap cleanup SIGINT SIGTERM

# 1. Start the backend
echo "📦 Starting Backend Server (Port 5005)..."
cd backend || exit
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 2

# 2. Start the frontend
echo "🎨 Starting Frontend Server (Vite)..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ TransitOPS is running!"
echo "👉 Frontend: http://localhost:5173"
echo "👉 Backend API: http://localhost:5005/api/health"
echo "Press Ctrl+C to stop both servers."

# Wait for background processes to finish
wait $BACKEND_PID
wait $FRONTEND_PID
