@echo off
REM ============================================================
REM NEVROCARDIOMED — Avtomatik ishga tushirish
REM ============================================================

set "PATH=C:\Program Files\nodejs;%PATH%"
set "PROJECT=%~dp0"

REM ── Backend ─────────────────────────────────────────────────
start "NEVROCARDIOMED Backend" /MIN /D "%PROJECT%backend" "%PROJECT%backend\venv\Scripts\uvicorn.exe" main:app --reload --host 0.0.0.0 --port 8000

REM Backendni kutamiz
timeout /t 5 /nobreak >nul

REM ── Frontend ────────────────────────────────────────────────
start "NEVROCARDIOMED Frontend" /MIN /D "%PROJECT%frontend" cmd /c "npm run dev"

REM Frontend tayyor bo'lishini kutamiz
timeout /t 10 /nobreak >nul

REM ── Brauzerda ochish ────────────────────────────────────────
start "" "http://localhost:5173"

exit
