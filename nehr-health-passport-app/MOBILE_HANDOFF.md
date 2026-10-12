# NEHR Mobile (Patient App) — Handoff

## Scope: read this first

This app is a **1:1 port of the patient portal already built and verified
at `nehr-web-portal/src/app/patient/**`** — nothing more.

Concretely, in scope: self-custody and managed-custody registration,
both login methods, viewing/accepting/declining/revoking consent
requests, viewing and decrypting issued records, and a DID lookup
screen. Everything else (any admin/staff functionality, offline sync,
push notifications, QR-code credential presentation, biometrics beyond
what secure key storage requires) is **explicitly out of scope for this
pass**. Ship the same feature set as the web app, faithfully, before
adding anything new — that's the whole brief.

The web portal's patient module is the reference implementation, not a
rough sketch: every crypto operation below was written, run, and
verified end to end against the live backend (including a full scripted
round-trip check covering registration → consent → issuance →
decryption → revocation). Port its *logic* directly; don't re-derive it
from the API docs.

Companion docs, read in this order:
1. [`nehr-backend/README.md`](../nehr-backend/README.md) — get the backend running locally first.
2. [`nehr-backend/docs/BACKEND_DOCUMENTATION.md`](../nehr-backend/docs/BACKEND_DOCUMENTATION.md) — full crypto/API/data-model reference.
3. [`nehr-web-portal/docs/HANDOFF.md`](../nehr-web-portal/docs/HANDOFF.md) — the web portal's own handoff notes (§8 is an earlier, shorter version of this document).

`NEXT_PUBLIC_API_URL` equivalent for this app: point at
`http://<backend-host>:8080/api/v1` (or whatever `DEPLOYMENT.md` gives
you if working against a hosted instance rather than localhost).

## The four screens, and the exact API calls behind each

### 1. Register

Two paths, matching `src/app/patient/register/`:

