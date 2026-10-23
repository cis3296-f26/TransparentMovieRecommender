@echo off
rem Sets up What's Next on Windows: Python, virtual environment, dependencies, and MovieLens data.
cd /d "%~dp0"
if not exist poc.py (
    echo This script must be in the TransparentMovieRecommender folder, next to poc.py.
    goto :error
)

rem --- Check: is Python installed? If not, install it ---
call :find_python
if not defined PY (
    echo Python not found.
    where winget >nul 2>&1 || (
        echo winget is not available. Install Python from https://www.python.org/downloads/ and run setup again.
        goto :error
    )
    echo Installing Python 3.13 with winget. This can take a few minutes...
    winget install -e --id Python.Python.3.13 --scope user --accept-package-agreements --accept-source-agreements || goto :error
    call :find_python
)
if not defined PY (
    echo Python was installed but could not be found. Close this window and run setup again.
    goto :error
)
echo Using Python: %PY%

if not exist venv (
    echo Creating virtual environment...
    %PY% -m venv venv || goto :error
)

echo Installing dependencies...
venv\Scripts\python -m pip install -r requirements.txt || goto :error

if exist data\ratings.csv if exist data\movies.csv (
    echo MovieLens data already present, skipping download.
    goto :done
)

echo Downloading MovieLens dataset...
curl -L -o ml-latest-small.zip https://files.grouplens.org/datasets/movielens/ml-latest-small.zip || goto :error
tar -xf ml-latest-small.zip || goto :error
if not exist data mkdir data
move /y ml-latest-small\ratings.csv data\ >nul || goto :error
move /y ml-latest-small\movies.csv data\ >nul || goto :error
rmdir /s /q ml-latest-small
del ml-latest-small.zip

:done
echo.
echo Setup complete.
pause
exit /b 0

:error
echo.
echo Setup failed. See the message above.
pause
exit /b 1

rem --- Looks for Python in three places and stores the command in PY ---
:find_python
set "PY="
python --version >nul 2>&1 && (set "PY=python" & exit /b 0)
py -3 --version >nul 2>&1 && (set "PY=py -3" & exit /b 0)
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set PY="%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
exit /b 0