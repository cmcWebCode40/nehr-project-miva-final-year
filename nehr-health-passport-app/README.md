# NEHR Health Passport (Patient App)

Expo / React Native app for the NEHR platform's patient surface — a 1:1
port of `nehr-web-portal`'s patient module (register, login, consents,
records, DID lookup). See [`MOBILE_HANDOFF.md`](MOBILE_HANDOFF.md) for the
full scope and the exact API calls behind each screen.

## Stack

- **Expo SDK 57** (React Native 0.86, React 19.2) with **Expo Router**
  (file-based routing under `src/app/`).
- **NativeWind v4** (Tailwind CSS classes on React Native components) —
  brand palette and font tokens ported from the web portal's
  `globals.css` into `tailwind.config.js`.
- **Axios + TanStack Query**, **react-hook-form + zod** — same choices as
  the web portal.
- **@noble/curves, @noble/hashes, @noble/ciphers** for Ed25519/X25519,
  BLAKE3 + Argon2id, and XChaCha20-Poly1305 — all pure JS, no
  WebAssembly. This is the one deliberate library substitution from the
  web app: Hermes doesn't reliably support WebAssembly, so Argon2id here
  uses `@noble/hashes`'s pure-JS implementation instead of the web app's
  `hash-wasm`. Same algorithm and parameters, no WASM dependency. See the
  comment in `src/lib/crypto/patientVault.ts`.
- **expo-secure-store** (iOS Keychain / Android Keystore) for a
  self-custody patient's private keys and the session's access/refresh
  tokens — the one deliberate deviation from the web app, which uses
  `localStorage` as a documented demo-only stand-in.

## Project layout

Package-by-feature, matching the conventions in `nehr-backend`'s and
`nehr-web-portal`'s own `CLAUDE.md`/`AGENTS.md`:

```
src/
  app/                    Expo Router routes only - no non-route code here
    index.tsx             Welcome screen / session redirect
    register.tsx
    login.tsx
    (protected)/          Route group behind RequireAuth
      _layout.tsx          Tab navigator (Overview, Consents, Records, Lookup)
      dashboard.tsx
      consents.tsx
      records.tsx
      lookup.tsx
  features/               One folder per domain, owns its types/hooks/components
    auth/
    consents/
    records/
    did-lookup/
  lib/
    api/                  Axios client + session-aware interceptors
    auth/                 Session storage, JWT decoding
    crypto/               Ed25519/X25519 keys, record decryption, key vault
    vc-types.ts            Credential type catalog (ported verbatim)
  components/
    ui/                   Primitives: Button, Input, Card, StatusBadge...
    shared/                Composed pieces: PageHeader, EmptyState, DidLookupPanel...
  theme/                  Font loading config
  types/                  Shared DTOs, mirrored 1:1 from the backend/web
```

## Running it

Backend must be running first (see
[`nehr-backend/README.md`](../nehr-backend/README.md)).

```bash
npm install
npx expo start
```

`.env.local` sets `EXPO_PUBLIC_API_URL` (defaults to
`http://localhost:8080/api/v1`, which the iOS Simulator can reach
directly).

Open on the iOS Simulator with `i`, or scan the QR code with the Expo Go
app / a development build.

### Pointing the app at the backend from Android

`localhost` inside the Android emulator (or a USB-connected device) is the
device itself, not your machine, so the default URL won't reach the backend
there. Fix it one of two ways:

**Option A — `adb reverse` (no code change; recommended for the emulator)**

```bash
npm run android:reverse     # = adb reverse tcp:8080 tcp:8080
```

`npm run android` runs that forward automatically before `expo run:android`, so
with the emulator already booted you usually don't need to do anything extra.
It maps the device's `localhost:8080` to your Mac's, so the default
`.env.local` value keeps working. `expo start` / `npx expo run:android` only
auto-reverse Metro's ports (`8081`/`8082`) — not `8080` — so **run it again
after every emulator reboot, `adb` restart, or device reconnect**; the tunnel
does not persist. This also applies when you install a release build
(`npx expo run:android --variant release`, or an EAS build) on a USB-connected
device.

**Option B — `10.0.2.2` (Android emulator only)**

Set `.env.local` to `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api/v1`
(`10.0.2.2` is the emulator's alias for the host machine). Survives
restarts, but breaks the iOS Simulator, which reaches `localhost` directly.
After changing it, restart Metro with `npx expo start -c` (env vars are
inlined at bundle time).

Debug builds already permit cleartext HTTP, so `http://` works without any
manifest change.

## Commands

```bash
npx expo install <package>   # add a dependency - resolves an SDK-compatible version
npx tsc --noEmit              # typecheck
npx expo lint                 # lint
npx expo-doctor               # diagnose dependency/config issues
npm run android               # build/install on Android (forwards 8080 first)
npm run android:reverse       # forward emulator localhost:8080 -> host (emulator must be running)
```