**Self-custody** (`hooks/usePatientRegister.ts`, `mode: "self"`):
1. Generate an Ed25519 keypair (signing) and an X25519 keypair (encryption). Reference: `src/lib/crypto/keys.ts` → `generatePatientKeyMaterial()`. Both keys are base64-encoded raw bytes.
2. `POST /auth/patients/register/self-custody { ed25519PublicKey, x25519PublicKey }` → `{ did, custodyType: "SELF" }`.
3. Save `{ did, ed25519PrivateKey, x25519PrivateKey }` to **secure device storage** — see "Key custody" below. This is the one place mobile *must* differ from the web app (which uses `localStorage`, a deliberate demo-only stand-in — see `selfCustodyIdentity.ts`'s own comment).
4. Immediately log in (step below) and land on the dashboard.

**Managed-custody** (`mode: "managed"`):
1. Generate the same two keypairs.
2. Encrypt each private key under the user's password: `src/lib/crypto/patientVault.ts` → `encryptPrivateKey(password, privateKeyBase64)`. This is Argon2id (`iterations: 2, parallelism: 1, memorySize: 19456 KB, hashLength: 32`) deriving a 32-byte key from a random 16-byte salt, then XChaCha20-Poly1305 encrypting the key with a random 24-byte nonce, packed as `salt || nonce || ciphertext` and base64-encoded into one opaque string. Needs an Argon2id implementation and an XChaCha20-Poly1305 AEAD available in React Native (web uses `hash-wasm` for Argon2id and `@noble/ciphers` for XChaCha20-Poly1305 — check these work under Hermes/RN first; both are pure JS/WASM with no Node-specific APIs, but WASM support under Hermes needs verifying before assuming it "just works").
3. `POST /auth/patients/register/managed-custody { email, password, ed25519PublicKey, x25519PublicKey, encryptedPrivateKeyEd, encryptedPrivateKeyX25 }` → `{ did, custodyType: "MANAGED" }`.
4. Immediately log in.

### 2. Login

**Self-custody** (`selfCustodyLogin.ts` → `performSelfCustodyLogin(did, ed25519PrivateKeyBase64)`):
1. `POST /auth/challenge { did }` → `{ nonce, expiresAt }`. `nonce` is base64url (no padding) — decode it to raw bytes (`base64UrlToBytes` in `encoding.ts`).
2. Sign those raw nonce bytes with the Ed25519 private key (`signEd25519` in `keys.ts`).
3. `POST /auth/verify { did, nonce, signature: <base64 of the signature> }` → `{ accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt }`.

If a device identity already exists in secure storage, this whole flow is what a "Continue as this device" button does — no password ever involved for self-custody.

**Managed-custody** (`usePatientLogin.ts`, `managedLogin`):
1. `POST /auth/patients/login { email, password }` → `{ tokens, encryptedPrivateKeyEd, encryptedPrivateKeyX25 }`.
2. Decrypt both blobs with the *same* password: `decryptPrivateKey(password, blob)` from `patientVault.ts` (extracts the salt from the blob, re-derives the Argon2id key, XChaCha20-Poly1305-decrypts).
3. Hold the decrypted keys in memory only for this session — **never** persist them. A relaunch of the app should require logging in again for a managed-custody account, exactly like the web app (`PatientKeyContext.tsx` is memory-only, cleared on refresh/unmount). This mirrors how staff already have to re-enter their password per credential issuance elsewhere in the system — it's the established pattern, not an inconsistency to "fix."

Either way, decode the resulting access token's payload (`jwt.ts` → `decodeAccessToken`) to know `actor_type`/`sub` client-side; the backend never returns a separate profile object.

### 3. Consents (`src/app/patient/(protected)/consents/`)

- **List**: `GET /patients/me/consents` → array of `{ consentId, grantorDid, granteeDid, requestedBy, scope, purpose, validFrom, validUntil, status, grantedAt, signingPayload }`. `signingPayload` is only non-null when `status === "PENDING"`.
- **Accept**: sign `signingPayload` **as UTF-8 bytes, exactly as returned — don't reconstruct or re-derive it client-side** — with the Ed25519 private key, then `POST /patients/me/consents/{consentId}/accept { signature: <base64> }`.
- **Decline/Revoke**: `POST /patients/me/consents/{consentId}/revoke` (no body).

`scope` entries are plain strings from a fixed catalog (`src/lib/vc-types.ts` — 5 entries: "Malaria Test Result", "Typhoid Test Result", "Hypertension Diagnosis", "Diabetes Diagnosis", "Vaccination Record"). Mirror that same catalog for display purposes (labels), but the patient app never needs to *create* a scope — only hospital staff does that.

### 4. Records (`src/app/patient/(protected)/records/`)

- **List**: `GET /patients/me/records` → `{ recordId, issuerDid, recordType, createdAt, revoked }[]` — metadata only, no ciphertext. Show a "Decrypting…" state per row (the web app decrypts eagerly per-row to show a real title — see below) or lazily on tap; either is fine, but don't show the raw `recordId` as if it were the title.
- **Detail/decrypt**: `GET /patients/me/records/{recordId}` → `{ recordId, issuerDid, recordType, encryptedBlob, nonce, createdAt, revoked }` (both `encryptedBlob` and `nonce` are base64). Then:
  1. `GET /dids/{issuerDid}` (public, no auth) → DID Resolution Result. Find the `X25519KeyAgreementKey2020` entry in `didDocument.verificationMethod` and take its `publicKeyMultibase` (`extractX25519PublicKeyMultibase` in `recordCipher.ts`).
  2. `decryptRecord(patientX25519PrivateKeyBase64, issuerX25519Multibase, nonce, encryptedBlob)` — X25519 ECDH agreement → BLAKE3-256 of the shared secret as the symmetric key → XChaCha20-Poly1305 decrypt. Needs a `multibaseToBytes` (base58btc decode, `z`-prefix) — see `encoding.ts` for the exact algorithm if your crypto library doesn't ship one.
  3. `JSON.parse` the plaintext into a VC object: `{ issuer, issuanceDate, credentialSubject: { id, resourceType, recordedBy: { doctorDid, fullName, licenceNumber }, content }, proof }`.
  4. Render `content`'s fields using `vc-types.ts`'s field labels for the matching `resourceType` (falls back to a humanized key name for anything unrecognized) — **not raw JSON**. This was a deliberate UX fix on the web side; carry it over.
- A record with `revoked: true` should show a clear revoked indicator; it can still be viewed/decrypted (revocation doesn't delete anything, it's just a flag).

### 5. DID Lookup

`GET /dids/{did}` (public, no auth) — display the resolved DID Document, its status (`deactivated` flag → "REVOKED"/"ACTIVE"), and timestamps. This is the same panel used elsewhere in the web app (`DidLookupPanel.tsx`) — nothing patient-specific about it.

## Key custody: the one place to deliberately improve on the web app

The web app stores a self-custody patient's raw private keys in
`localStorage` (`selfCustodyIdentity.ts`), documented there as an
explicit demo-only stand-in — a browser has no secure enclave. A real
device does. Use it:

- iOS: Keychain (`Secure Enclave`-backed where available).
- Android: Keystore.
- In React Native, `react-native-keychain` or `expo-secure-store` are the
  usual choices — pick whichever fits your build tooling (bare RN vs.
  Expo).

This is the **only** deviation from "mirror the web app exactly" this
document asks for, and it's a security improvement in the same spot the
web app already flagged as its weakest link — not scope creep.

## Non-goals for this pass

- No offline-first behavior (queueing actions, local caching for
  offline reads) — the web app doesn't have this either; mirror it as
  online-only for now.
- No push notifications for new consent requests or issued records —
  the web app is pure pull-on-demand (TanStack Query refetch), no
  realtime channel exists on the backend.
- No QR-code or NFC credential presentation flow — `POST
  /credentials/verify` exists and is public/unauthenticated, but no UI
  for *using* it was ever specified or built; leave it for a later pass.
- No biometric unlock beyond whatever the secure-storage library
  requires by default.
- No redesign of the flow or information architecture — match the web
  app's screens (register choice → login choice → dashboard → consents
  / records / lookup) rather than inventing a different navigation
  structure.
