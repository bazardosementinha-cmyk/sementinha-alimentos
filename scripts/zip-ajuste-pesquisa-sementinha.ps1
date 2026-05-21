$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OutputDir = Join-Path $ProjectRoot "_chatgpt"
$ZipName = "sementinha-alimentos-pesquisa-admin.zip"
$ZipPath = Join-Path $OutputDir $ZipName
$TempDir = Join-Path $OutputDir "zip-temp"

if (Test-Path $TempDir) {
  Remove-Item $TempDir -Recurse -Force
}

if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

New-Item -ItemType Directory -Path $TempDir | Out-Null

$items = @(
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "next.config.mjs",
  "tsconfig.json",
  "eslint.config.mjs",
  "postcss.config.mjs",
  "tailwind.config.ts",
  "tailwind.config.js",
  ".env.example",
  "src\app\layout.tsx",
  "src\app\page.tsx",
  "src\app\globals.css",
  "src\lib",
  "src\types",
  "src\components",
  "src\app\pesquisa-sementinha",
  "src\app\admin",
  "supabase",
  "scripts"
)

foreach ($item in $items) {
  $source = Join-Path $ProjectRoot $item

  if (Test-Path $source) {
    $destination = Join-Path $TempDir $item
    $destinationParent = Split-Path -Parent $destination

    if (!(Test-Path $destinationParent)) {
      New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    }

    Copy-Item $source $destination -Recurse -Force
    Write-Host "Incluído: $item"
  } else {
    Write-Host "Não encontrado/opcional: $item"
  }
}

$excludeDirs = @(
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "_chatgpt"
)

foreach ($dir in $excludeDirs) {
  $paths = Get-ChildItem $TempDir -Directory -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq $dir }

  foreach ($path in $paths) {
    Remove-Item $path.FullName -Recurse -Force
  }
}

if (Test-Path $ZipPath) {
  Remove-Item $ZipPath -Force
}

Compress-Archive -Path (Join-Path $TempDir "*") -DestinationPath $ZipPath -Force

Remove-Item $TempDir -Recurse -Force

Write-Host ""
Write-Host "ZIP gerado com sucesso:"
Write-Host $ZipPath
