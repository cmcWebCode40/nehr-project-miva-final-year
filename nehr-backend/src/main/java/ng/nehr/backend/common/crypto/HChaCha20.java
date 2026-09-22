package ng.nehr.backend.common.crypto;

/**
 * HChaCha20 subkey derivation (draft-irtf-cfrg-xchacha), the missing piece
 * Bouncy Castle doesn't ship: it has ChaCha20-Poly1305 (96-bit nonce, RFC
 * 8439) but no XChaCha20 (192-bit nonce) engine. XChaCha20-Poly1305 is
 * built by deriving a subkey here from the first 16 nonce bytes, then
 * running standard ChaCha20-Poly1305 with that subkey and a 12-byte nonce
 * made of the remaining 8 nonce bytes.
 */
final class HChaCha20 {

    private HChaCha20() {
    }

    static byte[] subKey(byte[] key32, byte[] nonce16) {
        int[] state = new int[16];
        state[0] = 0x61707865;
        state[1] = 0x3320646e;
        state[2] = 0x79622d32;
        state[3] = 0x6b206574;
        for (int i = 0; i < 8; i++) {
            state[4 + i] = leToInt(key32, i * 4);
        }
        for (int i = 0; i < 4; i++) {
            state[12 + i] = leToInt(nonce16, i * 4);
        }

        for (int round = 0; round < 10; round++) {
            quarterRound(state, 0, 4, 8, 12);
            quarterRound(state, 1, 5, 9, 13);
            quarterRound(state, 2, 6, 10, 14);
            quarterRound(state, 3, 7, 11, 15);
            quarterRound(state, 0, 5, 10, 15);
            quarterRound(state, 1, 6, 11, 12);
            quarterRound(state, 2, 7, 8, 13);
            quarterRound(state, 3, 4, 9, 14);
        }

        byte[] out = new byte[32];
        intToLe(state[0], out, 0);
        intToLe(state[1], out, 4);
        intToLe(state[2], out, 8);
        intToLe(state[3], out, 12);
        intToLe(state[12], out, 16);
        intToLe(state[13], out, 20);
        intToLe(state[14], out, 24);
        intToLe(state[15], out, 28);
        return out;
    }

    private static void quarterRound(int[] x, int a, int b, int c, int d) {
        x[a] += x[b];
        x[d] = Integer.rotateLeft(x[d] ^ x[a], 16);
        x[c] += x[d];
        x[b] = Integer.rotateLeft(x[b] ^ x[c], 12);
        x[a] += x[b];
        x[d] = Integer.rotateLeft(x[d] ^ x[a], 8);
        x[c] += x[d];
        x[b] = Integer.rotateLeft(x[b] ^ x[c], 7);
    }

    private static int leToInt(byte[] b, int off) {
        return (b[off] & 0xff)
                | ((b[off + 1] & 0xff) << 8)
                | ((b[off + 2] & 0xff) << 16)
                | ((b[off + 3] & 0xff) << 24);
    }

    private static void intToLe(int v, byte[] out, int off) {
        out[off] = (byte) v;
        out[off + 1] = (byte) (v >>> 8);
        out[off + 2] = (byte) (v >>> 16);
        out[off + 3] = (byte) (v >>> 24);
    }
}
