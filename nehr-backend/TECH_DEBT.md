# Technical debt and deliberate deviations

Tracked here so nothing gets rediscovered as a surprise, and so the final
write-up can address each one explicitly rather than silently. Ordered
roughly by how soon each should be revisited.

## Bugs found and fixed (kept here for the record, not deferred)

- **Consent acceptance always failed signature verification.**
  `ConsentRecord.canonicalSigningPayload()` embeds `valid_from`/
  `valid_until` as epoch milliseconds, but those columns were a bare
  MySQL `TIMESTAMP` (whole-second precision). The client signs the
  payload from the response returned immediately after the consent
  request is created (still millisecond-precise, in memory); by the time
  `ConsentService.accept()` re-reads that row from the database, the
  reloaded `Instant`s had been silently rounded down, so the server could
  never reconstruct the exact payload the client signed - every
  legitimately signed accept request was rejected. Caught while
  verifying the patient portal's consent-accept flow end to end against
  the real backend (not assumed from reading the code). Fixed in
  migration `V3` (`valid_from`/`valid_until` → `TIMESTAMP(3)`).

## Deviations from the ch.1-3 design (deliberate, discussed and agreed)

- **MySQL 8 instead of PostgreSQL** (ch.3.4 specifies PostgreSQL with
  JSONB). Chosen for local development convenience - easy to install and
  inspect with a GUI. `did_document`, `scope`, `details`, etc. use MySQL's
  native `JSON` type in place of `JSONB`. Revisit before any real
  deployment, or update the write-up if MySQL becomes the permanent choice.
- **Single Spring Boot modular monolith instead of three separate backend
  services** (ch.3.3.1 describes a DID Registry API, a Health Data Store
  API, and a Revocation Registry as separate services). Built as three
  bounded-context packages (`identity`, `account`/`auth`, and a future
  health-data/revocation module) inside one deployable, to avoid
  inter-service auth and network complexity for a prototype. Functionally
  equivalent; the module boundaries are real and could be extracted into
  separate services later if needed.
- **Public key duplication removed.** ch.3.5.2's `patient_accounts` and
  `hospital_accounts` tables list `public_key_ed`/`public_key_x25` columns
  in addition to `did_registry`. Implemented so public keys live only in
  `did_registry`; account tables hold just the encrypted private-key
  material. Avoids two sources of truth for the same public key.
- **`doctor_accounts` schema extended** beyond ch.3.5.2: added `full_name`
  (needed to identify a doctor anywhere - the original schema had no name
  field at all) and `encrypted_priv_ed`/`encrypted_priv_x25` (doctors get
  their own personal keypair and DID, not just password/JWT credentials -
  agreed in conversation but not in the original write-up).
- **New table `hospital_key_grants`**, not in ch.3.5.2. Implements the
  envelope-encryption scheme agreed in conversation: a hospital's DEK
  (which encrypts its actual Ed25519/X25519 signing keys) is wrapped
  separately for the admin and for each doctor, using a key derived from
  that person's own password. This is what makes ch.3.6.3's "staff log in
  with email and password; the server derives the key needed to decrypt
  the hospital's private signing key" literally true for more than one
  person, without needing anyone's password cached server-side between
  requests - a doctor re-supplies their password at the point of use
  (adding another doctor, issuing a credential) and it unwraps the DEK
  just long enough to complete that one action.
- **VC proof signs a deterministic digest of core scalar fields**
  (`issuer|subject|resourceType|issuanceDate|contentHash`), not a full
  W3C JSON-LD canonicalization (URDNA2015 dataset normalization). Same
  tamper-evidence guarantee (any change to those fields, including
  content since it's hashed in, invalidates the signature); much simpler
  to implement and defend than RDF dataset normalization for a prototype.
- **Record content is a lightweight FHIR R4-*shaped* JSON object**, not
  validated against the actual FHIR R4 StructureDefinitions - no HAPI
  FHIR dependency pulled in yet. The hospital submits whatever JSON shape
  it wants under `content`; the platform doesn't check it conforms to
  Observation/Condition/MedicationRequest/etc. Add HAPI FHIR validation
  as a fast-follow if defensibility on FHIR conformance matters.
- **Record encryption reuses the hospital's long-term X25519 key** for
  the ECDH agreement with the patient's public key (no per-message
  ephemeral keypair). Simpler, no extra storage needed, but loses forward
  secrecy - if the hospital's X25519 private key is ever compromised, all
  past records encrypted under it are retroactively readable. A sealed-
  box-style ephemeral-key scheme would fix this if it becomes a concern.
