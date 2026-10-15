/**
 * Shannon Entropy Calculator
 * Computes information entropy in bits per byte (0 to 8.0).
 * Maximum theoretical entropy for uniform random byte distribution is 8.0 bits/byte.
 * Natural English text typically exhibits 3.5 to 4.5 bits/byte.
 * Strong cryptographic ciphertext should achieve > 7.9 bits/byte.
 */

export function calculateEntropy(data) {
  let bytes;
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data);
  } else if (data instanceof Uint8Array) {
    bytes = data;
  } else if (Array.isArray(data)) {
    bytes = new Uint8Array(data);
  } else {
    return 0;
  }

  const length = bytes.length;
  if (length === 0) return 0;

  // Frequency table for all 256 possible byte values
  const frequencies = new Array(256).fill(0);
  for (let i = 0; i < length; i++) {
    frequencies[bytes[i]]++;
  }

  // Calculate Shannon entropy: H = -sum(P(x) * log2(P(x)))
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / length;
      entropy -= p * Math.log2(p);
    }
  }

  return Number(entropy.toFixed(3));
}
