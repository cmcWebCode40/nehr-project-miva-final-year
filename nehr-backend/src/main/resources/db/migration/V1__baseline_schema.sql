-- Baseline schema for the NEHR Platform Auth + DID Registry module.
-- Tables encrypted_records, consent_records, revoked_credentials, audit_trail
-- are created here for full ch.3.5 schema parity but are not yet written to
-- by any service in this phase (see TECH_DEBT.md).

CREATE TABLE did_registry (
    did             VARCHAR(255) NOT NULL,
    entity_type     ENUM('PATIENT', 'HOSPITAL', 'PROVIDER') NOT NULL,
    did_document    JSON NOT NULL,
    public_key_ed   VARCHAR(255) NOT NULL,
    public_key_x25  VARCHAR(255) NOT NULL,
    status          ENUM('ACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (did)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE patient_accounts (
    did                 VARCHAR(255) NOT NULL,
    custody_type        ENUM('SELF', 'MANAGED') NOT NULL,
    email               VARCHAR(255) NULL,
    password_hash       VARCHAR(255) NULL,
    encrypted_priv_ed   VARBINARY(1024) NULL,
    encrypted_priv_x25  VARBINARY(1024) NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (did),
    UNIQUE KEY uk_patient_accounts_email (email),
    CONSTRAINT fk_patient_accounts_did FOREIGN KEY (did) REFERENCES did_registry (did)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE hospital_accounts (
    hospital_did          VARCHAR(255) NOT NULL,
    hospital_name         VARCHAR(255) NOT NULL,
    email                  VARCHAR(255) NOT NULL,
    password_hash          VARCHAR(255) NOT NULL,
    encrypted_sign_key     VARBINARY(1024) NOT NULL,
    encrypted_enc_key      VARBINARY(1024) NOT NULL,
    status                 ENUM('PENDING', 'APPROVED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    approved_at            TIMESTAMP NULL,
    approved_by            VARCHAR(255) NULL,
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (hospital_did),
    UNIQUE KEY uk_hospital_accounts_email (email),
    CONSTRAINT fk_hospital_accounts_did FOREIGN KEY (hospital_did) REFERENCES did_registry (did)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE hospital_key_grants (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    hospital_did    VARCHAR(255) NOT NULL,
    principal_did   VARCHAR(255) NOT NULL,
    wrapped_dek     VARBINARY(512) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at      TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY idx_hospital_key_grants_lookup (hospital_did, principal_did, revoked_at),
    CONSTRAINT fk_key_grants_hospital FOREIGN KEY (hospital_did) REFERENCES hospital_accounts (hospital_did),
    CONSTRAINT fk_key_grants_principal FOREIGN KEY (principal_did) REFERENCES did_registry (did)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE doctor_accounts (
    doctor_did          VARCHAR(255) NOT NULL,
    hospital_did        VARCHAR(255) NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(100) NOT NULL,
    department          VARCHAR(100) NULL,
    licence_number      VARCHAR(100) NULL,
    status              ENUM('ACTIVE', 'SUSPENDED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
    token_version       INT NOT NULL DEFAULT 0,
    encrypted_priv_ed   VARBINARY(1024) NOT NULL,
    encrypted_priv_x25  VARBINARY(1024) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (doctor_did),
    UNIQUE KEY uk_doctor_accounts_email (email),
    CONSTRAINT fk_doctor_accounts_did FOREIGN KEY (doctor_did) REFERENCES did_registry (did),
    CONSTRAINT fk_doctor_accounts_hospital FOREIGN KEY (hospital_did) REFERENCES hospital_accounts (hospital_did)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE platform_admins (
    id             BIGINT NOT NULL AUTO_INCREMENT,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    name           VARCHAR(255) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_platform_admins_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE encrypted_records (
    record_id       VARCHAR(64) NOT NULL,
    owner_did       VARCHAR(255) NOT NULL,
    record_type     ENUM('VC', 'CONSENT_LOG', 'HOSPITAL_VISIT', 'AUDIT_ENTRY') NOT NULL,
    encrypted_blob  LONGBLOB NOT NULL,
    encrypted_key   VARBINARY(1024) NULL,
    nonce           VARBINARY(64) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (record_id),
    KEY idx_encrypted_records_owner (owner_did),
    CONSTRAINT fk_encrypted_records_owner FOREIGN KEY (owner_did) REFERENCES did_registry (did)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE consent_records (
    consent_id         VARCHAR(64) NOT NULL,
    grantor_did        VARCHAR(255) NOT NULL,
    grantee_did        VARCHAR(255) NOT NULL,
    requested_by       VARCHAR(255) NULL,
    scope              JSON NOT NULL,
    purpose            VARCHAR(255) NULL,
    valid_from         TIMESTAMP NULL,
    valid_until        TIMESTAMP NULL,
    status             ENUM('PENDING', 'GRANTED', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    granted_at         TIMESTAMP NULL,
    patient_signature  TEXT NULL,
    PRIMARY KEY (consent_id),
    KEY idx_consent_records_grantor (grantor_did),
    KEY idx_consent_records_grantee (grantee_did),
    CONSTRAINT fk_consent_records_grantor FOREIGN KEY (grantor_did) REFERENCES did_registry (did),
    CONSTRAINT fk_consent_records_grantee FOREIGN KEY (grantee_did) REFERENCES did_registry (did)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE revoked_credentials (
    vc_id        VARCHAR(255) NOT NULL,
    revoked_by   VARCHAR(255) NOT NULL,
    revoked_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason       VARCHAR(255) NULL,
    PRIMARY KEY (vc_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE audit_trail (
    entry_id        BIGINT NOT NULL AUTO_INCREMENT,
    actor_did       VARCHAR(255) NULL,
    action          VARCHAR(100) NOT NULL,
    target_did      VARCHAR(255) NULL,
    target_type     VARCHAR(100) NULL,
    details         JSON NULL,
    occurred_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    previous_hash   VARCHAR(255) NULL,
    PRIMARY KEY (entry_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
