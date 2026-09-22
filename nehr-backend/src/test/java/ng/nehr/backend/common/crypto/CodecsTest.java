package ng.nehr.backend.common.crypto;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

class CodecsTest {

    @Test
    void base58EncodesEmptyInput() {
        assertThat(Codecs.base58Encode(new byte[0])).isEmpty();
    }

    @Test
    void base58EncodesSingleLeadingZeroByte() {
        assertThat(Codecs.base58Encode(new byte[]{0})).isEqualTo("1");
    }

    @Test
    void base58EncodesMultipleLeadingZeroBytes() {
        assertThat(Codecs.base58Encode(new byte[]{0, 0, 1})).isEqualTo("112");
    }

    @Test
    void base58EncodesKnownReferenceString() {
        assertThat(Codecs.base58Encode("Hello World".getBytes(StandardCharsets.US_ASCII)))
                .isEqualTo("JxF12TrwUP45BMd");
    }

    @Test
    void base58EncodesThirtyTwoByteSequence() {
        byte[] data = HexFormat.of().parseHex(
                "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
        assertThat(Codecs.base58Encode(data)).isEqualTo("1thX6LZfHDZZKUs92febYZhYRcXddmzfzF2NvTkPNE");
    }

    @Test
    void multibaseEncodePrefixesWithZ() {
        assertThat(Codecs.multibaseEncode(new byte[]{0})).isEqualTo("z1");
    }

    @Test
    void base58DecodeIsInverseOfEncode() {
        byte[] original = new byte[32];
        new java.security.SecureRandom().nextBytes(original);
        assertThat(Codecs.base58Decode(Codecs.base58Encode(original))).isEqualTo(original);
    }

    @Test
    void base58DecodePreservesLeadingZeroBytes() {
        byte[] original = {0, 0, 5, 10, 20};
        assertThat(Codecs.base58Decode(Codecs.base58Encode(original))).isEqualTo(original);
    }

    @Test
    void base58DecodeMatchesKnownReferenceString() {
        assertThat(Codecs.base58Decode("JxF12TrwUP45BMd"))
                .isEqualTo("Hello World".getBytes(StandardCharsets.US_ASCII));
    }

    @Test
    void multibaseRoundTripsThroughEd25519SizedKey() {
        byte[] original = new byte[32];
        new java.security.SecureRandom().nextBytes(original);
        assertThat(Codecs.multibaseDecode(Codecs.multibaseEncode(original))).isEqualTo(original);
    }

    @Test
    void base32EncodeProducesLowercaseUnpaddedOutput() {
        String encoded = Codecs.base32Encode("foobar".getBytes(StandardCharsets.US_ASCII));
        assertThat(encoded).isEqualTo(encoded.toLowerCase());
        assertThat(encoded).doesNotContain("=");
    }

    @Test
    void base32EncodeIsDeterministicAndLengthScalesWithInput() {
        byte[] input = new byte[32];
        new java.security.SecureRandom().nextBytes(input);
        String a = Codecs.base32Encode(input);
        String b = Codecs.base32Encode(input);
        assertThat(a).isEqualTo(b);
        assertThat(a).hasSize((32 * 8 + 4) / 5);
    }
}
