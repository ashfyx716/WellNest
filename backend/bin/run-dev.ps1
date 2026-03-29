# Start API on http://localhost:8081 using in-memory H2 (no MySQL required).
# Requires: JDK 17+ and Maven on PATH, or run the same from your IDE with profile "dev".

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$env:SPRING_PROFILES_ACTIVE = "dev"

$mvn = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mvn) {
  Write-Host "Maven (mvn) not found on PATH. In IntelliJ: open this backend folder, set Active profiles to 'dev', Run WellnestApplication." -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting WellNest API with profile=dev (H2 in-memory) on port 8081..." -ForegroundColor Green
mvn -q spring-boot:run "-Dspring-boot.run.profiles=dev"
