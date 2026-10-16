/**
 * AES-GCM Cryptographic Service
 * Implements AES-GCM using the native browser Web Crypto API (SubtleCrypto)
 * with universal, fully validated 128, 192, and 256-bit key support.
 * 
 * Standards: NIST SP 800-38D, FIPS 197
 * Features:
 *  - Supported key lengths: 128, 192, and 256 bits
 *  - AES-128: 10 Substitution-Permutation rounds (16-byte / 32-hex key)
 *  - AES-192: 12 Substitution-Permutation rounds (24-byte / 48-hex key)
 *  - AES-256: 14 Substitution-Permutation rounds (32-byte / 64-hex key)
 *  - Native Web Crypto API execution with automatic standards-compliant
 *    fallback for Chromium environments where BoringSSL omits 192-bit WebCrypto
 *  - Cryptographically secure 96-bit (12-byte) random nonce generated via crypto.getRandomValues()
 *  - 128-bit (16-byte) Galois authentication tag (GMAC / GHASH over GF(2^128))
 *  - Proper Unicode handling via TextEncoder and TextDecoder
 *  - Strict key-length validation with clear error messages (no silent derivation)
 *  - Strict rejection of incorrect keys, modified ciphertexts, or tampered auth tags
 */

import CryptoJS from 'crypto-js';

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
  if (typeof window !== 'undefined' && window.btoa) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
}

// Helper: Convert Base64 string to Uint8Array
export function base64ToBytes(base64) {
  if (typeof window !== 'undefined' && window.atob) {
    const binary = window.atob(base64.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64.trim(), 'base64'));
}

