# NEHR Web Portal — Handoff & Testing Blueprint

What's built, how to run it, the exact flow that's been verified end-to-end,
and what the mobile (React Native) session needs to know to pick up where
this leaves off.

Companion doc: [`nehr-backend/docs/BACKEND_DOCUMENTATION.md`](../../nehr-backend/docs/BACKEND_DOCUMENTATION.md)
covers the API, crypto, and data model this portal talks to — read that
first if the *why* behind something here isn't obvious.

---

## 1. What this is

One Next.js app serving five surfaces:

| Surface | Route | Access |
|---|---|---|
| Platform Admin | `/platform-admin/login` → `/platform-admin/*` | Private, seeded account |
| Health Admin (hospital) | `/hospital-admin/register`, `/hospital-admin/login` → `/hospital-admin/*` | Private, self-registers then needs platform approval |
| Health Staff (doctor) | `/staff/login` → `/staff/*` | Private, created by a Health Admin |
| Patient | `/patient/register`, `/patient/login` → `/patient/*` | Private, self-registers (self-custody or managed-custody) |
| DID Lookup | `/did-lookup` | Public, no auth |

Root `/` is a plain landing page linking to all five.

The original brief scoped only the first four (patient was explicitly
mobile-app territory). A patient surface was added here afterward so the
*entire* proposal-scope flow — register → approve → add staff → request
consent → **patient accepts** → issue a credential → **patient views/
decrypts it** → revoke — can be driven end to end from a browser, in two
tabs, without a mobile app or a throwaway script standing in for the
patient side. See §8 for what this means for the mobile handoff.

## 2. Stack (as specified)

- **Next.js 16** (App Router, Turbopack, React 19.2) — this version has real breaking changes from older Next.js knowledge (async `params`, `middleware` renamed to `proxy`, etc.); see `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` in the project if extending it.
- **Tailwind v4** (CSS-first `@theme` config in `src/app/globals.css`, not `tailwind.config.ts`).
- **shadcn/ui** (`radix-nova` style, Radix primitives, `components/ui/*`) for the atomic kit.
- **Axios + TanStack Query** exclusively for data fetching (`src/lib/api/client.ts` is the one Axios instance; every domain hook uses `useQuery`/`useMutation` against it).
- **react-hook-form + zod** for every form.
- **framer-motion** for page transitions (`components/shared/PageTransition.tsx`, used once in `DashboardShell`).
- **Lucide React** — the only icon source in the app.
- **@noble/curves** for client-side Ed25519/X25519 key generation and signing, **@noble/hashes** for BLAKE3, **@noble/ciphers** for XChaCha20-Poly1305, **hash-wasm** for Argon2id (WASM) — all under `src/lib/crypto/`, kept deliberately separate from every UI component. The patient module is what actually exercises the last three; hospital registration only ever needed keygen.

## 3. Architecture

Domain-driven, package-by-feature:

```
src/app/<role>/
  login/                    - public
    hooks/use<Role>Login.ts
    page.tsx
  register/                 - hospital-admin and patient only, public
  (protected)/               - route group; layout.tsx here applies
    layout.tsx               RequireRole + DashboardShell
    dashboard/
    <feature>/
      types.ts
      hooks/use<Feature>.ts   - consolidated query+mutation hook
      components/             - feature-local, e.g. a dialog
      page.tsx
```

`src/components/{ui,layout,shared}` and `src/lib/{api,auth,crypto}` hold
only what's genuinely used by 2+ features (e.g. `AuditTable` is shared by
platform-admin's and hospital-admin's audit pages, which hit different
endpoints but render identically). `src/lib/vc-types.ts` is the one
cross-cutting piece added for the patient work: a fixed catalog of five
credential types (Malaria Test Result, Typhoid Test Result, Hypertension
Diagnosis, Diabetes Diagnosis, Vaccination Record), each with its own
human-readable field schema. It's shared by staff's consent-request
dialog (scope selection), staff's credential-issuance form (type
selection + generated fields), and the patient's record viewer (field
labels for decrypted content) — the same fixed strings flow through all
three, which is what makes a consent scope and an issued credential type
actually line up instead of drifting apart as free text.

