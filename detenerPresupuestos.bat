@echo off
REM Establece el título de la ventana de la terminal
TITLE Detenedor de App de Presupuesto

REM Cambia al directorio donde se encuentra el script
cd /d "%~dp0"

echo.
echo ===================================================
echo = Deteniendo y eliminando los contenedores...     =
echo ===================================================
echo.

REM Detiene los contenedores y elimina la red creada
docker-compose down

echo.
echo ===================================================
echo = Contenedores detenidos correctamente.           =
echo ===================================================
echo.

echo Presiona cualquier tecla para cerrar esta ventana.
pause > NUL