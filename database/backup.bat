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
echo [Smart Waste] Backup Database PostgreSQL Mandiri
echo ===================================================

:: Buat folder backups jika belum ada
if not exist "%~dp0backups" mkdir "%~dp0backups"

:: Buat timestamp YYYYMMDD_HHMMSS menggunakan PowerShell
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set TIMESTAMP=%%I
set BACKUP_FILE=%~dp0backups\smartwaste_backup_%TIMESTAMP%.sql

:: 1. Cek apakah kontainer Docker 'smartwaste-db' aktif
docker ps --format "{{.Names}}" 2>nul | findstr /i "smartwaste-db" >nul
if %errorlevel% equ 0 (
    echo [INFO] Menemukan kontainer Docker 'smartwaste-db' yang aktif...
    echo [EXEC] Menjalankan pg_dump di dalam kontainer...
    docker exec -t smartwaste-db pg_dump -U postgres -d smartwaste --clean --if-exists > "%BACKUP_FILE%"
    goto verify
)

:: 2. Cari lokasi binary pg_dump.exe di lokal Windows
set PGDUMP_BIN=pg_dump
where pg_dump >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" (
        set "PGDUMP_BIN=C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
    ) else if exist "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" (
        set "PGDUMP_BIN=C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
    ) else if exist "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" (
        set "PGDUMP_BIN=C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"
    )
)

echo [INFO] Menjalankan pg_dump pada PostgreSQL lokal (127.0.0.1:5432)...
"%PGDUMP_BIN%" -h 127.0.0.1 -p 5432 -U postgres -d smartwaste --clean --if-exists -f "%BACKUP_FILE%"

:verify
if exist "%BACKUP_FILE%" (
    for %%A in ("%BACKUP_FILE%") do set FILESIZE=%%~zA
    if !FILESIZE! gtr 0 (
        echo [BERHASIL] File backup tersimpan di:
        echo %BACKUP_FILE% (!FILESIZE! bytes)
        goto finish
    ) else (
        echo [GAGAL] File backup kosong. Periksa status layanan PostgreSQL atau kredensial password.
        del "%BACKUP_FILE%" 2>nul
        goto finish
    )
)
echo [GAGAL] File backup tidak berhasil dibuat.

:finish
echo ===================================================