**`src/app/patient/layout.tsx`** is worth calling out specifically: it
wraps *all* of `/patient/**` (register, login, and the protected area)
and exists solely to host `PatientKeyProvider` (`src/app/patient/lib/
PatientKeyContext.tsx`) — an in-memory-only React context holding the
patient's decrypted private keys for the current tab. It has to live
above register/login, not inside `(protected)/`, because the keys are
produced *during* registration/login and need to survive the client-side
navigation into the dashboard afterward.

**Why a route group (`(protected)`) matters here**: the first pass put
`layout.tsx` directly under `app/platform-admin/`, which meant it also
wrapped `/platform-admin/login` — the auth guard redirected the login page
to itself before it could ever render. Moving the protected pages into
`(protected)/` (URL-invisible) fixed it. If a new role or section is added,
follow the same pattern: login/register stay as siblings, everything behind
`RequireRole` goes in `(protected)/`.

**Auth model**: the session (access token, refresh token, actor type,
subject, hospital DID) lives in `localStorage`, not a cookie — there's no
Next.js middleware/proxy-based route protection, since there's nothing
server-side to read. `RequireRole` (`src/lib/auth/RequireRole.tsx`) is a
client-side guard that redirects to the right login page if the session's
actor type doesn't match. The backend is the only real authorization
boundary; this guard is UX, not security.

**Sessions are namespaced per portal area**, not one global key —
`src/lib/auth/session.ts` stores each session under `nehr.session.<area>`
(`platform-admin` / `hospital-admin` / `staff` / `patient`), keyed off the
current URL path. This was a real bug, not a hypothetical one: with a
single `nehr.session` key, logging in as a patient in one browser tab
silently clobbered a staff session open in another tab of the same
browser, because `localStorage` is shared across tabs on the same origin.
Fixed so a staff tab and a patient tab can be open side by side and stay
logged in as different actors — which is exactly the setup §6 walks
through.

## 4. Design system

- **Brand colors**: copied verbatim from `switch-cloud-frontend`'s
  `tailwind.config.ts` (`theme.extend.colors.brand`) into a `@theme` block
  in `globals.css`, as `--color-brand-*` tokens. Every shadcn semantic
  token (`--primary`, `--border`, etc.) is mapped to a brand value, not
  Tailwind's defaults — there should be no non-brand color anywhere in the
  app. If one shows up, it's a bug against the brief, not a style choice.
- **Font**: Averta (self-hosted `.otf` files in `public/fonts/`, loaded via
  `next/font/local` in `layout.tsx` as `--font-sans`) — the app's default
  font, not a secondary accent like in the reference project.
- **Radius**: `--radius: 0.25rem` (4px) globally, and `Button` pins its
  corners to a literal `rounded-[4px]` rather than the radius scale, per
  the brief's "uniform 4px" rule.
- **Loading states**: `Button`'s `loading` prop shows a spinner and
  disables the button; `LoadingState`/`EmptyState`/`Skeleton` cover
  everything else. One pattern, reused everywhere — check
  `components/shared/` before adding a new one.
- **Tables**: `components/shared/DataTable.tsx` — client-side text search
  + select-box filters, no server-side pagination/filtering anywhere.
- **No raw JSON in any staff-facing form.** Credential issuance used to
  have a "paste FHIR-shaped JSON" textarea; it's now a credential-type
  dropdown (`VC_TYPES`) that renders the right plain-language fields for
  that type (a select for test method/result, a number field for a dose,
  etc.) and builds the JSON underneath. A hospital staff member issuing a
  malaria result never sees or writes JSON.

## 5. Running it

```bash
# Backend - must be running first (MySQL + Redis must already be up)
cd nehr-backend && mvn spring-boot:run

# Web portal - run this yourself; it's not started from this session
cd nehr-web-portal
npm install
npm run dev   # http://localhost:3000
```

`.env.local` sets `NEXT_PUBLIC_API_URL` (defaults to
`http://localhost:8080/api/v1`). CORS is handled backend-side via
`nehr.cors.allowed-origins` (default `http://localhost:3000`).

**Pre-seeded platform admin** (from the backend's `nehr.platform-admin.*`
config, `application.yml` defaults): `admin@nehr.local` / `ChangeMe123!`.

