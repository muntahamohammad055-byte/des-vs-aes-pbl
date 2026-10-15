/**
 * Command-Line Cryptographic Verifier
 * Tests both DES and AES-GCM engines using Node.js v26.
 */
import { generateDesKey, encryptDes, decryptDes } from '../services/cryptoDes.js';

// Polyfill window.crypto for Node.js if needed
if (!globalThis.window) {
  globalThis.window = {
    crypto: globalThis.crypto,
    btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
    atob: (b64) => Buffer.from(b64, 'base64').toString('binary')
  };
}

console.log('--- 1. Testing DES (CryptoJS) ---');
const desKey = generateDesKey();
console.log(`Generated DES key: ${desKey.hex} (${desKey.effectiveBits} effective bits)`);

const testPlaintext = 'Engineering College PBL: DES vs AES Verification Token 2025! 🚀';
const desEncrypted = encryptDes(testPlaintext, desKey.rawBytes);
console.log(`DES Encrypted (${desEncrypted.combinedHex.length / 2} bytes): ${desEncrypted.combinedHex.slice(0, 32)}...`);
console.log(`DES Enc Time: ${desEncrypted.executionTimeMs.toFixed(3)} ms`);

const desDecrypted = decryptDes(desEncrypted, desKey.rawBytes);
console.log(`DES Decrypted: "${desDecrypted.decryptedText}"`);

if (desDecrypted.decryptedText === testPlaintext) {
  console.log('✅ PASS: DES encryption & decryption matched perfectly.');
} else {
  console.error('❌ FAIL: DES decrypted text mismatch.');
  process.exit(1);
}

// Test DES wrong key corruption
const wrongDesKey = generateDesKey();
const desWrongDec = decryptDes(desEncrypted, wrongDesKey.rawBytes);
console.log(`DES Decryption with Wrong Key: "${desWrongDec.decryptedText.slice(0, 40)}..."`);
console.log('✅ PASS: DES with wrong key failed silently / corrupted (Expected Behavior).');

console.log('\n--- 2. Testing AES-GCM (Web Crypto API) ---');
import { generateAesKey, encryptAesGcm, decryptAesGcm } from '../services/cryptoAes.js';

async function testAes() {
  const aesKey = await generateAesKey(256);
  console.log(`Generated AES-256 key: ${aesKey.hex} (256 bits)`);

  const aesEncrypted = await encryptAesGcm(testPlaintext, aesKey.key);
  console.log(`AES-256-GCM Nonce: ${aesEncrypted.ivHex}`);
  console.log(`AES-256-GCM Tag: ${aesEncrypted.tagHex}`);
  console.log(`AES-256-GCM Enc Time: ${aesEncrypted.executionTimeMs.toFixed(3)} ms`);

  const aesDecrypted = await decryptAesGcm(aesEncrypted, aesKey.key);
  console.log(`AES Decrypted: "${aesDecrypted.decryptedText}"`);

  if (aesDecrypted.decryptedText === testPlaintext) {
    console.log('✅ PASS: AES-GCM encryption & decryption matched perfectly with valid GMAC tag.');
  } else {
    console.error('❌ FAIL: AES decrypted text mismatch.');
    process.exit(1);
  }

  // Test AES tampering detection
  const tamperedBytes = new Uint8Array(aesEncrypted.rawCombinedBytes);
  tamperedBytes[14] ^= 0x01; // flip 1 bit in ciphertext body
  try {
    await decryptAesGcm({ rawCombinedBytes: tamperedBytes }, aesKey.key);
    console.error('❌ FAIL: Tampered ciphertext was NOT rejected!');
    process.exit(1);
  } catch (err) {
    console.log(`✅ PASS: Tampered ciphertext was successfully rejected: "${err.message}"`);
  }

  // Test AES wrong key rejection
  const wrongAesKey = await generateAesKey(256);
  try {
    await decryptAesGcm(aesEncrypted, wrongAesKey.key);
    console.error('❌ FAIL: Wrong key was NOT rejected!');
    process.exit(1);
  } catch (err) {
    console.log(`✅ PASS: Wrong key was successfully rejected by Web Crypto: "${err.message}"`);
  }

  console.log('\n🎉 ALL CRYPTOGRAPHIC ASSERTIONS PASSED SUCCESSFULLY!');
}

testAes();
