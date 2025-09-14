@echo off
title E-Health Record System - MedVault
color 0A

echo ====================================================
echo            E-Health Record System - MedVault
echo ====================================================
echo.
echo Starting servers...
echo.

REM Get the directory where this batch file is located
set "PROJECT_DIR=%~dp0"

REM Change to project directory
cd /d "%PROJECT_DIR%"

echo [1/2] Starting Backend Server (MongoDB + API)...
start "MedVault Backend" cmd /k "cd /d %PROJECT_DIR%backend && echo Starting Backend Server... && node server.js"

REM Wait a few seconds for backend to start
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server (React App)...
start "MedVault Frontend" cmd /k "cd /d %PROJECT_DIR%frontend && echo Starting Frontend Server... && npm start"

REM Wait for frontend to compile
timeout /t 5 /nobreak > nul

echo.
echo ====================================================
echo             SERVERS STARTED SUCCESSFULLY!
echo ====================================================
echo.
echo Backend API:    http://localhost:3001
echo Frontend App:   http://localhost:3000
echo.
echo LOGIN CREDENTIALS:
echo.
echo Patient Account:
echo   Email:    fakegang2005@gmail.com
echo   Password: whatrasudeep
echo.
echo Doctor Account:
echo   Email:    anurajmahur9@gmail.com
echo   Password: kuposhan
echo.
echo ====================================================
echo Opening application in your default browser...
timeout /t 3 /nobreak > nul

REM Open the application in default browser
start "" http://localhost:3000

echo.
echo Application is now running!
echo.
echo To stop the servers:
echo - Close the Backend and Frontend terminal windows
echo - Or press Ctrl+C in each terminal window
echo.
pause