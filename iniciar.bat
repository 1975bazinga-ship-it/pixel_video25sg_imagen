@echo off
cd /d "%~dp0"
echo Iniciando Pixelizador Retrô Pro...
echo.
echo Acesse no navegador: http://127.0.0.1:8080
echo.
start http://127.0.0.1:8080/index.html
npx http-server
pause