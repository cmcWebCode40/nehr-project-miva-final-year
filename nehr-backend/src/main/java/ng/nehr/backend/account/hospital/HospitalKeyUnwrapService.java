package ng.nehr.backend.account.hospital;

import ng.nehr.backend.common.crypto.EnvelopeCipher;
import ng.nehr.backend.common.web.NotFoundException;
import ng.nehr.backend.common.web.UnauthorizedException;
import org.springframework.stereotype.Service;

/**
 * Shared by any flow that needs a hospital's decrypted keys on demand
 * (adding a doctor, issuing a VC): unwrap the shared DEK via the acting
 * principal's own {@link HospitalKeyGrant}, then use the DEK to decrypt
 * whichever of the hospital's actual keys is needed. Keys are only ever
 * held in memory for the duration of the call that needs them.
 */
@Service
public class HospitalKeyUnwrapService {

    private final HospitalKeyGrantRepository keyGrantRepository;
    private final EnvelopeCipher envelopeCipher;

    public HospitalKeyUnwrapService(HospitalKeyGrantRepository keyGrantRepository, EnvelopeCipher envelopeCipher) {
        this.keyGrantRepository = keyGrantRepository;
        this.envelopeCipher = envelopeCipher;
    }

    public byte[] unwrapDek(String hospitalDid, String principalDid, String password) {
        HospitalKeyGrant grant = keyGrantRepository
                .findByHospitalDidAndPrincipalDidAndRevokedAtIsNull(hospitalDid, principalDid)
                .orElseThrow(() -> new NotFoundException(
                        "No active key grant for " + principalDid + " at hospital " + hospitalDid));
        try {
            return envelopeCipher.openWithPassword(password, grant.getWrappedDek());
        } catch (SecurityException e) {
            throw new UnauthorizedException("Invalid password");
        }
    }

    public byte[] unwrapSigningKey(HospitalAccount hospital, byte[] dek) {
        return envelopeCipher.openWithKey(dek, hospital.getEncryptedSignKey());
    }

    public byte[] unwrapEncryptionKey(HospitalAccount hospital, byte[] dek) {
        return envelopeCipher.openWithKey(dek, hospital.getEncryptedEncKey());
    }
}
