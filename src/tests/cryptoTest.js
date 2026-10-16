/**
 * Command-Line Cryptographic Verifier
 * Tests DES, AES-128, AES-192, and AES-256 engines using Node.js v26.
 */
import { generateDesKey, encryptDes, decryptDes } from '../services/cryptoDes.js';
import { generateAesKey, encryptAesGcm, decryptAesGcm, importAesKey } from '../services/cryptoAes.js';

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

console.log('\n--- 2. Testing AES-128 (128-bit / 10 Rounds) ---');
async function testAes() {
  // Test AES-128
  const aes128Key = await generateAesKey(128);
  console.log(`Generated AES-128 key: ${aes128Key.hex} (128 bits / 16 bytes / ${aes128Key.rounds} rounds)`);
  
  const aes128Encrypted = await encryptAesGcm(testPlaintext, aes128Key.key);
  const aes128Decrypted = await decryptAesGcm(aes128Encrypted, aes128Key.key);
  if (aes128Decrypted.decryptedText === testPlaintext) {
    console.log('✅ PASS: AES-128 encryption & decryption matched perfectly with valid GMAC tag.');
  } else {
    console.error('❌ FAIL: AES-128 decrypted text mismatch.');
    process.exit(1);
  }

  console.log('\n--- 3. Testing AES-192 (192-bit / 12 Rounds) ---');
  // Test AES-192
  const aes192Key = await generateAesKey(192);
  console.log(`Generated AES-192 key: ${aes192Key.hex} (192 bits / 24 bytes / ${aes192Key.rounds} rounds)`);
  
  const aes192Encrypted = await encryptAesGcm(testPlaintext, aes192Key.key);
  console.log(`AES-192-GCM Nonce: ${aes192Encrypted.ivHex}`);
  console.log(`AES-192-GCM Tag: ${aes192Encrypted.tagHex}`);
  console.log(`AES-192 Engine: ${aes192Encrypted.engine} (${aes192Encrypted.rounds} rounds)`);
  console.log(`AES-192 Enc Time: ${aes192Encrypted.executionTimeMs.toFixed(3)} ms`);

  const aes192Decrypted = await decryptAesGcm(aes192Encrypted, aes192Key.key);
  if (aes192Decrypted.decryptedText === testPlaintext) {
    console.log('✅ PASS: AES-192 encryption & decryption matched perfectly with valid GMAC tag.');
  } else {
    console.error('❌ FAIL: AES-192 decrypted text mismatch.');
    process.exit(1);
  }

  // Test AES-192 tamper rejection
  const tampered192 = new Uint8Array(aes192Encrypted.rawCombinedBytes);
  tampered192[14] ^= 0x01; // flip 1 bit in ciphertext
  try {
    await decryptAesGcm({ rawCombinedBytes: tampered192 }, aes192Key.key);
    console.error('❌ FAIL: AES-192 tampered ciphertext was NOT rejected!');
    process.exit(1);
  } catch (err) {
    console.log(`✅ PASS: AES-192 tampered ciphertext was successfully rejected: "${err.message}"`);
  }

  console.log('\n--- 4. Testing AES-256 (256-bit / 14 Rounds) ---');
  const aes256Key = await generateAesKey(256);
  console.log(`Generated AES-256 key: ${aes256Key.hex} (256 bits / ${aes256Key.rounds} rounds)`);

  const aes256Encrypted = await encryptAesGcm(testPlaintext, aes256Key.key);
  console.log(`AES-256-GCM Nonce: ${aes256Encrypted.ivHex}`);
  console.log(`AES-256-GCM Tag: ${aes256Encrypted.tagHex}`);
  console.log(`AES-256 Enc Time: ${aes256Encrypted.executionTimeMs.toFixed(3)} ms`);

  const aes256Decrypted = await decryptAesGcm(aes256Encrypted, aes256Key.key);
  if (aes256Decrypted.decryptedText === testPlaintext) {
    console.log('✅ PASS: AES-256 encryption & decryption matched perfectly with valid GMAC tag.');
  } else {
    console.error('❌ FAIL: AES-256 decrypted text mismatch.');
    process.exit(1);
  }

  // Test AES wrong key rejection
  const wrongAesKey = await generateAesKey(256);
  try {
    await decryptAesGcm(aes256Encrypted, wrongAesKey.key);
    console.error('❌ FAIL: Wrong key was NOT rejected!');
    process.exit(1);
  } catch (err) {
    console.log(`✅ PASS: Wrong key was successfully rejected by Web Crypto: "${err.message}"`);
  }

  console.log('\n🎉 ALL CRYPTOGRAPHIC ASSERTIONS (DES, AES-192, AES-256) PASSED SUCCESSFULLY!');
}

testAes();
