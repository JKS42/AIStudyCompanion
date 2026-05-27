# Android emulator setup (Windows)

Use this guide to run **AI Study Companion** on an Android emulator.

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (recommended)
- Node.js 20+ (already installed)
- Project dependencies: `cd mobile && npm install`

## One-time setup

### Option A: Android Studio UI (easiest)

1. Open **Android Studio**
2. **More Actions → SDK Manager** (or **Settings → Languages & Frameworks → Android SDK**)
3. **SDK Platforms** tab: enable **Android 16 (API 36)**
4. **SDK Tools** tab: enable:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator
   - Android SDK Command-line Tools (latest)
5. **SDK Platforms → Show Package Details**: under API 36, enable  
   **Google Play Intel x86_64 Atom System Image**
6. Apply and wait for downloads
7. **Tools → Device Manager → Create Device**
   - Phone: **Pixel 7**
   - System image: **API 36** with **Google Play**
   - Name: `AIStudyCompanion_API36` (optional)
   - Finish

### Option B: Command line (after SDK tools installed)

From repo root:

```powershell
powershell -ExecutionPolicy Bypass -File mobile/scripts/create-android-avd.ps1
```

## Connect emulator to this project

From `mobile/`:

```powershell
npm run android:emulator
```

This script will:

1. Use `%LOCALAPPDATA%\Android\Sdk`
2. Start an AVD if none is running
3. Wait for the emulator to boot
4. Launch Expo in **Expo Go** mode on Android

### Manual steps

**Terminal 1** — start emulator (Android Studio Device Manager → Play), or:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd YOUR_AVD_NAME
```

**Terminal 2** — start Expo:

```powershell
cd mobile
npm run dev
```

When Metro is running, press **`a`** to open on Android.

If you see “Using development build”, press **`s`** to switch to **Expo Go**.

## Environment variables (optional)

Add to your user or system PATH:

| Variable | Value |
|----------|--------|
| `ANDROID_HOME` | `%LOCALAPPDATA%\Android\Sdk` |
| `ANDROID_SDK_ROOT` | `%LOCALAPPDATA%\Android\Sdk` |

Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`

The npm scripts set these for the session automatically.

## Supabase env for the app

Copy `mobile/.env.example` to `mobile/.env` and set Supabase keys, or the app will fail on launch.

## Verify connection

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

You should see something like:

```text
emulator-5554   device
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `adb` not recognized | Use full path or set `ANDROID_HOME` (see above) |
| No AVDs listed | Create a device in Android Studio Device Manager |
| Expo opens dev client | Press `s` in Metro terminal for Expo Go |
| App crashes on launch | Add `mobile/.env` with Supabase URL and anon key |
| Emulator very slow | Enable hardware acceleration (HAXM/WHPX) in BIOS + Windows Features |
| Port 8081 in use | Stop other Metro instances or run `npx expo start --port 8082` |

## iOS (macOS only)

iOS Simulator requires a Mac. On Windows, use Android emulator or a physical device with [Expo Go](https://expo.dev/go).