**Visualizing the MySQL database directly**: install a GUI client (e.g.
`brew install --cask tableplus`) and connect to `localhost:3306`,
database `nehr`, user `nehr`, password `nehr_local_dev` (from
`nehr-backend/src/main/resources/application-local.yml`).

## 6. Verified end-to-end flow (two tabs)

Because sessions are now namespaced per portal area (§3), this whole
sequence can be driven with a **staff tab and a patient tab open at the
same time in one browser**, switching between them at the consent-accept
and credential-view steps rather than logging in and out repeatedly.

1. **`/hospital-admin/register`** — fill hospital name/email/password.
   Ed25519 + X25519 keys are generated in-browser; the success screen
   shows the new hospital's DID and status `PENDING`.
2. **`/platform-admin/login`** — seeded credentials (§5). Dashboard shows
   live counts.
3. **`/platform-admin/hospitals`** — the new hospital appears `PENDING`;
   click **Approve**. Status flips to `APPROVED` immediately (query
   invalidation, no manual refresh).
4. **`/hospital-admin/login`** — log in with the hospital's own
   credentials. Now allowed, since it's approved.
5. **`/hospital-admin/staff`** → **Add staff** — fill the doctor's
   details, the hospital admin's own password (re-authorizes the DEK
   unwrap), and a default password for the doctor. On success, a
   **Staff added** panel shows the doctor's email + default password
   with a copy button — the backend never echoes a plaintext password
   back, so this panel is the only place it's visible.
6. **Tab A, `/staff/login`** — log in as the new doctor.
7. **Tab B, `/patient/register`** — pick either tab: "This device"
   (self-custody — one click, keys generated and kept in this browser
   only) or "Email & password" (managed-custody — keys are still
   generated client-side but encrypted with an Argon2id-derived key
   before being sent). Either way, you land signed in on the patient
   dashboard; copy the patient's DID from `/patient/lookup` or the
   browser's network tab if you need it for the next step.
8. **Tab A, `/staff/consents`** → **Request consent** — the patient's
   DID, a multi-select of credential types (the same five as step 10),
   purpose, validity window.
9. **Tab B, `/patient/consents`** — the request appears `PENDING`; click
   **Accept**. This signs the request's `signingPayload` with the
   patient's own Ed25519 key, in the browser, and posts it — no server
   ever sees the private key.
10. **Tab A, `/staff/credentials`** — the patient's DID, a credential
    type (dropdown), the type's own plain-language fields (e.g. test
    method + result for a malaria test), and the doctor's password. On
    success it appears in "Issued by your hospital," with a **Revoke**
    button.
11. **Tab B, `/patient/records`** — the new record appears; click
    **View**. This resolves the issuing hospital's DID Document, derives
    the shared decryption key via X25519 + BLAKE3, decrypts with
    XChaCha20-Poly1305, and renders the same plain-language fields the
    staff member filled in — not raw JSON.
12. **Tab A, revoke it** — back on `/staff/credentials`, click **Revoke**
    on that record. **Tab B**, refresh `/patient/records` — it now shows
    a `REVOKED` badge.
13. **`/did-lookup`** (or the in-app lookup page for any role) — resolve
    any DID from the flow above and see its full DID Document, status,
    and timestamps.

Every step above produces a real row in the backend's audit trail, visible
at `/platform-admin/audit` (everything) and `/hospital-admin/audit`
(scoped to that hospital + its doctors).

## 7. Deliberately not built (and why)

- **No tests.** Explicit instruction for this phase — speed over
  coverage. `tsc --noEmit` and `eslint` are both clean as of handoff.
- **Self-custody patient keys live in `localStorage`** (`src/app/patient/
  lib/selfCustodyIdentity.ts`), single-slot, one identity per browser.
  A real device has secure hardware-backed storage for this; a browser
  doesn't, so this is a deliberate, documented demo-only stand-in to make
  repeat testing in the same browser possible — not how the mobile app
  should do it (see §8).
