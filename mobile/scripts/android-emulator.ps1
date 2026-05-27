# Starts an Android emulator (if needed) and launches the Expo app on it.
# Requires Android SDK at %LOCALAPPDATA%\Android\Sdk

$ErrorActionPreference = "Stop"

$env:JAVA_HOME = if (Test-Path "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot") {
  "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
} else { $env:JAVA_HOME }
if ($env:JAVA_HOME) { $env:Path = "$env:JAVA_HOME\bin;" + $env:Path }

$AndroidSdk = "$env:LOCALAPPDATA\Android\Sdk"
$Emulator = Join-Path $AndroidSdk "emulator\emulator.exe"
$Adb = Join-Path $AndroidSdk "platform-tools\adb.exe"
$AvdManager = Join-Path $AndroidSdk "cmdline-tools\latest\bin\avdmanager.bat"
$DefaultAvdName = "AIStudyCompanion_API36"

if (-not (Test-Path $Emulator)) {
  Write-Host "Android emulator not found at: $Emulator"
  Write-Host "Install Android Studio and the Android SDK, then create a virtual device."
  Write-Host "Guide: docs/09-android-emulator-setup.md"
  exit 1
}

$env:ANDROID_HOME = $AndroidSdk
$env:ANDROID_SDK_ROOT = $AndroidSdk
$env:Path = "$AndroidSdk\platform-tools;$AndroidSdk\emulator;" + $env:Path

function Get-BootedDevices {
  $output = & $Adb devices | Select-Object -Skip 1
  return $output | Where-Object { $_ -match "device$" }
}

function Wait-ForEmulatorBoot {
  param([int]$TimeoutSeconds = 180)
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
    $boot = & $Adb shell getprop sys.boot_completed 2>$null
    if ($boot.Trim() -eq "1") { return $true }
    Start-Sleep -Seconds 2
  }
  return $false
}

$devices = Get-BootedDevices
if ($devices.Count -eq 0) {
  $avds = & $Emulator -list-avds
  if (-not $avds -or $avds.Count -eq 0) {
    Write-Host "No Android Virtual Devices (AVDs) found."
    Write-Host ""
    Write-Host "Create one in Android Studio:"
    Write-Host "  Tools -> Device Manager -> Create Device -> Pixel 7 -> API 36 -> Finish"
    Write-Host ""
    Write-Host "Or run from repo root:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File mobile/scripts/create-android-avd.ps1"
    Write-Host ""
    Write-Host "Full guide: docs/09-android-emulator-setup.md"
    exit 1
  }

  $avdToStart = if ($avds -contains $DefaultAvdName) { $DefaultAvdName } else { $avds[0] }
  Write-Host "Starting emulator: $avdToStart"
  Start-Process -FilePath $Emulator -ArgumentList @(
    "-avd", $avdToStart,
    "-gpu", "swiftshader_indirect",
    "-no-snapshot-load",
    "-no-snapshot-save",
    "-netdelay", "none",
    "-netspeed", "full"
  ) -WindowStyle Normal | Out-Null

  Write-Host "Waiting for emulator to boot..."
  & $Adb wait-for-device | Out-Null
  if (-not (Wait-ForEmulatorBoot)) {
    Write-Host "Emulator did not finish booting in time."
    exit 1
  }
  Write-Host "Emulator is ready."
} else {
  Write-Host "Using already-connected device/emulator."
}

Set-Location $PSScriptRoot\..
Write-Host "Launching Expo on Android (Expo Go mode)..."
npx expo start --android --go