// Internal: Convert Uint8Array to CryptoJS WordArray
function uint8ArrayToWordArray(u8) {
  const words = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(
      (u8[i] << 24) |
      ((u8[i + 1] || 0) << 16) |
      ((u8[i + 2] || 0) << 8) |
      (u8[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

// Internal: Convert CryptoJS WordArray to Uint8Array
function wordArrayToUint8Array(wa) {
  const u8 = new Uint8Array(wa.sigBytes);
  for (let i = 0; i < wa.sigBytes; i++) {
    u8[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
}

// Internal: Galois Field GF(2^128) multiplication with reduction polynomial R = 0xE1
function ghashMultiply(x, y) {
  const v = new Uint8Array(y);
  const z = new Uint8Array(16);
  for (let i = 0; i < 128; i++) {
    const byteIdx = Math.floor(i / 8);
    const bitIdx = 7 - (i % 8);
    if ((x[byteIdx] >> bitIdx) & 1) {
      for (let j = 0; j < 16; j++) z[j] ^= v[j];
    }
    const lsb = v[15] & 1;
    for (let j = 15; j > 0; j--) {
      v[j] = (v[j] >> 1) | ((v[j - 1] & 1) << 7);
    }
    v[0] >>= 1;
    if (lsb) v[0] ^= 0xe1;
  }
  return z;
}

// Internal: GHASH polynomial evaluation over byte buffer
function computeGhash(h, data) {
  let y = new Uint8Array(16);
  for (let offset = 0; offset < data.length; offset += 16) {
    const block = new Uint8Array(16);
    const slice = data.subarray(offset, Math.min(offset + 16, data.length));
    block.set(slice);
    for (let j = 0; j < 16; j++) y[j] ^= block[j];
    y = ghashMultiply(y, h);
  }
  return y;
}

// Internal: Compute NIST SP 800-38D standard GMAC tag
function computeGcmTag(keyWA, ivBytes, cipherBytes) {
  // H = AES_K(0^16)
  const zeroBlock = CryptoJS.lib.WordArray.create([0, 0, 0, 0], 16);
  const hEnc = CryptoJS.AES.encrypt(zeroBlock, keyWA, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
  const hBytes = wordArrayToUint8Array(hEnc.ciphertext);

  // GHASH input: ciphertext + 64-bit length block
  const lenBlock = new Uint8Array(16);
  const bitLen = cipherBytes.length * 8;
  const view = new DataView(lenBlock.buffer);
  view.setBigUint64(8, BigInt(bitLen), false);

  const ghashInput = new Uint8Array(cipherBytes.length + 16);
  ghashInput.set(cipherBytes, 0);
  ghashInput.set(lenBlock, cipherBytes.length);
  const sTag = computeGhash(hBytes, ghashInput);

  // Mask = AES_K(IV || 1)
  const j0 = new Uint8Array(16);
  j0.set(ivBytes.slice(0, 12), 0);
  j0[15] = 1;
  const j0Enc = CryptoJS.AES.encrypt(uint8ArrayToWordArray(j0), keyWA, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
  const mask = wordArrayToUint8Array(j0Enc.ciphertext);

  const tag = new Uint8Array(16);
  for (let i = 0; i < 16; i++) tag[i] = sTag[i] ^ mask[i];
  return tag;
}

/**
 * Generate a cryptographically secure random AES key (128, 192, or 256 bits)
 * @param {number} keyLengthBits - 128, 192, or 256
 * @returns {Promise<{ key: Object, rawBytes: Uint8Array, hex: string, base64: string, bitLength: number, rounds: number, isFallback: boolean }>}
 */
export async function generateAesKey(keyLengthBits = 256) {
  if (![128, 192, 256].includes(keyLengthBits)) {
    throw new Error(`Invalid AES key length: ${keyLengthBits}. Allowed key sizes are 128, 192, or 256 bits.`);
  }

  const rawBytes = new Uint8Array(keyLengthBits / 8);
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
  cryptoObj.getRandomValues(rawBytes);

  let key = null;
  let isFallback = false;

  try {
    key = await cryptoObj.subtle.importKey(
      'raw',
      rawBytes,
      { name: 'AES-GCM', length: keyLengthBits },
      true,
      ['encrypt', 'decrypt']
    );
    // Attach rawBytes for cross-compatibility
    key.rawBytes = rawBytes;
  } catch {
    // Chromium / BoringSSL does not implement 192-bit WebCrypto AES-GCM.
    // Seamless fallback enables 100% interoperability across all browsers.
    isFallback = true;
    key = {
      type: 'secret',
      algorithm: { name: 'AES-GCM', length: keyLengthBits },
      rawBytes: rawBytes,
      isFallback: true
    };
  }

  const rounds = keyLengthBits === 128 ? 10 : keyLengthBits === 192 ? 12 : 14;

  return {
    key,
    rawBytes,
    hex: bytesToHex(rawBytes),
    base64: bytesToBase64(rawBytes),
    bitLength: keyLengthBits,
    rounds,
    isFallback
  };
}

/**
 * Import and strictly validate an AES key from raw bytes, hex, or base64
 * @param {Uint8Array|string|Object} keyInput
 * @param {number} keyLengthBits - 128, 192, or 256
 * @returns {Promise<Object>}
 */
export async function importAesKey(keyInput, keyLengthBits = 256) {
  if (![128, 192, 256].includes(keyLengthBits)) {
    throw new Error(`Invalid AES key length: ${keyLengthBits}. Allowed key sizes are 128, 192, or 256 bits.`);
  }

  if (!keyInput || (typeof keyInput === 'string' && keyInput.trim().length === 0)) {
    throw new Error(`Secret key is required and cannot be empty. Please provide a valid ${keyLengthBits}-bit key.`);
  }

  let rawBytes;

  // Case 1: Already a Web Crypto CryptoKey
  if (typeof CryptoKey !== 'undefined' && keyInput instanceof CryptoKey) {
    if (keyInput.algorithm?.length && keyInput.algorithm.length !== keyLengthBits) {
      throw new Error(`AES key size mismatch: Selected key size is ${keyLengthBits} bits, but provided CryptoKey is ${keyInput.algorithm.length} bits.`);
    }
    return keyInput;
  }

  // Case 2: Custom Key Object containing rawBytes
  if (typeof keyInput === 'object' && keyInput !== null && keyInput.rawBytes instanceof Uint8Array) {
    if (keyInput.rawBytes.length !== keyLengthBits / 8) {
      throw new Error(`Invalid AES-${keyLengthBits} key size: Expected ${keyLengthBits / 8} bytes (${keyLengthBits} bits), but received ${keyInput.rawBytes.length} bytes (${keyInput.rawBytes.length * 8} bits).`);
    }
    rawBytes = keyInput.rawBytes;
  } else if (keyInput instanceof Uint8Array) {
    // Case 3: Raw Uint8Array
    if (keyInput.length !== keyLengthBits / 8) {
      throw new Error(`Invalid AES-${keyLengthBits} key size: Expected ${keyLengthBits / 8} bytes (${keyLengthBits} bits), but received ${keyInput.length} bytes (${keyInput.length * 8} bits).`);
    }
    rawBytes = keyInput;
  } else if (typeof keyInput === 'string') {
    // Case 4: String input (Hex or Base64)
    const trimmed = keyInput.trim();
    if (trimmed.length === 0) {
      throw new Error(`Secret key cannot be empty. Please provide a valid ${keyLengthBits}-bit key.`);
    }

    const expectedHexLength = keyLengthBits / 4;
    const expectedByteLength = keyLengthBits / 8;

    // Check if strictly Hexadecimal (0-9, a-f, A-F)
    if (/^[0-9a-fA-F]+$/.test(trimmed)) {
      if (trimmed.length !== expectedHexLength) {
        throw new Error(`Invalid AES-${keyLengthBits} key length: Expected exactly ${expectedHexLength} hex characters (${expectedByteLength} bytes / ${keyLengthBits} bits), but received ${trimmed.length} characters.`);
      }
      rawBytes = hexToBytes(trimmed);
    } else if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
      // Attempt Base64 decode
      try {
        const decoded = base64ToBytes(trimmed);
        if (decoded.length !== expectedByteLength) {
          throw new Error(`Invalid AES-${keyLengthBits} key length: Base64 decoded to ${decoded.length} bytes (${decoded.length * 8} bits), but expected ${expectedByteLength} bytes (${keyLengthBits} bits).`);
        }
        rawBytes = decoded;
      } catch (b64Err) {
        if (b64Err.message.includes('Invalid AES-')) {
          throw b64Err;
        }
        throw new Error(`Invalid AES-${keyLengthBits} key format: Key must be either a ${expectedHexLength}-character hexadecimal string or a valid Base64 encoded string (${expectedByteLength} bytes).`);
      }
    } else {
      throw new Error(`Invalid AES-${keyLengthBits} key format: Key must be either a ${expectedHexLength}-character hexadecimal string or a valid Base64 encoded string (${expectedByteLength} bytes).`);
    }
  } else {
    throw new Error(`Unsupported key type for AES-${keyLengthBits}. Expected hex string, Base64 string, or Uint8Array.`);
  }

  if (rawBytes.length !== keyLengthBits / 8) {
    throw new Error(`Invalid AES-${keyLengthBits} key length: Expected ${keyLengthBits / 8} bytes (${keyLengthBits} bits), but received ${rawBytes.length} bytes.`);
  }

  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;

  try {
    const importedKey = await cryptoObj.subtle.importKey(
      'raw',
      rawBytes,
      { name: 'AES-GCM', length: keyLengthBits },
      false,
      ['encrypt', 'decrypt']
    );
    importedKey.rawBytes = rawBytes;
    return importedKey;
  } catch {
    // Chromium / BoringSSL fallback for 192-bit keys
    return {
      type: 'secret',
      algorithm: { name: 'AES-GCM', length: keyLengthBits },
      rawBytes: rawBytes,
      isFallback: true
    };
  }
}

/**
 * Encrypt plaintext using AES-GCM (128, 192, or 256 bits)
 * Produces NIST SP 800-38D compliant [12-byte IV] + [Ciphertext] + [16-byte GMAC Tag]
 * @param {string|Uint8Array} plaintextInput - text string or raw bytes
 * @param {Object} cryptoKey - CryptoKey or fallback key object
 * @param {Uint8Array} [customIv] - Optional 12-byte IV
 * @returns {Promise<Object>}
 */
export async function encryptAesGcm(plaintextInput, cryptoKey, customIv = null) {
  const plaintextBytes = typeof plaintextInput === 'string'
    ? new TextEncoder().encode(plaintextInput)
    : plaintextInput;

  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;

  // Generate fresh cryptographically secure 96-bit (12-byte) IV
  const iv = customIv || new Uint8Array(12);
  if (!customIv) {
    cryptoObj.getRandomValues(iv);
  }

  const bitLength = cryptoKey?.algorithm?.length || (cryptoKey?.rawBytes?.length ? cryptoKey.rawBytes.length * 8 : 256);
  const rounds = bitLength === 128 ? 10 : bitLength === 192 ? 12 : 14;

  const startTime = performance.now();

  // Try native Web Crypto if not flagged as fallback
  if (!cryptoKey?.isFallback) {
    try {
      const encryptedBuffer = await cryptoObj.subtle.encrypt(
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
      const tagBytes = encryptedBytes.slice(encryptedBytes.length - 16);
      const cipherOnlyBytes = encryptedBytes.slice(0, encryptedBytes.length - 16);

      // Combined wire format: [12-byte IV] + [Ciphertext] + [16-byte Tag]
      const combinedBytes = new Uint8Array(iv.length + encryptedBytes.length);
      combinedBytes.set(iv, 0);
      combinedBytes.set(encryptedBytes, iv.length);

      return {
        algorithm: `AES-${bitLength}-GCM`,
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
        tagBytes: tagBytes,
        bitLength,
        rounds,
        engine: 'Native Web Crypto (Hardware Accelerated)'
      };
    } catch (e) {
      // If WebCrypto throws NotSupportedError (Chromium 192-bit limitation), fall through to fallback
      if (!cryptoKey?.rawBytes) throw e;
    }
  }

  // Fallback Engine (Authentic 12-Round AES-192 or cross-browser execution)
  const keyBytes = cryptoKey.rawBytes;
  if (!keyBytes) {
    throw new Error('Key raw bytes missing for AES-GCM engine.');
  }

  const keyWA = uint8ArrayToWordArray(keyBytes);

  // In GCM, CTR counter begins at IV || 2 (counter = 2)
  const ctrIv = new Uint8Array(16);
  ctrIv.set(iv, 0);
  ctrIv[15] = 2;
  const ctrIvWA = uint8ArrayToWordArray(ctrIv);

  const ptWA = uint8ArrayToWordArray(plaintextBytes);
  const enc = CryptoJS.AES.encrypt(ptWA, keyWA, {
    iv: ctrIvWA,
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding
  });

  const cipherOnlyBytes = wordArrayToUint8Array(enc.ciphertext);
  const tagBytes = computeGcmTag(keyWA, iv, cipherOnlyBytes);

  const endTime = performance.now();
  const executionTimeMs = endTime - startTime;

  const combinedBytes = new Uint8Array(iv.length + cipherOnlyBytes.length + tagBytes.length);
  combinedBytes.set(iv, 0);
  combinedBytes.set(cipherOnlyBytes, iv.length);
  combinedBytes.set(tagBytes, iv.length + cipherOnlyBytes.length);

  return {
    algorithm: `AES-${bitLength}-GCM`,
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
    tagBytes: tagBytes,
    bitLength,
    rounds,
    engine: bitLength === 192 ? 'Standard 12-Round SPN (Universal Cross-Browser Engine)' : 'CryptoJS SPN Engine'
  };
}

/**
 * Decrypt AES-GCM ciphertext (128, 192, or 256 bits)
 * Rejects modified ciphertext, tampered auth tags, or wrong keys.
 * @param {Object|string} payload - combined hex, base64, or object with iv, cipher, tag
 * @param {Object} cryptoKey
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
  const cipherOnlyBytes = combinedBytes.slice(12, combinedBytes.length - 16);
  const tagBytes = combinedBytes.slice(combinedBytes.length - 16);

  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
  const startTime = performance.now();

  // Try native Web Crypto if not flagged as fallback
  if (!cryptoKey?.isFallback) {
    try {
      const decryptedBuffer = await cryptoObj.subtle.decrypt(
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
      if (err.name === 'NotSupportedError' && cryptoKey?.rawBytes) {
        // Fall through to fallback engine
      } else {
        throw new Error(`AES-GCM Decryption Failed: Authentication verification failed. Either the key is incorrect, or the ciphertext/tag has been tampered with. [${err.name}: ${err.message}]`);
      }
    }
  }

  // Fallback Engine (Authentic 12-Round AES-192 or cross-browser execution)
  const keyBytes = cryptoKey.rawBytes;
  if (!keyBytes) {
    throw new Error('Key raw bytes missing for AES-GCM decryption.');
  }

  const keyWA = uint8ArrayToWordArray(keyBytes);
  const expectedTag = computeGcmTag(keyWA, iv, cipherOnlyBytes);

  // Constant-time tag verification to thwart timing attacks
  let diff = 0;
  for (let i = 0; i < 16; i++) {
    diff |= (tagBytes[i] ^ expectedTag[i]);
  }

  if (diff !== 0) {
    throw new Error('AES-GCM Decryption Failed: Authentication verification failed. Either the key is incorrect, or the ciphertext/tag has been tampered with. [OperationError: The operation failed for an operation-specific reason]');
  }

  const ctrIv = new Uint8Array(16);
  ctrIv.set(iv, 0);
  ctrIv[15] = 2;
  const ctrIvWA = uint8ArrayToWordArray(ctrIv);

  const dec = CryptoJS.AES.decrypt(
    { ciphertext: uint8ArrayToWordArray(cipherOnlyBytes) },
    keyWA,
    { iv: ctrIvWA, mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding }
  );

  const endTime = performance.now();
  const executionTimeMs = endTime - startTime;

  const decryptedBytes = wordArrayToUint8Array(dec);
  const decryptedText = new TextDecoder('utf-8', { fatal: false }).decode(decryptedBytes);

  return {
    success: true,
    decryptedText,
    decryptedBytes,
    executionTimeMs,
    byteLength: decryptedBytes.byteLength
  };
}
