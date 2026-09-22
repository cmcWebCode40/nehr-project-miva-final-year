-- The patient portal needs to know which hospital issued a given
-- encrypted record in order to resolve that hospital's X25519 public key
-- and perform the ECDH agreement needed to decrypt it client-side - the
-- server itself never needs this for anything today, so it was omitted
-- from V1 and is only surfacing now that a patient-facing client exists.
ALTER TABLE encrypted_records
    ADD COLUMN issuer_did VARCHAR(255) NULL AFTER owner_did,
    ADD CONSTRAINT fk_encrypted_records_issuer FOREIGN KEY (issuer_did) REFERENCES did_registry (did);
