param(
  [string]$ProjectRef = "yymrcuvmrliqmijokhfk",
  [string]$PoolerHost = "aws-1-eu-central-1.pooler.supabase.com",
  [string]$AdminEmail = "mbanwie@hotmail.com",
  [switch]$SkipDatabaseUpdate
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env"

if (-not (Test-Path -LiteralPath $envPath)) {
  throw "Missing .env at $envPath"
}

$existingLines = Get-Content -LiteralPath $envPath

if (-not $SkipDatabaseUpdate) {
  $securePassword = Read-Host "Supabase database password" -AsSecureString
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

  try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $encodedPassword = [Uri]::EscapeDataString($plainPassword)
  } finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
  }

  $databaseUrl = "postgresql://postgres.${ProjectRef}:${encodedPassword}@${PoolerHost}:6543/postgres?pgbouncer=true"
  $directUrl = "postgresql://postgres.${ProjectRef}:${encodedPassword}@${PoolerHost}:5432/postgres"
  $preservedLines = $existingLines | Where-Object {
    $_ -notmatch '^\s*DATABASE_URL\s*=' -and $_ -notmatch '^\s*DIRECT_URL\s*='
  }
  $newLines = @("DATABASE_URL=`"$databaseUrl`"", "DIRECT_URL=`"$directUrl`"") + $preservedLines
  Set-Content -LiteralPath $envPath -Value $newLines -Encoding utf8
  Write-Host "Updated local .env with Supabase connection strings."
}

$variables = @{}
foreach ($line in Get-Content -LiteralPath $envPath) {
  if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?(.*?)"?\s*$') {
    $variables[$matches[1]] = $matches[2]
  }
}

function New-SecureHexSecret {
  $bytes = New-Object byte[] 32
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
  return ([BitConverter]::ToString($bytes)).Replace("-", "").ToLowerInvariant()
}

if (-not $variables.ContainsKey("AUTH_SECRET") -or [string]::IsNullOrWhiteSpace($variables["AUTH_SECRET"])) {
  $variables["AUTH_SECRET"] = New-SecureHexSecret
  Add-Content -LiteralPath $envPath -Value "AUTH_SECRET=`"$($variables['AUTH_SECRET'])`"" -Encoding utf8
  Write-Host "Generated AUTH_SECRET."
}

if (-not $variables.ContainsKey("CRON_SECRET") -or [string]::IsNullOrWhiteSpace($variables["CRON_SECRET"])) {
  $variables["CRON_SECRET"] = New-SecureHexSecret
  Add-Content -LiteralPath $envPath -Value "CRON_SECRET=`"$($variables['CRON_SECRET'])`"" -Encoding utf8
  Write-Host "Generated CRON_SECRET."
}

if (-not $variables.ContainsKey("AUTH_EMAIL_FROM") -or [string]::IsNullOrWhiteSpace($variables["AUTH_EMAIL_FROM"])) {
  $variables["AUTH_EMAIL_FROM"] = "IPNUS <onboarding@resend.dev>"
  Add-Content -LiteralPath $envPath -Value "AUTH_EMAIL_FROM=`"$($variables['AUTH_EMAIL_FROM'])`"" -Encoding utf8
  Write-Host "Using Resend's testing sender. Replace it after verifying the IPNUS domain."
}

$variables["ADMIN_EMAILS"] = $AdminEmail
$envContent = [IO.File]::ReadAllText($envPath)
$adminLine = "ADMIN_EMAILS=`"$AdminEmail`""
if ($envContent -match '(?m)^\s*ADMIN_EMAILS\s*=.*$') {
  $envContent = [Text.RegularExpressions.Regex]::Replace($envContent, '(?m)^\s*ADMIN_EMAILS\s*=.*$', $adminLine)
} else {
  $envContent = $envContent.TrimEnd() + [Environment]::NewLine + $adminLine + [Environment]::NewLine
}
[IO.File]::WriteAllText($envPath, $envContent, (New-Object Text.UTF8Encoding($false)))
Write-Host "Configured the temporary admin/test email."

if (-not $variables.ContainsKey("RESEND_API_KEY") -or [string]::IsNullOrWhiteSpace($variables["RESEND_API_KEY"])) {
  $secureResendKey = Read-Host "Resend API key" -AsSecureString
  $resendPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureResendKey)
  try {
    $variables["RESEND_API_KEY"] = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($resendPointer)
  } finally {
    if ($resendPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($resendPointer) }
  }
  if ([string]::IsNullOrWhiteSpace($variables["RESEND_API_KEY"])) { throw "A Resend API key is required for email sign-in." }
  Add-Content -LiteralPath $envPath -Value "RESEND_API_KEY=`"$($variables['RESEND_API_KEY'])`"" -Encoding utf8
  Write-Host "Saved RESEND_API_KEY without printing it."
}

$requiredNames = @(
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "RESEND_API_KEY",
  "AUTH_EMAIL_FROM",
  "ADMIN_EMAILS",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CRON_SECRET"
)

$missing = $requiredNames | Where-Object { -not $variables.ContainsKey($_) -or [string]::IsNullOrWhiteSpace($variables[$_]) }
if ($missing.Count -gt 0) {
  Write-Warning "Local .env is missing: $($missing -join ', '). Add these before deploying."
}

$variables["AUTH_TRUST_HOST"] = "true"
# Preview variables prompt for an optional Git branch in the Vercel CLI.
# Configure production and local-development targets non-interactively here;
# preview can be copied from production in the Vercel dashboard later.
$targets = @("production", "development")

foreach ($name in $requiredNames + "AUTH_TRUST_HOST") {
  if (-not $variables.ContainsKey($name) -or [string]::IsNullOrWhiteSpace($variables[$name])) {
    continue
  }

  foreach ($target in $targets) {
    $variables[$name] | npx vercel env add $name $target --force | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to set $name for $target in Vercel."
    }
  }
}

Write-Host "Vercel environment configuration complete. Secret values were not printed."