- **Managed-custody decrypted keys are memory-only**, never persisted —
  a page refresh loses them and requires signing in again, same tradeoff
  the doctor-password-per-issuance pattern already uses elsewhere in this
  app. Deliberate: caching plaintext key material anywhere durable would
  undermine the entire point of managed custody.
- **`POST /credentials/verify` doesn't check revocation status.** It
  verifies a caller-supplied credential JSON directly, and the VC shape
  itself carries no `recordId` to check against `revoked_credentials`
  with — see `nehr-backend/TECH_DEBT.md`.

## 8. Mobile (React Native) handoff — what to replicate

Unlike the previous version of this document, the patient flows below
are **not** a throwaway script's best guess — they're a working browser
implementation, proven end to end in §6, under `src/app/patient/**` and
`src/lib/crypto/{keys,patientVault,recordCipher,encoding}.ts`. Treat that
code as the reference implementation and port its *logic*, not its UI:

1. **Self-custody registration & login**: `src/lib/crypto/keys.ts`
   (`generatePatientKeyMaterial`, `signEd25519`) and `src/app/patient/lib/
   selfCustodyLogin.ts` (`performSelfCustodyLogin`) are the whole
   challenge-response handshake — `POST /auth/challenge`, base64url-decode
   the nonce, sign with Ed25519, `POST /auth/verify`. Swap
   `selfCustodyIdentity.ts`'s `localStorage` for the device's secure
   storage (Keychain/Keystore) — that's the one part that must *not* be
   copied as-is.
2. **Managed-custody registration & login**: `src/lib/crypto/
   patientVault.ts` (`encryptPrivateKey`/`decryptPrivateKey`) is the
   Argon2id (via `hash-wasm`) + XChaCha20-Poly1305 (via `@noble/ciphers`)
   envelope, packed as `salt || nonce || ciphertext` in one base64 blob
   per key. The KDF/AEAD parameters only need to be internally
   consistent (both encrypt and decrypt happen client-side, on either
   platform) — they don't need to match the backend's own Argon2id
   parameters, which are for a different purpose (hospital key wrapping).
3. **Viewing/decrypting records**: `src/lib/crypto/recordCipher.ts`
   (`decryptRecord`, `extractX25519PublicKeyMultibase`) — resolve the
   issuer's DID Document, X25519-agree the patient's private key with the
   issuer's public key, `BLAKE3-256` the shared secret into a symmetric
   key, XChaCha20-Poly1305-decrypt. `src/app/patient/(protected)/records/
   hooks/useMyRecords.ts` shows the full round trip including the
   `GET /patients/me/records/{id}` → `GET /dids/{issuerDid}` sequencing.
4. **Accepting/revoking consent**: `src/app/patient/(protected)/consents/
   hooks/useMyConsents.ts` — sign `signingPayload` exactly as returned
   (UTF-8 bytes, don't reconstruct it), `POST` to `/accept` or `/revoke`.
5. **Presenting/verifying a credential**: `POST /credentials/verify` is
   public and needs no patient auth — useful for an offline-verification
   fallback screen, but real presentation flow (QR code, etc.) isn't
   specified anywhere yet and needs its own design pass.

The **types** in `src/types/auth.ts`, `src/app/patient/(protected)/
{consents,records}/types.ts`, and `src/lib/vc-types.ts` are a direct
match for the backend's DTOs and the credential catalog — worth mirroring
1:1 in the mobile app rather than re-deriving them from the API docs.

## 9. Known rough edges

- **Double-invoked approve mutation observed once in dev mode**: approving
  one hospital in testing resulted in two separate `HOSPITAL_APPROVED`
  audit entries against two different hospitals within the same second.
  Both approvals were individually valid (correct actor, correct distinct
  target DIDs each time) — this reads like a dev-mode double-fire (React
  19's canary build, which Next 16 uses, is more aggressive about
  double-invoking in development than stable React 18 was) rather than a
  logic bug, but it's only been seen once and wasn't root-caused. Worth
  watching for; not blocking, since the action is idempotent-ish and
  visibly correct either way.
- **`encrypted_records.issuer_did` is `NULL` for anything issued before
  this column existed** (migration `V2` on the backend). Any such record
  can no longer be decrypted by its owner in `/patient/records` — expected
  for stale test data, not a bug in new issuances.