- **Consent is granted to the hospital, not to an individual doctor**
  (`consent_records.grantee_did` = hospital DID; `requested_by` = the
  doctor who initiated the request). Matches "the hospital sees only
  what's shared" language in ch.3.3.4 and means one consent grant covers
  any doctor at that hospital issuing/reading in-scope resource types,
  not just the one who requested it.

## Explicitly deferred (not implemented this phase)

- **No password recovery.** Neither patient managed-custody ("forgot
  password" would need a secondary recovery mechanism since the private
  key is encrypted specifically so only the correct password can decrypt
  it - a plain email reset can't work) nor hospital admin (losing the
  admin password strands their `hospital_key_grants` entry; needs a
  policy for another grant-holder to re-wrap one for a reset admin).
  Flagged in conversation as a real design gap, not just an oversight.
- **No forced change-password-on-first-login for doctors.** The hospital
  admin sets a default password and the doctor can use it indefinitely.
  Revisit alongside the recovery-flow work above.
- **Audit trail covers success events only, not failures.** `AuditService`
  writes hash-chained entries (BLAKE3 over each prior entry's own
  canonical fields, per ch.3.5.2/3.5.3) for: login success (all four actor
  types), hospital registration/approval, doctor added, consent
  requested/granted/revoked, and credential issuance. It does **not** log
  failed login attempts, DID resolutions, or key-unwrap attempts -
  deliberately kept to "what changed," not every read/attempt, to stay
  basic. `GET /api/v1/platform-admin/audit-trail` (all entries) and
  `GET /api/v1/hospitals/me/audit-trail` (scoped to that hospital's admin
  + its doctors, by matching actor/target DID against that set - not a
  JSON query against `details`, so it won't surface an event where the
  hospital only appears inside `details` and not as actor/target) exist
  for platform admin and hospital admin respectively. No UI, no
  chain-integrity verification endpoint (recomputing every hash to prove
  the log hasn't been tampered with) yet - just the write path and a
  plain list.
- **Doctor `token_version`/status is only re-checked at login and token
  refresh**, not on every request via a dedicated filter/interceptor -
  including the now-live credential issuance and consent-request
  endpoints. Worst-case staleness after a suspension is one access-token
  TTL (30 minutes by default). ch.3.6.3 implies per-request enforcement
  ("Requests are rejected if the doctor's status is suspended or
  removed") - this is now a real gap, not a hypothetical one, since
  doctor-authenticated endpoints exist. Worth prioritizing soon.
- **DID deactivation doesn't cascade.** Suspending a hospital does not
  currently deactivate its doctors' DIDs. No rule has been agreed for
  whether it should.
- **No DID Document update endpoint.** Only create (via registration),
  read (`GET /api/v1/dids/{did}`), and deactivate exist. Key rotation and
  service-endpoint changes aren't supported yet.
- **Credential revocation is now wired up** (`RevokedCredential` entity/
  repository, `POST /api/v1/doctors/me/credentials/{recordId}/revoke`,
  `GET /api/v1/doctors/me/credentials` to list what a hospital has
  issued) - only the issuing hospital may revoke its own credential.
  The public `POST /api/v1/credentials/verify` endpoint does **not**
  check revocation status, though: it verifies a caller-supplied
  credential JSON payload directly, which carries no `recordId`/`vcId` -
  the VC shape has no identifier field of its own (see
  `VerifiableCredentialCodec`). Checking revocation there would need one
  added to the VC's own signed content, which changes the proof's digest
  input - worth doing, not done here.
- **`encrypted_records.issuer_did`** was added in `V2` (nullable, no
  backfill) so a patient's client can resolve which hospital's X25519 key
  to use for decrypting a given record - `V1` shipped without it because
  nothing needed to read it back until a patient-facing client existed.
  Any record issued before `V2` has `issuer_did = NULL` and can no longer
  be decrypted by its owner; there was no real data at that point to
  migrate.
- **Consent has no expiry sweep.** `ConsentRecord.isActiveFor()` checks
  `validUntil` against "now" at the moment of use, but a consent past its
  `validUntil` is never transitioned to `EXPIRED` in the database - it
  just silently stops being usable. Fine functionally, but the `EXPIRED`
  status value in the schema is never actually written.
- **Rate limiting is a bare fixed-window counter** (ch.3.4's "rate-limit
  counters" requirement) on `/auth/challenge` and `/auth/verify` only, not
  a general API-wide policy.
