@echo off
title Exam Seating Planner - Dev Server
echo ====================================================
echo Starting Exam Seating Planner Development Server...
echo ====================================================
if not exist node_modules (
  echo node_modules not found. Running npm install...
  call npm install
)
echo Launching Vite...
call npm run dev
pause

