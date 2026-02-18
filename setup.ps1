<#
Setup script para entorno local

Pasos que realiza:
- Comprueba que `docker` está disponible
- Instala dependencias del backend (delegando al package.json raíz)
- Levanta la base de datos usando `docker compose` y el archivo dentro de `jx4-paracotos`
- Espera hasta que el puerto 5432 responda
- Ejecuta migraciones y seed (delegando a scripts del backend)

Uso (PowerShell):
  .\setup.ps1

Notas:
- Requiere Docker Desktop en Windows.
- Ejecuta comandos que pueden tardar varios segundos/minutos.
#>
param(
    [switch]$SkipDocker,
    [switch]$AutoCopyEnv
)

function ExitWithError($msg) {
    Write-Error $msg
    exit 1
}

Write-Host "=== JX4 Paracotos - Setup local ==="

# 0) Asegurar .env.local (opcionalmente crear desde ejemplo)
if (-not (Test-Path -Path ".env.local")) {
    if ($AutoCopyEnv) {
        if (Test-Path -Path ".env.local.example") {
            Copy-Item -Path ".env.local.example" -Destination ".env.local" -Force
            Write-Host ".env.local no existía — copiado desde .env.local.example. Revisa y edita antes de continuar si contiene placeholders."
        } else {
            ExitWithError ".env.local no existe y tampoco se encontró .env.local.example. Crea .env.local con las variables necesarias."
        }
    } else {
        ExitWithError ".env.local no encontrado. Crea .env.local (puedes copiar .env.local.example) o ejecuta este script con -AutoCopyEnv para crear desde el ejemplo."
    }
}

# Copiar .env.local a .env en root y en jx4-paracotos para compatibilidad con scripts
try {
    if (-not (Test-Path -Path ".env")) {
        Copy-Item -Path ".env.local" -Destination ".env" -Force
        Write-Host "Copiado .env.local -> .env (compatibilidad dotenv en scripts)."
    }
    $projectEnv = Join-Path (Get-Location) "jx4-paracotos\.env"
    if (-not (Test-Path -Path $projectEnv)) {
        Copy-Item -Path ".env.local" -Destination $projectEnv -Force
        Write-Host "Copiado .env.local -> jx4-paracotos/.env (compatibilidad dentro del subproyecto)."
    }
} catch {
    Write-Warning "No se pudieron copiar archivos .env automáticamente: $_"
}

# 1) Verificar docker (a menos que se solicite omitir)
if (-not $SkipDocker) {
    try {
        & docker version --format '{{.Server.Version}}' > $null 2>&1
        $dockerOk = $LASTEXITCODE -eq 0
    } catch {
        $dockerOk = $false
    }

    if (-not $dockerOk) {
        ExitWithError "Docker no está disponible en el PATH. Instala Docker Desktop y asegúrate de que 'docker' funciona desde PowerShell. Si quieres omitir Docker (usar DATABASE_URL remoto), vuelve a ejecutar con -SkipDocker."
    }

    Write-Host "Docker detectado."
} else {
    Write-Host "Omitiendo comprobación de Docker por petición (-SkipDocker). Usando DATABASE_URL configurada en .env.local/.env."
}

# 2) Instalar dependencias del backend (delegado al package.json raíz)
Write-Host "Instalando dependencias del backend..."
npm run install:backend
if ($LASTEXITCODE -ne 0) { ExitWithError "npm install falló en el backend." }

if (-not $SkipDocker) {
    # 3) Levantar la DB usando docker compose (archivo en jx4-paracotos/docker-compose.yml)
    Write-Host "Levantando Postgres con docker compose (archivo jx4-paracotos/docker-compose.yml)..."
    Push-Location jx4-paracotos

    # Preferir 'docker compose' (v2) y caer a 'docker-compose' si no existe
    try {
        & docker compose version > $null 2>&1
        $useDockerCompose = $true
    } catch {
        $useDockerCompose = $false
    }

    if ($useDockerCompose) {
        & docker compose up -d
        if ($LASTEXITCODE -ne 0) { Pop-Location; ExitWithError "Error al ejecutar 'docker compose up'." }
    } else {
        try {
            & docker-compose up -d
            if ($LASTEXITCODE -ne 0) { Pop-Location; ExitWithError "Error al ejecutar 'docker-compose up'." }
        } catch {
            Pop-Location
            ExitWithError "Ni 'docker compose' ni 'docker-compose' están disponibles. Instala Docker Desktop."
        }
    }

    Pop-Location

    # 4) Esperar a que Postgres responda en localhost:5432
    Write-Host "Esperando a que Postgres responda en localhost:5432... (timeout 120s)"
    $timeout = 120
    $start = Get-Date
    $res = $false
    while ((Get-Date) - $start -lt (New-TimeSpan -Seconds $timeout)) {
        try {
            $res = Test-NetConnection -ComputerName 'localhost' -Port 5432 -InformationLevel Quiet
        } catch {
            $res = $false
        }
        if ($res) { break }
        Start-Sleep -Seconds 2
    }

    if (-not $res) { ExitWithError "Timeout esperando Postgres en localhost:5432. Revisa Docker logs con 'docker compose logs' en jx4-paracotos." }

    Write-Host "Postgres disponible."
} else {
    Write-Host "Omitiendo espera de Docker; usando DATABASE_URL configurada en .env/local para migraciones/seed."
}

# 5) Ejecutar migraciones y seed (scripts delegados desde package.json de la raíz)
Write-Host "Aplicando migraciones..."
npm run migrate
if ($LASTEXITCODE -ne 0) { ExitWithError "Error al ejecutar migraciones." }

Write-Host "Ejecutando seed..."
npm run seed
if ($LASTEXITCODE -ne 0) { ExitWithError "Error al ejecutar seed." }

Write-Host "Setup completado. Puedes ejecutar 'npm run backend:dev' o 'npm run dev' dentro de jx4-paracotos." 

exit 0
