<#
Teardown script para detener y limpiar contenedores levantados por `setup.ps1`.

Uso:
  .\teardown.ps1            # detiene y baja contenedores
  .\teardown.ps1 -RemoveData  # además borra la carpeta de datos local `jx4-paracotos/supabase_db`

Notas:
- Usa `docker compose down --volumes --remove-orphans` si está disponible (Docker v2+),
  o `docker-compose down -v` como fallback.
#>

param(
    [switch]$RemoveData
)

function ExitWithError($msg) {
    Write-Error $msg
    exit 1
}

Write-Host "=== JX4 Paracotos - Teardown ==="

# Verificar docker
try {
    $dockerVersion = & docker version --format '{{.Server.Version}}' 2>$null
} catch {
    $dockerVersion = $null
}

if (-not $dockerVersion) {
    ExitWithError "Docker no está disponible en el PATH. No se puede detener contenedores."
}

Write-Host "Docker detectado (server): $dockerVersion"

if (-not (Test-Path -Path "jx4-paracotos")) {
    Write-Warning "No se encontró la carpeta 'jx4-paracotos'. Intentando ejecutar 'docker compose down' desde la raíz."
    Set-Location -Path (Get-Location)
} else {
    Set-Location -Path "jx4-paracotos"
}

# Intentar docker compose v2
try {
    & docker compose down --volumes --remove-orphans
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Contenedores detenidos (docker compose)."
    } else {
        throw "compose-down-failed"
    }
} catch {
    Write-Host "Intentando fallback con 'docker-compose down -v'..."
    try {
        & docker-compose down -v
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Contenedores detenidos (docker-compose)."
        } else {
            ExitWithError "Error al ejecutar 'docker-compose down'."
        }
    } catch {
        ExitWithError "Ni 'docker compose' ni 'docker-compose' completaron la operación. Revisa Docker manualmente."
    }
}

Set-Location -Path ..

if ($RemoveData) {
    $dataPath = Join-Path -Path (Get-Location) -ChildPath "jx4-paracotos\supabase_db"
    if (Test-Path $dataPath) {
        Write-Host "Borrando datos locales en: $dataPath"
        try {
            Remove-Item -LiteralPath $dataPath -Recurse -Force
            Write-Host "Datos borrados."
        } catch {
            Write-Warning "No se pudo borrar $dataPath: $_"
        }
    } else {
        Write-Host "No se encontró la carpeta de datos local: $dataPath"
    }
}

Write-Host "Teardown completado."
exit 0
