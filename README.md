# NEHR — Nigerian Electronic Health Record Platform

> **Final-year project (proof of concept).** Built by Chinweike Michael
> Chinonso for the B.Sc. Software Engineering programme at Miva Open
> University, supervised by Prof. Aderonke Atinuke Oni. This is an
> academic prototype demonstrating a decentralized-identity, offline-
> first electronic health record system for Nigerian hospitals — it is
> **not** a production system, has not undergone a security audit, and
> should not be used with real patient data.

## What this is

NEHR explores whether a decentralized identity (DID) architecture can
give patients real, cryptographic ownership of their own health records
— rather than each hospital silently holding a private, disconnected
copy — while still letting hospitals issue, sign, and read records they
have explicit patient consent for. Every record is signed by the
issuing hospital and encrypted specifically for the patient it belongs
to; the platform itself never holds a plaintext copy of anyone's health
data.

Core ideas demonstrated:

- **`did:nehr` method** — a custom W3C DID Core-compliant identity
  scheme, self-derived from an entity's own Ed25519 public key.
- **Verifiable Credentials** — hospital-signed, patient-encrypted health
  records, with client-side decryption via X25519 key agreement.
- **Consent-gated issuance** — a hospital cannot issue or read a record
  type it hasn't been explicitly granted consent for by the patient.
- **Self-custody and managed-custody patients** — patients can hold
  their own signing keys on-device, or opt into a password-protected,
  server-relayed (never server-readable) key custody model.
- **Hash-chained audit trail** — a tamper-evident log of every
  sensitive action across the platform.

## Repository structure

This is a monorepo of independently deployable projects:

| Folder | What it is |
|---|---|
| [`nehr-backend/`](nehr-backend) | Java 21 / Spring Boot 4 modular monolith — Auth, DID Registry, Consent, Credentials, and Audit modules, MySQL 8 + Redis. |
| [`nehr-web-portal/`](nehr-web-portal) | Next.js 16 web app — Platform Admin, Health Admin, Health Staff, Patient, and a public DID Lookup surface. |
| `nehr-health-passport-app/` | Reserved for the React Native mobile patient app (not yet started). |

Each project has its own README, coding rules, and (for the backend) a
`TECH_DEBT.md` documenting every deliberate deviation from the original
project write-up.

## Quick start

```bash
# 1. Backend (needs local MySQL 8 + Redis running)
cd nehr-backend && mvn spring-boot:run

# 2. Web portal
cd nehr-web-portal && npm install && npm run dev
```

Full setup, a pre-seeded platform admin account, a MySQL GUI walkthrough,
and a complete verified end-to-end test flow are documented in
[`nehr-web-portal/docs/HANDOFF.md`](nehr-web-portal/docs/HANDOFF.md).
Backend architecture, the exact cryptographic constructions used, and
the data model are documented in
[`nehr-backend/docs/BACKEND_DOCUMENTATION.md`](nehr-backend/docs/BACKEND_DOCUMENTATION.md).

## Status

Backend and web portal are feature-complete for the scoped end-to-end
flow (hospital registration → platform approval → staff onboarding →
consent request/accept → credential issuance/decryption/revocation) and
have been verified against a live instance, including a full scripted
cryptographic round-trip check. The mobile app has not been started.
Known deviations from the original design (e.g. MySQL instead of
PostgreSQL, a monolith instead of three services) are documented
explicitly in each project's own tech-debt notes rather than left
silent, since addressing them honestly is part of the write-up.

## License

Academic project, submitted in partial fulfilment of the requirements
for a B.Sc. in Software Engineering at Miva Open University. Not
licensed for production or commercial use.
