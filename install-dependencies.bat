@echo off
echo Installing Resume Builder Dependencies...
echo.

cd /d "%~dp0"

echo Installing npm packages...
npm install

echo.
echo Installation complete!
echo.
echo To start the application, run: npm start
echo.
pause