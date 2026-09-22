package ng.nehr.backend.account.patient.dto;

import ng.nehr.backend.common.security.dto.TokenPairResponse;

/**
 * Carries the encrypted private-key blobs back alongside the token pair so
 * the app can locally re-derive its Argon2id key and decrypt them - the
 * server never performs that derivation or decryption itself.
 */
public record PatientLoginResponse(
        TokenPairResponse tokens,
        String encryptedPrivateKeyEd,
        String encryptedPrivateKeyX25) {
}
