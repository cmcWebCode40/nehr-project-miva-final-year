# nehr-backend

Backend for the NEHR Platform final-year project: a decentralized-identity,
offline-first EHR system for Nigerian hospitals. This module covers Auth +
DID Registry. See `TECH_DEBT.md` for what is deliberately deferred.

## Stack

Java 21, Spring Boot 4.1.1 (Spring Framework 7 / Spring Security 7),
Maven, MySQL 8, Redis, Flyway, Bouncy Castle (Ed25519/X25519/BLAKE3/
Argon2id, plus a hand-written HChaCha20 feeding BC's ChaCha20Poly1305 to
build XChaCha20-Poly1305 - BC has no native XChaCha20), jjwt, springdoc-
openapi. No Lombok - plain constructors/getters on entities, records for
DTOs and value types.

## Rules

- **Constructor injection only.** No field `@Autowired`, no setter injection.
- **Package-by-feature, not by-layer.** A module (`identity`, `account.patient`,
  `auth`, ...) owns its entity, repository, service, controller, and `dto/`
  subpackage together. `common/*` holds only what is genuinely shared across
  every module (crypto, security, web/exception handling, config) - if a
  class is used by exactly one module, it lives in that module.
- **DRY across account modules.** Patient/hospital/doctor/platform-admin
  account services look similar (register, login, issue tokens) - reuse
  through `common/security` and `common/crypto`, don't fork logic per actor
  type. If you're about to copy-paste a service method across two account
  packages, that logic belongs in a shared helper instead.
- **No comments explaining what code does.** Names should already do that.
  A comment is only for a non-obvious *why* - a spec citation, a constraint
  from the project write-up, a deliberate deviation from it. If you'd delete
  the comment and nothing would be lost, don't write it.
- **Schema changes only via Flyway.** Never `ddl-auto: update` or `create`.
  New migration file, numbered next in sequence, reviewed like any other
  change - the schema is part of the system design, not an implementation
  detail.
- **Every exception is an `HttpStatus`-bearing `NehrApiException` subclass**
  (or one of the generic ones in `common/web`: `ConflictException`,
  `UnauthorizedException`, `ForbiddenException`, `NotFoundException`).
  Don't let a raw `RuntimeException` reach `GlobalExceptionHandler`'s
  catch-all if a specific status is knowable at the call site.
- **Crypto correctness is verified by test vectors, not by "it compiled."**
  Any new primitive (a different curve, a different AEAD, a different KDF)
  needs a test against a published test vector before it's trusted, the
  same way BLAKE3, XChaCha20-Poly1305, and base58 were verified here.
- **Secrets and key material never get logged.** Not even at DEBUG. If a
  method touches a private key, password, or DEK, check what a stack trace
  through it would print.
- **Fail fast on missing config.** `JwtService` throwing when
  `nehr.jwt.secret` is blank is the pattern - don't add silent fallbacks for
  configuration that's required for the app to be secure.
- **Don't build ahead of the current module.** `encrypted_records`,
  `consent_records`, `revoked_credentials`, and `audit_trail` exist in the
  schema for full ch.3.5 parity but have no service/repository yet - that's
  the next module's job, not something to half-wire now.

## General coding rules (not NEHR-specific)

- A bug fix doesn't need a refactor riding along with it. A one-shot script
  doesn't need a reusable abstraction. Three similar lines beat one
  premature abstraction built for a fourth case that hasn't shown up yet.
- Validate at boundaries (an HTTP request body, a value read from config),
  trust internal call paths. Don't re-validate what the type system or a
  prior layer already guarantees.
- When a library's exact API is uncertain, check it (source, docs, a
  compile) before writing five call sites against a guess.
- Delete code that's unused rather than commenting it out or prefixing it
  with `_`. Git history is the record of what used to be there.
