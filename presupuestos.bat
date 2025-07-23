@echo off
REM Establece el título de la ventana de la terminal
TITLE Lanzador de App de Presupuesto

REM Cambia al directorio donde se encuentra el script
cd /d "%~dp0"

echo.
echo ===================================================
echo = Iniciando contenedores de la aplicacion...      =
echo = (Esto puede tardar un momento la primera vez)   =
echo ===================================================
echo.

REM Levanta los contenedores en modo "detached" (segundo plano)
docker-compose up -d

echo.
echo ===================================================
echo = Contenedores iniciados.                         =
echo = Esperando 10 segundos para que todo arranque...  =
echo ===================================================
echo.

REM Espera 10 segundos para dar tiempo a que la base de datos y el backend se inicien
timeout /t 10 /nobreak > NUL

echo.
echo ===================================================
echo = Abriendo la aplicacion en tu navegador...       =
echo ===================================================
echo.

REM Abre la URL del frontend en el navegador por defecto
start http://localhost:3000

echo.
echo Listo! Puedes cerrar esta ventana.
echo.

pause