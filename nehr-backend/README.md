# nehr-backend

Backend for the NEHR Platform: identity (DID Registry), auth, consent,
Verifiable Credential issuance, and audit logging. See
[`docs/BACKEND_DOCUMENTATION.md`](docs/BACKEND_DOCUMENTATION.md) for the
full architecture/crypto/deployment writeup, `CLAUDE.md` for coding
rules, and `TECH_DEBT.md` for what's deliberately deferred.

## Prerequisites

- Java 21 (Amazon Corretto or any JDK 21 distribution)
- Maven 3.9+
- MySQL 8 running locally
- Redis running locally

## Local database setup

```bash
mysql -u root -e "
CREATE DATABASE IF NOT EXISTS nehr CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS 'nehr'@'localhost' IDENTIFIED BY 'nehr_local_dev';
GRANT ALL PRIVILEGES ON nehr.* TO 'nehr'@'localhost';
FLUSH PRIVILEGES;
"
```

(Skip this if you set `DB_USERNAME`/`DB_PASSWORD` env vars to point at your
own MySQL user instead - see `application-local.yml` for every overridable
env var: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`,
`REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `PLATFORM_ADMIN_EMAIL`,
`PLATFORM_ADMIN_DEFAULT_PASSWORD`.)

## Run

```bash
mvn spring-boot:run
```

Flyway applies the schema on startup, and one platform admin account is
seeded from `nehr.platform-admin.*` config (defaults: `admin@nehr.local` /
`ChangeMe123!` — change `PLATFORM_ADMIN_DEFAULT_PASSWORD` before this ever
runs anywhere but a laptop).

- Swagger UI: http://localhost:8080/swagger-ui.html (grouped into **Auth**,
  **Credentials**, and **DID Registry**)
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## Test

```bash
mvn test
```

Crypto primitives (BLAKE3, XChaCha20-Poly1305, Argon2id, Ed25519/X25519,
base32/base58) are verified against published test vectors, not just
round-trip self-consistency - see `src/test/java/.../common/crypto`.
