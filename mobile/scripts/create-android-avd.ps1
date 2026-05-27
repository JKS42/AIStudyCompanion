# Creates a default Android Virtual Device for AI Study Companion (one-time setup).
# Requires Android SDK command-line tools and a system image.

$ErrorActionPreference = "Stop"

$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

$AndroidSdk = "$env:LOCALAPPDATA\Android\Sdk"
$SdkManager = Join-Path $AndroidSdk "cmdline-tools\latest\bin\sdkmanager.bat"
$AvdManager = Join-Path $AndroidSdk "cmdline-tools\latest\bin\avdmanager.bat"
$DefaultAvdName = "AIStudyCompanion_API36"
$SystemImage = "system-images;android-36;google_apis_playstore;x86_64"

if (-not (Test-Path $SdkManager)) {
  Write-Host "Android SDK command-line tools not found."
  Write-Host "Install Android Studio, then in SDK Manager enable:"
  Write-Host "  - Android SDK Command-line Tools (latest)"
  Write-Host "  - Android Emulator"
  Write-Host "  - Android 16 (API 36) Google Play system image (x86_64)"
  Write-Host ""
  Write-Host "Guide: docs/09-android-emulator-setup.md"
  exit 1
}

$env:ANDROID_HOME = $AndroidSdk
$env:ANDROID_SDK_ROOT = $AndroidSdk

Write-Host "Accepting SDK licenses..."
cmd /c "echo y | `"$SdkManager`" --licenses" | Out-Null

Write-Host "Installing system image (this may take several minutes)..."
& $SdkManager $SystemImage

$existing = & (Join-Path $AndroidSdk "emulator\emulator.exe") -list-avds
if ($existing -contains $DefaultAvdName) {
  Write-Host "AVD '$DefaultAvdName' already exists."
  exit 0
}

Write-Host "Creating AVD '$DefaultAvdName'..."
cmd /c "echo no | `"$AvdManager`" create avd -n $DefaultAvdName -k `"$SystemImage`" -d pixel_7"
Write-Host "Done. Run: npm run android:emulator"
