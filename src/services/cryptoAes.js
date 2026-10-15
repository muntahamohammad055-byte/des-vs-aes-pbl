/**
 * AES-GCM Cryptographic Service
 * Implements AES-GCM using the native browser Web Crypto API (SubtleCrypto).
 * Standards: NIST SP 800-38D, FIPS 197
 * Features:
 *  - Supported key lengths: 128, 192, and 256 bits
 *  - Cryptographically secure 96-bit (12-byte) random nonce generated via crypto.getRandomValues()
 *  - 128-bit (16-byte) Galois authentication tag
 *  - Proper Unicode handling via TextEncoder and TextDecoder
 *  - Strict rejection of incorrect keys, modified ciphertexts, or tampered auth tags
 */

// Helper: Convert Uint8Array to Hex string
export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert Hex string to Uint8Array
export function hexToBytes(hex) {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters.');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Helper: Convert Uint8Array to Base64 string
export function bytesToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 string to Uint8Array
export function base64ToBytes(base64) {
  const binary = window.atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate a cryptographically secure random AES key
 * @param {number} keyLengthBits - 128, 192, or 256
 * @returns {Promise<{ key: CryptoKey, rawBytes: Uint8Array, hex: string, base64: string }>}
 */
export async function generateAesKey(keyLengthBits = 256) {
  if (![128, 192, 256].includes(keyLengthBits)) {
    throw new Error(`Invalid AES key length: ${keyLengthBits}. Allowed: 128, 192, 256.`);
  }

  const rawBytes = new Uint8Array(keyLengthBits / 8);
  window.crypto.getRandomValues(rawBytes);

  const key = await window.crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'AES-GCM', length: keyLengthBits },
    true,
    ['encrypt', 'decrypt']
  );

  return {
    key,
    rawBytes,
    hex: bytesToHex(rawBytes),
    base64: bytesToBase64(rawBytes),
    bitLength: keyLengthBits
  };
}

/**
 * Import an AES key from raw bytes, hex, or base64
 * @param {Uint8Array|string} keyInput
 * @param {number} keyLengthBits
 * @returns {Promise<CryptoKey>}
 */
export async function importAesKey(keyInput, keyLengthBits = 256) {
  let rawBytes;
  if (keyInput instanceof Uint8Array) {
    rawBytes = keyInput;
  } else if (typeof keyInput === 'string') {
    const trimmed = keyInput.trim();
    // Check if hex
    if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length === keyLengthBits / 4) {
      rawBytes = hexToBytes(trimmed);
    } else {
      // Try Base64
      try {
        const decoded = base64ToBytes(trimmed);
        if (decoded.length === keyLengthBits / 8) {
          rawBytes = decoded;
        } else {
          throw new Error('Key length mismatch');
        }
      } catch {
        // Fallback: derive 128/192/256 bits by SHA-256 hash or UTF-8 byte slice
        const encoded = new TextEncoder().encode(trimmed);
        const hash = await window.crypto.subtle.digest('SHA-256', encoded);
        rawBytes = new Uint8Array(hash).slice(0, keyLengthBits / 8);
      }
    }
  }

  if (rawBytes.length !== keyLengthBits / 8) {
    throw new Error(`AES key must be exactly ${keyLengthBits / 8} bytes (${keyLengthBits} bits). Received: ${rawBytes.length} bytes.`);
  }

  return await window.crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'AES-GCM', length: keyLengthBits },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext using AES-GCM
 * @param {string|Uint8Array} plaintextInput - text string or raw bytes
 * @param {CryptoKey} cryptoKey - AES CryptoKey
 * @param {Uint8Array} [customIv] - Optional 12-byte IV for testing/demonstration
 * @returns {Promise<Object>}
 */
