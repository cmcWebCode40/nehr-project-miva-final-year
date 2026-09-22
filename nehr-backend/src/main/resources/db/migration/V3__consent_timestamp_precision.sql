-- ConsentRecord.canonicalSigningPayload() embeds valid_from/valid_until
-- as epoch milliseconds. A bare MySQL TIMESTAMP truncates to whole
-- seconds on write, so the payload the client signs (built from the
-- in-memory Instant right after creation, still millisecond-precise)
-- could never again be reproduced once ConsentService.accept() re-reads
-- the row from the database - every legitimately signed accept request
-- failed signature verification. TIMESTAMP(3) preserves millisecond
-- precision through the round trip.
ALTER TABLE consent_records
    MODIFY COLUMN valid_from TIMESTAMP(3) NULL,
    MODIFY COLUMN valid_until TIMESTAMP(3) NULL;
