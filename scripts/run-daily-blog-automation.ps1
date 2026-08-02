param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $WorkspaceRoot ".env.local"
$RepoUrl = "https://github.com/tutorservicesin-oss/tutorservices-website.git"
$Branch = "main"
$CloneRoot = Join-Path $env:LOCALAPPDATA "TutorServicesDailyBlogRepo"
$LogRoot = Join-Path $WorkspaceRoot ".automation-logs"
$Today = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogRoot "daily-blog-$Today.log"
$NodePath = "C:\Users\Meenakshi Sharma\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$BundledGit = "C:\Users\Meenakshi Sharma\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

function Write-Log {
  param([string]$Message)
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$stamp $Message" | Tee-Object -FilePath $LogFile -Append
}

function Get-GitCommand {
  if (Test-Path $BundledGit) {
    return $BundledGit
  }
  return "git"
}

function Import-EnvFile {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    throw ".env.local was not found at $Path"
  }

  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
      $parts = $line.Split("=", 2)
      $name = $parts[0].Trim()
      $value = $parts[1].Trim().Trim('"').Trim("'")
      if ($name) {
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
      }
    }
  }
}

Write-Log "Starting TutorServices daily blog automation."
Import-EnvFile -Path $EnvFile

if (-not $env:OPENAI_API_KEY) {
  throw "OPENAI_API_KEY is not available after loading .env.local"
}

if (-not (Test-Path $NodePath)) {
  throw "Node.js runtime was not found at $NodePath"
}

$Git = Get-GitCommand

if ($DryRun) {
  Write-Log "Dry run: environment, Node.js and Git paths are available."
  Write-Log "Dry run: clone target is $CloneRoot"
  exit 0
}

if (-not (Test-Path (Join-Path $CloneRoot ".git"))) {
  Write-Log "Cloning repository into $CloneRoot"
  if (Test-Path $CloneRoot) {
    Remove-Item -LiteralPath $CloneRoot -Recurse -Force
  }
  & $Git clone $RepoUrl $CloneRoot 2>&1 | Tee-Object -FilePath $LogFile -Append
}

Push-Location $CloneRoot
try {
  Write-Log "Updating local clone."
  & $Git checkout $Branch 2>&1 | Tee-Object -FilePath $LogFile -Append
  & $Git pull origin $Branch 2>&1 | Tee-Object -FilePath $LogFile -Append

  New-Item -ItemType Directory -Force -Path (Join-Path $CloneRoot "scripts") | Out-Null
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot "generate-daily-blogs.mjs") -Destination (Join-Path $CloneRoot "scripts\generate-daily-blogs.mjs") -Force

  Write-Log "Generating two SEO blogs."
  & $NodePath "scripts\generate-daily-blogs.mjs" 2>&1 | Tee-Object -FilePath $LogFile -Append

  $status = & $Git status --porcelain
  if (-not $status) {
    Write-Log "No new blog changes detected."
    exit 0
  }

  & $Git config user.name "Meenakshi Sharma"
  & $Git config user.email "tutorservices.in@gmail.com"
  & $Git add blog.html sitemap.xml scripts/generate-daily-blogs.mjs assets/images/*.svg *.html
  & $Git commit -m "Add daily TutorServices SEO blogs for $Today" 2>&1 | Tee-Object -FilePath $LogFile -Append
  & $Git push origin $Branch 2>&1 | Tee-Object -FilePath $LogFile -Append
  Write-Log "Daily blog automation completed and pushed."
}
finally {
  Pop-Location
}
