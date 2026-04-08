@echo off
cd /d "%~dp0"
echo Running template creation script...
node create-templates.js
pause
