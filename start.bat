@echo off
set DOWNLOADS_DIR=downloads

if not exist "%DOWNLOADS_DIR%" (
    echo PRE ^> Downloads folder does not exist, generating it...
    mkdir "%DOWNLOADS_DIR%"
)

docker-compose -f .\docker\compose.yaml up --build