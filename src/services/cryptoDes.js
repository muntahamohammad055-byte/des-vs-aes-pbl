/**
 * DES Cryptographic Service
 * Implements genuine single DES (Data Encryption Standard) using CryptoJS.DES.
 * Standards: FIPS 46-3, ANSI X3.92
 * Characteristics:
 *  - 64-bit key (56 effective bits + 8 parity bits = 8 bytes)
 *  - 64-bit block size (8 bytes)
 *  - 16 Feistel rounds
 *  - Obsolete and insecure for modern data protection
 *  - Lacks built-in cryptographic integrity / authentication
 */
import CryptoJS from 'crypto-js';

// Helper: Convert Uint8Array to Hex string
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert Hex string to Uint8Array
function hexToBytes(hex) {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Generate a random 64-bit (8 bytes) DES key using cryptographically secure random values
 * @returns {{ rawBytes: Uint8Array, hex: string, base64: string, bitLength: number, effectiveBits: number }}
 */
export function generateDesKey() {
  const rawBytes = new Uint8Array(8);
  window.crypto.getRandomValues(rawBytes);

  return {
    rawBytes,
    hex: bytesToHex(rawBytes),
    base64: window.btoa(String.fromCharCode(...rawBytes)),
    bitLength: 64,
    effectiveBits: 56,
    parityBits: 8
  };
}

/**
 * Parse DES key into CryptoJS WordArray
 * Validates 8-byte / 64-bit length
 * @param {string|Uint8Array} keyInput
 * @returns {CryptoJS.lib.WordArray}
 */
export function parseDesKey(keyInput) {
  if (typeof keyInput === 'string') {
    const trimmed = keyInput.trim();
    // If 16 hex chars (8 bytes = 64 bits)
    if (/^[0-9a-fA-F]{16}$/.test(trimmed)) {
      return CryptoJS.enc.Hex.parse(trimmed);
    }
    // If 8 raw characters
    if (trimmed.length === 8) {
      return CryptoJS.enc.Utf8.parse(trimmed);
    }
    // Otherwise try base64 or derive 8 bytes
    try {
      const decoded = window.atob(trimmed);
      if (decoded.length === 8) {
        return CryptoJS.enc.Base64.parse(trimmed);
      }
    } catch {
      // ignore
    }
    // Fallback: derive 8 bytes from UTF-8 hash or slice
    const utf8 = CryptoJS.enc.Utf8.parse(trimmed);
    const md5 = CryptoJS.MD5(utf8);
    // Take first 2 words (8 bytes = 64 bits)
    return CryptoJS.lib.WordArray.create(md5.words.slice(0, 2), 8);
  } else if (keyInput instanceof Uint8Array) {
    return CryptoJS.lib.WordArray.create(Array.from(keyInput).slice(0, 8), 8);
  }
  throw new Error('Invalid DES key. Must provide 64-bit key (8 bytes / 16 hex characters).');
}

/**
 * Encrypt plaintext using genuine DES (CBC mode with PKCS7 padding)
 * @param {string|Uint8Array} plaintextInput
 * @param {string|Uint8Array} keyInput
 * @param {Uint8Array} [customIv] - Optional 8-byte IV (64 bits)
 * @returns {Object}
 */
export function encryptDes(plaintextInput, keyInput, customIv = null) {
  const keyWords = parseDesKey(keyInput);

  // Generate 64-bit (8-byte) random IV for CBC mode
  const ivBytes = customIv || new Uint8Array(8);
  if (!customIv) {
    window.crypto.getRandomValues(ivBytes);
  }
  const ivWords = CryptoJS.lib.WordArray.create(Array.from(ivBytes), 8);

  // Convert plaintext to WordArray (handling Unicode properly)
  let plaintextWords;
  let byteLength = 0;
  if (typeof plaintextInput === 'string') {
    plaintextWords = CryptoJS.enc.Utf8.parse(plaintextInput);
    byteLength = new TextEncoder().encode(plaintextInput).length;
  } else {
    plaintextWords = CryptoJS.lib.WordArray.create(Array.from(plaintextInput));
    byteLength = plaintextInput.length;
  }

  const startTime = performance.now();

  const encrypted = CryptoJS.DES.encrypt(plaintextWords, keyWords, {
    iv: ivWords,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const endTime = performance.now();
  const executionTimeMs = endTime - startTime;

  const cipherHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  const ivHex = ivWords.toString(CryptoJS.enc.Hex);
  const combinedHex = ivHex + cipherHex;
  const combinedBytes = hexToBytes(combinedHex);
  const combinedBase64 = window.btoa(String.fromCharCode(...combinedBytes));

  return {
    algorithm: 'DES-CBC',
    blockSizeBytes: 8,
    effectiveKeyBits: 56,
    totalKeyBits: 64,
    executionTimeMs,
    plaintextByteLength: byteLength,
    ivHex,
    cipherHex,
    combinedHex,
    combinedBase64,
    securityWarning: 'DES is obsolete and insecure. It is vulnerable to exhaustive brute-force search within hours.'
  };
}

/**
 * Decrypt DES ciphertext
 * Note: DES has no built-in MAC/authentication.
 * Decrypting with a wrong key will produce corrupted garbage text or cause PKCS#7 unpadding failure.
 * @param {Object|string} payload - combined hex, base64, or object with ivHex & cipherHex
 * @param {string|Uint8Array} keyInput
 * @returns {Object}
 */
export function decryptDes(payload, keyInput) {
  const keyWords = parseDesKey(keyInput);

  let ivHex, cipherHex;
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    let hex = trimmed;
    if (!/^[0-9a-fA-F]+$/.test(trimmed)) {
      try {
        const decoded = window.atob(trimmed);
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
        hex = bytesToHex(bytes);
      } catch {
        throw new Error('DES ciphertext payload must be valid Hex or Base64.');
      }
    }
    if (hex.length < 32) { // 16 hex chars IV (8 bytes) + at least 16 hex chars cipher block
      throw new Error('DES ciphertext is too short. Minimum 16 bytes (8B IV + 8B block).');
    }
    ivHex = hex.substring(0, 16);
    cipherHex = hex.substring(16);
  } else if (payload.ivHex && payload.cipherHex) {
    ivHex = payload.ivHex;
    cipherHex = payload.cipherHex;
  } else if (payload.combinedHex) {
    ivHex = payload.combinedHex.substring(0, 16);
    cipherHex = payload.combinedHex.substring(16);
  } else {
    throw new Error('Invalid DES payload structure.');
  }

  const ivWords = CryptoJS.enc.Hex.parse(ivHex);
  const cipherWords = CryptoJS.enc.Hex.parse(cipherHex);
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: cipherWords
  });

  const startTime = performance.now();

  try {
    const decrypted = CryptoJS.DES.decrypt(cipherParams, keyWords, {
      iv: ivWords,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;

    // Try decoding UTF-8 string
    let decryptedText;
    let corrupted = false;
    try {
      decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedText && cipherHex.length > 0) {
        corrupted = true;
        decryptedText = `[Garbage Decryption / Non-UTF8 Bytes: 0x${decrypted.toString(CryptoJS.enc.Hex).substring(0, 64)}...]`;
      }
    } catch {
      corrupted = true;
      decryptedText = `[Garbage Decryption / Corrupted Plaintext: 0x${decrypted.toString(CryptoJS.enc.Hex).substring(0, 64)}...]`;
    }

    return {
      success: true,
      decryptedText,
      isCorrupted: corrupted,
      executionTimeMs,
      hex: decrypted.toString(CryptoJS.enc.Hex)
    };
  } catch (err) {
    const endTime = performance.now();
    throw new Error(`DES Decryption error: ${err.message || 'Padding or key mismatch error.'}`);
  }
}
