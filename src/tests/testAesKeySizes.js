/**
 * Automated Verification Test for AES Key Sizes (128, 192, 256 bits)
 * Validates independent roundtrip encryption/decryption, key length validation,
 * tampering detection, and error messages.
 */
import { generateAesKey, importAesKey, encryptAesGcm, decryptAesGcm, bytesToHex } from '../services/cryptoAes.js';

// Polyfill window.crypto if running in Node
if (!globalThis.window) {
  globalThis.window = {
    crypto: globalThis.crypto,
    btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
    atob: (b64) => Buffer.from(b64, 'base64').toString('binary')
  };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`✅ PASS: ${testName} ${detail ? '(' + detail + ')' : ''}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('========================================================');
  console.log('  AES Key Sizes & Cryptographic Integrity Test Suite   ');
  console.log('========================================================\n');

  const testPayload = 'PBL Verification Token 2025: AES-128, AES-192 & AES-256 Multi-Language Test! 🔐⚡🛡️';

  // --- Requirement 8: Test AES-128, AES-192, AES-256 independently ---
  for (const bits of [128, 192, 256]) {
    console.log(`--- Testing AES-${bits} (${bits === 128 ? '10' : bits === 192 ? '12' : '14'} SPN Rounds) ---`);
    
    // 1. Key Generation
    const keyObj = await generateAesKey(bits);
    assert(keyObj.rawBytes.length === bits / 8, `AES-${bits} Key Generation byte length`, `${keyObj.rawBytes.length} bytes`);
    assert(keyObj.hex.length === bits / 4, `AES-${bits} Key Hex length`, `${keyObj.hex.length} hex chars`);
    assert(keyObj.rounds === (bits === 128 ? 10 : bits === 192 ? 12 : 14), `AES-${bits} Round count`, `${keyObj.rounds} rounds`);

    // 2. Encryption
    const enc = await encryptAesGcm(testPayload, keyObj.key);
    assert(enc.ivBytes.length === 12, `AES-${bits} Nonce / IV length`, '96 bits / 12 bytes');
    assert(enc.tagBytes.length === 16, `AES-${bits} Galois MAC Tag length`, '128 bits / 16 bytes');
    assert(enc.rawCombinedBytes.length === 12 + enc.cipherBytes.length + 16, `AES-${bits} Combined Wire Format`, `${enc.rawCombinedBytes.length} bytes`);

    // 3. Decryption with matching key
    const dec = await decryptAesGcm(enc, keyObj.key);
    assert(dec.decryptedText === testPayload, `AES-${bits} Independent Roundtrip Decryption`, 'Matches original plaintext exactly');

    // 4. Decryption using imported hex key
    const importedKey = await importAesKey(keyObj.hex, bits);
    const decWithImported = await decryptAesGcm(enc, importedKey);
    assert(decWithImported.decryptedText === testPayload, `AES-${bits} Decryption via Imported Hex Key`, 'Matches original plaintext');

    // 5. Decryption using imported Base64 key
    const importedB64Key = await importAesKey(keyObj.base64, bits);
    const decWithB64 = await decryptAesGcm(enc, importedB64Key);
    assert(decWithB64.decryptedText === testPayload, `AES-${bits} Decryption via Imported Base64 Key`, 'Matches original plaintext');

    // 6. Failed Authentication - Modified Ciphertext
    let cipherTamperCaught = false;
    let cipherTamperError = '';
    try {
      const corruptedBytes = new Uint8Array(enc.rawCombinedBytes);
      corruptedBytes[14] ^= 0x01; // flip 1 bit in ciphertext body
      await decryptAesGcm({ rawCombinedBytes: corruptedBytes }, keyObj.key);
    } catch (err) {
      cipherTamperCaught = true;
      cipherTamperError = err.message;
    }
    assert(cipherTamperCaught, `AES-${bits} Ciphertext Tamper Rejection`, cipherTamperError);

    // 7. Failed Authentication - Modified Tag
    let tagTamperCaught = false;
    let tagTamperError = '';
    try {
      const corruptedBytes = new Uint8Array(enc.rawCombinedBytes);
      corruptedBytes[corruptedBytes.length - 1] ^= 0x01; // flip 1 bit in auth tag
      await decryptAesGcm({ rawCombinedBytes: corruptedBytes }, keyObj.key);
    } catch (err) {
      tagTamperCaught = true;
      tagTamperError = err.message;
    }
    assert(tagTamperCaught, `AES-${bits} Auth Tag Tamper Rejection`, tagTamperError);

    // 8. Failed Authentication - Wrong Key
    let wrongKeyCaught = false;
    let wrongKeyError = '';
    try {
      const wrongKey = await generateAesKey(bits);
      await decryptAesGcm(enc, wrongKey.key);
    } catch (err) {
      wrongKeyCaught = true;
      wrongKeyError = err.message;
    }
    assert(wrongKeyCaught, `AES-${bits} Wrong Key Rejection`, wrongKeyError);

    console.log('');
  }

  // --- Requirement 9: Check that invalid key sizes produce clear error messages ---
  console.log('--- Testing Key-Length & Format Validation Error Messages ---');

  // Test: 128-bit key provided to AES-192
  let err192With128 = '';
  try {
    const key128Hex = '0123456789abcdef0123456789abcdef'; // 32 hex chars = 16 bytes = 128 bits
    await importAesKey(key128Hex, 192); // passing 128-bit key to 192-bit algorithm
  } catch (err) {
    err192With128 = err.message;
  }
  assert(
    err192With128.includes('Invalid AES-192') && err192With128.includes('48 hex characters'),
    'AES-192 Rejects 128-bit Key',
    `Clear Error: "${err192With128}"`
  );

  // Test: 256-bit key provided to AES-192
  let err192With256 = '';
  try {
    const key256Hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars = 256 bits
    await importAesKey(key256Hex, 192);
  } catch (err) {
    err192With256 = err.message;
  }
  assert(
    err192With256.includes('Invalid AES-192') && err192With256.includes('48 hex characters'),
    'AES-192 Rejects 256-bit Key',
    `Clear Error: "${err192With256}"`
  );

  // Test: Odd number of hex characters
  let errOddHex = '';
  try {
    await importAesKey('0123456789abcdef0123456789abcdef0123456789abcde', 192); // 47 hex chars
  } catch (err) {
    errOddHex = err.message;
  }
  assert(
    errOddHex.includes('Invalid AES-192') && errOddHex.includes('48 hex characters'),
    'AES-192 Rejects Odd-Length / Truncated Hex',
    `Clear Error: "${errOddHex}"`
  );

  // Test: Invalid characters in key
  let errInvalidChars = '';
  try {
    await importAesKey('!@#$%^&*!@#$%^&*!@#$%^&*!@#$%^&*!@#$%^&*!@#$', 192); // non-hex, non-base64
  } catch (err) {
    errInvalidChars = err.message;
  }
  assert(
    errInvalidChars.includes('Invalid AES-192 key format'),
    'AES-192 Rejects Malformed Non-Hex/Non-Base64 Key',
    `Clear Error: "${errInvalidChars}"`
  );

  // Test: Empty key
  let errEmpty = '';
  try {
    await importAesKey('', 192);
  } catch (err) {
    errEmpty = err.message;
  }
  assert(
    errEmpty.includes('Secret key is required and cannot be empty'),
    'AES-192 Rejects Empty Key',
    `Clear Error: "${errEmpty}"`
  );

  // Test: Invalid algorithm bit size
  let errInvalidBit = '';
  try {
    await generateAesKey(196); // invalid bit size
  } catch (err) {
    errInvalidBit = err.message;
  }
  assert(
    errInvalidBit.includes('Invalid AES key length: 196'),
    'Rejects Non-Standard Bit Length (196 bits)',
    `Clear Error: "${errInvalidBit}"`
  );

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED  `);
  console.log('========================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
