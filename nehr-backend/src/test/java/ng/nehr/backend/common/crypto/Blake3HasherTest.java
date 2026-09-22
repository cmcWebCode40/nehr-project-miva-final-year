package ng.nehr.backend.common.crypto;

import org.junit.jupiter.api.Test;

import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies Bouncy Castle's Blake3Digest against the official BLAKE3 test
 * vectors (github.com/BLAKE3-team/BLAKE3/test_vectors), whose inputs are a
 * repeating 0..250 byte sequence of the given length.
 */
class Blake3HasherTest {

    private static final HexFormat HEX = HexFormat.of();
    private static final Blake3Hasher HASHER = new Blake3Hasher();

    private static byte[] patternInput(int length) {
        byte[] input = new byte[length];
        for (int i = 0; i < length; i++) {
            input[i] = (byte) (i % 251);
        }
        return input;
    }

    @Test
    void hashesEmptyInput() {
        assertThat(HEX.formatHex(HASHER.hash256(patternInput(0))))
                .isEqualTo("af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262".substring(0, 64));
    }

    @Test
    void hashesOneByteInput() {
        assertThat(HEX.formatHex(HASHER.hash256(patternInput(1))))
                .isEqualTo("2d3adedff11b61f14c886e35afa036736dcd87a74d27b5c1510225d0f592e213".substring(0, 64));
    }

    @Test
    void hashesSixtyFourByteInput() {
        assertThat(HEX.formatHex(HASHER.hash256(patternInput(64))))
                .isEqualTo("4eed7141ea4a5cd4b788606bd23f46e212af9cacebacdc7d1f4c6dc7f2511b98".substring(0, 64));
    }

    @Test
    void isDeterministic() {
        byte[] input = "did:nehr deterministic check".getBytes();
        assertThat(HASHER.hash256(input)).isEqualTo(HASHER.hash256(input));
    }
}
