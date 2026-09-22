package ng.nehr.backend.common.crypto;

import java.math.BigInteger;

/**
 * Base32 (RFC 4648, lowercase, unpadded - used for did:nehr identifiers)
 * and base58btc (used for multibase-encoded verification method keys in
 * DID Documents, per the 'z' multibase prefix convention).
 */
public final class Codecs {

    private static final String BASE32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";
    private static final String BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    private static final BigInteger BASE58_RADIX = BigInteger.valueOf(58);

    private Codecs() {
    }

    public static String base32Encode(byte[] data) {
        StringBuilder out = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsInBuffer = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsInBuffer += 8;
            while (bitsInBuffer >= 5) {
                bitsInBuffer -= 5;
                out.append(BASE32_ALPHABET.charAt((buffer >> bitsInBuffer) & 0x1f));
            }
        }
        if (bitsInBuffer > 0) {
            out.append(BASE32_ALPHABET.charAt((buffer << (5 - bitsInBuffer)) & 0x1f));
        }
        return out.toString();
    }

    public static String base58Encode(byte[] data) {
        if (data.length == 0) {
            return "";
        }
        int leadingZeros = 0;
        while (leadingZeros < data.length && data[leadingZeros] == 0) {
            leadingZeros++;
        }
        BigInteger value = new BigInteger(1, data);
        StringBuilder digits = new StringBuilder();
        while (value.signum() > 0) {
            BigInteger[] divRem = value.divideAndRemainder(BASE58_RADIX);
            digits.append(BASE58_ALPHABET.charAt(divRem[1].intValue()));
            value = divRem[0];
        }
        StringBuilder out = new StringBuilder();
        out.append(String.valueOf(BASE58_ALPHABET.charAt(0)).repeat(leadingZeros));
        out.append(digits.reverse());
        return out.toString();
    }

    public static byte[] base58Decode(String encoded) {
        if (encoded.isEmpty()) {
            return new byte[0];
        }
        int leadingOnes = 0;
        while (leadingOnes < encoded.length() && encoded.charAt(leadingOnes) == BASE58_ALPHABET.charAt(0)) {
            leadingOnes++;
        }
        BigInteger value = BigInteger.ZERO;
        for (int i = leadingOnes; i < encoded.length(); i++) {
            int digit = BASE58_ALPHABET.indexOf(encoded.charAt(i));
            if (digit < 0) {
                throw new IllegalArgumentException("Invalid base58 character: " + encoded.charAt(i));
            }
            value = value.multiply(BASE58_RADIX).add(BigInteger.valueOf(digit));
        }
        byte[] valueBytes = value.equals(BigInteger.ZERO) ? new byte[0] : value.toByteArray();
        int signByte = (valueBytes.length > 1 && valueBytes[0] == 0) ? 1 : 0;
        byte[] result = new byte[leadingOnes + (valueBytes.length - signByte)];
        System.arraycopy(valueBytes, signByte, result, leadingOnes, valueBytes.length - signByte);
        return result;
    }

    /** multibase-encodes a raw key as base58btc with the 'z' prefix. */
    public static String multibaseEncode(byte[] rawKey) {
        return "z" + base58Encode(rawKey);
    }

    public static byte[] multibaseDecode(String multibase) {
        if (multibase.isEmpty() || multibase.charAt(0) != 'z') {
            throw new IllegalArgumentException("Only base58btc ('z'-prefixed) multibase is supported");
        }
        return base58Decode(multibase.substring(1));
    }
}
