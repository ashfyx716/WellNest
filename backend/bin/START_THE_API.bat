@echo off
title WellNest API (Spring Boot)
cd /d "%~dp0"

echo.
echo  ============================================================
echo   WELLNEST - Starting the sign-up / login server
echo   This window must stay OPEN while you use the website.
echo   When you see "Started WellnestApplication", you are ready.
echo   API address: http://localhost:8081
echo  ============================================================
echo.

where mvn >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Maven was not found on this PC.
    echo.
    echo Install BOTH:
    echo   - Java 17 or newer  (search: Oracle JDK 17 or Microsoft OpenJDK 17)
    echo   - Apache Maven      (search: Apache Maven download)
    echo.
    echo Add Maven's "bin" folder to your PATH, then double-click this file again.
    echo.
    echo OR use your IDE: open WellnestApplication.java and Run with profile "dev"
    echo    (see HOW_TO_RUN_API.txt in this folder)
    echo.
    pause
    exit /b 1
)

set SPRING_PROFILES_ACTIVE=dev
mvn spring-boot:run -Dspring-boot.run.profiles=dev
echo.
pause