export async function encryptAesGcm(plaintextInput, cryptoKey, customIv = null) {
  const plaintextBytes = typeof plaintextInput === 'string'
    ? new TextEncoder().encode(plaintextInput)
    : plaintextInput;

  // Generate fresh cryptographically secure 96-bit (12 bytes) IV (NIST SP 800-38D recommendation)
  const iv = customIv || new Uint8Array(12);
  if (!customIv) {
    window.crypto.getRandomValues(iv);
  }

  const startTime = performance.now();

  // Web Crypto encrypt with AES-GCM produces ciphertext + 128-bit authentication tag appended at the end
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    cryptoKey,
    plaintextBytes
  );

  const endTime = performance.now();
  const executionTimeMs = endTime - startTime;

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  // Tag is the last 16 bytes in Web Crypto AES-GCM
  const tagBytes = encryptedBytes.slice(encryptedBytes.length - 16);
  const cipherOnlyBytes = encryptedBytes.slice(0, encryptedBytes.length - 16);

  // Combined wire format: [12-byte IV] + [Ciphertext] + [16-byte Tag]
  const combinedBytes = new Uint8Array(iv.length + encryptedBytes.length);
  combinedBytes.set(iv, 0);
  combinedBytes.set(encryptedBytes, iv.length);

  return {
    algorithm: 'AES-GCM',
    executionTimeMs,
    plaintextByteLength: plaintextBytes.byteLength,
    ivHex: bytesToHex(iv),
    ivBase64: bytesToBase64(iv),
    cipherHex: bytesToHex(cipherOnlyBytes),
    tagHex: bytesToHex(tagBytes),
    combinedHex: bytesToHex(combinedBytes),
    combinedBase64: bytesToBase64(combinedBytes),
    rawCombinedBytes: combinedBytes,
    ivBytes: iv,
    cipherBytes: cipherOnlyBytes,
    tagBytes: tagBytes
  };
}

/**
 * Decrypt AES-GCM ciphertext
 * Rejects modified ciphertext, tampered auth tags, or wrong keys.
 * @param {Object|string} payload - combined hex, base64, or object with iv, cipher, tag
 * @param {CryptoKey} cryptoKey
 * @returns {Promise<Object>}
 */
export async function decryptAesGcm(payload, cryptoKey) {
  let combinedBytes;

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (/^[0-9a-fA-F]+$/.test(trimmed)) {
      combinedBytes = hexToBytes(trimmed);
    } else {
      combinedBytes = base64ToBytes(trimmed);
    }
  } else if (payload.rawCombinedBytes) {
    combinedBytes = payload.rawCombinedBytes;
  } else if (payload.combinedHex) {
    combinedBytes = hexToBytes(payload.combinedHex);
  } else if (payload.ivHex && payload.cipherHex && payload.tagHex) {
    const iv = hexToBytes(payload.ivHex);
    const cipher = hexToBytes(payload.cipherHex);
    const tag = hexToBytes(payload.tagHex);
    combinedBytes = new Uint8Array(iv.length + cipher.length + tag.length);
    combinedBytes.set(iv, 0);
    combinedBytes.set(cipher, iv.length);
    combinedBytes.set(tag, iv.length + cipher.length);
  } else {
    throw new Error('Invalid payload format. Expected combined wire format (IV + Ciphertext + Tag).');
  }

  // Minimum length: 12 bytes IV + 0 bytes cipher + 16 bytes Tag = 28 bytes
  if (combinedBytes.length < 28) {
    throw new Error(`Invalid payload length: ${combinedBytes.length} bytes. Minimum valid AES-GCM payload is 28 bytes (12B IV + 16B Tag).`);
  }

  const iv = combinedBytes.slice(0, 12);
  const encryptedAndTag = combinedBytes.slice(12);

  const startTime = performance.now();

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      cryptoKey,
      encryptedAndTag
    );

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    const decryptedBytes = new Uint8Array(decryptedBuffer);
    const decryptedText = new TextDecoder('utf-8', { fatal: false }).decode(decryptedBytes);

    return {
      success: true,
      decryptedText,
      decryptedBytes,
      executionTimeMs,
      byteLength: decryptedBytes.byteLength
    };
  } catch (err) {
    const endTime = performance.now();
    // Web Crypto throws standard DOMException: OperationError on authentication failure
    throw new Error(`AES-GCM Decryption Failed: Authentication verification failed. Either the key is incorrect, or the ciphertext/tag has been tampered with. [${err.name}: ${err.message}]`);
  }
}
