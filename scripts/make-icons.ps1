Add-Type -AssemblyName System.Drawing

function New-GymIcon {
  param(
    [int]$Size,
    [string]$OutPath,
    [bool]$Transparent = $false
  )

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  $w = [double]$Size
  $u = $w / 512.0

  if ($Transparent) {
    $g.Clear([System.Drawing.Color]::Transparent)
  } else {
    $g.Clear([System.Drawing.Color]::FromArgb(255, 16, 145, 88))
  }

  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))

  # Barra horizontal
  $barraW = 300 * $u
  $barraH = 40 * $u
  $barraX = ($w - $barraW) / 2
  $barraY = ($w - $barraH) / 2
  $g.FillEllipse($white, $barraX, $barraY, $barraW, $barraH)

  # Discos: dos pares, en ellipse para que no queden angulos rectos
  $discoW = 62 * $u
  $discoH = 150 * $u
  $discoY = ($w - $discoH) / 2
  $posiciones = @(78, 150, 300, 372)
  foreach ($px in $posiciones) {
    $g.FillEllipse($white, ($px * $u), $discoY, $discoW, $discoH)
  }

  $white.Dispose()
  $g.Dispose()
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()

  $kb = [math]::Round((Get-Item -LiteralPath $OutPath).Length / 1KB, 1)
  "  $($OutPath)  ${Size}x${Size}  ${kb} KB"
}

$raiz = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $raiz 'public'

if (-not (Test-Path -LiteralPath $pub)) {
  New-Item -ItemType Directory -Path $pub -Force | Out-Null
}

New-GymIcon -Size 512 -OutPath (Join-Path $pub 'icon-512.png')
New-GymIcon -Size 192 -OutPath (Join-Path $pub 'icon-192.png')
New-GymIcon -Size 180 -OutPath (Join-Path $pub 'apple-touch-icon.png') -Transparent $true
New-GymIcon -Size 512 -OutPath (Join-Path $pub 'icon-maskable-512.png')
