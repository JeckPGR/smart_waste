@echo off
:: Muat kredensial dari .env lokal jika ada (file .env ter-ignore oleh git)
if exist "%~dp0.env" (
    for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env") do (
        if "%%A"=="PGPASSWORD" set "PGPASSWORD=%%B"
        if "%%A"=="POSTGRES_PASSWORD" if "%PGPASSWORD%"=="" set "PGPASSWORD=%%B"
    )
)
if "%PGPASSWORD%"=="" set "PGPASSWORD=postgres"

setlocal enabledelayedexpansion

echo ===================================================
echo [Smart Waste] Restore Database PostgreSQL Mandiri
echo ===================================================

set TARGET_FILE=%~1

if "%TARGET_FILE%"=="" (
    echo Daftar file backup yang tersedia di folder backups:
    echo ---------------------------------------------------
    dir /b /o-d "%~dp0backups\*.sql" 2>nul
    echo ---------------------------------------------------
    set /p FILENAME="Masukkan nama file backup (misal: smartwaste_backup_xxx.sql): "
    set TARGET_FILE=%~dp0backups\!FILENAME!
)

if not exist "%TARGET_FILE%" (
    echo [ERROR] File backup tidak ditemukan: %TARGET_FILE%
    exit /b 1
)

:: 1. Cek apakah kontainer Docker 'smartwaste-db' aktif
docker ps --format "{{.Names}}" 2>nul | findstr /i "smartwaste-db" >nul
if %errorlevel% equ 0 (
    echo [INFO] Menjalankan restore ke kontainer Docker 'smartwaste-db'...
    type "%TARGET_FILE%" | docker exec -i smartwaste-db psql -U postgres -d smartwaste
    goto finish
)

:: 2. Cari binary psql.exe di Windows
set PSQL_BIN=psql
where psql >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" (
        set "PSQL_BIN=C:\Program Files\PostgreSQL\18\bin\psql.exe"
    ) else if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
        set "PSQL_BIN=C:\Program Files\PostgreSQL\17\bin\psql.exe"
    ) else if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
        set "PSQL_BIN=C:\Program Files\PostgreSQL\16\bin\psql.exe"
    )
)

echo [INFO] Menjalankan restore ke PostgreSQL lokal (127.0.0.1:5432)...
"%PSQL_BIN%" -h 127.0.0.1 -p 5432 -U postgres -d smartwaste -f "%TARGET_FILE%"

:finish
echo ===================================================
echo [SELESAI] Proses restore selesai.
echo ===================================================
