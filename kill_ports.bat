@echo off

echo Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Taskkill /PID %%a /F
    Taskkill /PID %%a /F
)

echo Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Taskkill /PID %%a /F
    Taskkill /PID %%a /F
)

echo All processes on ports 3000 and 5000 have been terminated.
pause
