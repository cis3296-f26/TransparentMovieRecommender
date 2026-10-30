@echo off
rem Starts the What's Next server on Windows.
cd /d "%~dp0.."
if not exist back-end\app.py (
    echo This script must be in the back-end folder, next to app.py.
    goto :error
)

rem --- Check: has setup been run? ---
if not exist venv\Scripts\python.exe goto :not_setup
if not exist data\ratings.csv goto :not_setup
if not exist data\movies.csv goto :not_setup

echo Starting server at http://127.0.0.1:5000
echo Press Ctrl+C to stop it.
echo.
venv\Scripts\python back-end\app.py
pause
exit /b 0

:not_setup
echo Setup has not been run yet. Run setup.bat first.
goto :error

:error
echo.
echo Could not start the server. See the message above.
pause
exit /b 1