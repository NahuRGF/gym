# Publica dist/ en la rama gh-pages de GitHub Pages.
#
# Se usa la rama en vez de un workflow de Actions porque el token de gh CLI no
# tiene el scope 'workflow', y GitHub rechaza el push de cualquier archivo bajo
# .github/workflows/ sin ese permiso.
#
# Uso: npm run deploy

$ErrorActionPreference = 'Stop'

$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

Write-Host '1/4 compilando...'
npm run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build fallo' }

$staging = Join-Path $env:TEMP 'gym-gh-pages'
if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

Write-Host '2/4 copiando dist...'
Copy-Item -Path (Join-Path $raiz 'dist\*') -Destination $staging -Recurse -Force
# Sin esto GitHub Pages pasa los archivos por Jekyll y los descarta.
New-Item -ItemType File -Path (Join-Path $staging '.nojekyll') -Force | Out-Null

Write-Host '3/4 confirmando en la rama gh-pages...'
Push-Location $staging
try {
    git init -q -b gh-pages
    git add -A
    $mensaje = "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -q -m $mensaje 2>&1 | Out-String | Write-Host
    $ultimo = git log --oneline -1
} finally {
    Pop-Location
}

Write-Host "4/4 subiendo a GitHub ($ultimo)..."
Push-Location $staging
try {
    git push --force https://github.com/NahuRGF/gym.git gh-pages
} finally {
    Pop-Location
}

Write-Host ''
Write-Host 'Publicado: https://nahrgf.github.io/gym/'
Write-Host 'Puede tardar 1-2 minutos en estar disponible.'
