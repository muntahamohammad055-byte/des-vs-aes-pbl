import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Key, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Shield, 
  Sliders, 
  Clock, 
  FileCode,
  Flame,
  FileCheck
} from 'lucide-react';
import { 
  generateAesKey, 
  importAesKey, 
  encryptAesGcm, 
  decryptAesGcm, 
  bytesToHex, 
  bytesToBase64 
} from '../services/cryptoAes';
import { 
  generateDesKey, 
  encryptDes, 
  decryptDes 
} from '../services/cryptoDes';
import { formatBytes, formatTime } from '../utils/formatters';
import { calculateEntropy } from '../utils/entropy';

export default function EncryptDecryptPage({ onNotify }) {
  // Configuration State
  const [algorithm, setAlgorithm] = useState('AES'); // 'AES' or 'DES'
  const [aesKeyLength, setAesKeyLength] = useState(256); // 128, 192, 256
  const [outputFormat, setOutputFormat] = useState('hex'); // 'hex' or 'base64'
  const [viewHexDump, setViewHexDump] = useState(false);

  // Input & Key State
  const [plaintext, setPlaintext] = useState('Confidential Engineering PBL Telemetry: DES vs AES Verification Payload 2025. 🔐');
  const [keyInput, setKeyInput] = useState('');
  const [keyHex, setKeyHex] = useState('');
  const [keyBase64, setKeyBase64] = useState('');

  // Result State
  const [encryptionResult, setEncryptionResult] = useState(null);
  const [decryptionResult, setDecryptionResult] = useState(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [isMatch, setIsMatch] = useState(null);

  // Status & Telemetry
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Generate initial key on load or when algorithm/key length changes
  useEffect(() => {
    handleGenerateKey();
  }, [algorithm, aesKeyLength]);

  const handleGenerateKey = async () => {
    try {
      if (algorithm === 'AES') {
        const generated = await generateAesKey(aesKeyLength);
        setKeyHex(generated.hex);
        setKeyBase64(generated.base64);
        setKeyInput(outputFormat === 'hex' ? generated.hex : generated.base64);
      } else {
        const generated = generateDesKey();
        setKeyHex(generated.hex);
        setKeyBase64(generated.base64);
        setKeyInput(outputFormat === 'hex' ? generated.hex : generated.base64);
      }
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(`Key generation failed: ${err.message}`);
    }
  };

  // Plaintext Presets
  const applyPreset = (type) => {
    switch (type) {
      case 'short':
        setPlaintext('Attack at dawn! Coordinates: 37.7749,-122.4194.');
        break;
      case 'unicode':
        setPlaintext('Cryptographie Sécurisée • 密码学 • 暗号技術 • التعمية والتشفير • 🛡️🔑⚡');
        break;
      case 'json':
        setPlaintext(JSON.stringify({
          project: "DES vs AES PBL",
          studentId: "CSE-2025-PBL-042",
          sessionKeyId: "K-99812",
          timestamp: new Date().toISOString(),
          metrics: { cpuUtilization: "12%", entropy: "99.98%" }
        }, null, 2));
        break;
      case 'large':
        setPlaintext('Cybersecurity Engineering PBL 2025: '.repeat(100));
        break;
      default:
        break;
    }
  };

  // Copy helper
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Copied to Clipboard',
        message: `${fieldName} copied successfully.`
      });
    }
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Run Encryption
  const handleEncrypt = async () => {
    setIsEncrypting(true);
    setErrorMessage('');
    setDecryptionResult(null);
    setDecryptedText('');
    setIsMatch(null);

    try {
      if (!plaintext) {
        throw new Error('Plaintext input cannot be empty.');
      }

      if (algorithm === 'AES') {
        // Import or derive key
        const cryptoKey = await importAesKey(keyInput || keyHex, aesKeyLength);
        const result = await encryptAesGcm(plaintext, cryptoKey);
        setEncryptionResult(result);

        if (onNotify) {
          onNotify({
            type: 'success',
            title: 'AES-GCM Encryption Complete',
            message: `Encrypted ${result.plaintextByteLength} bytes in ${formatTime(result.executionTimeMs)} using fresh 96-bit nonce.`
          });
        }
      } else {
        // DES
        const result = encryptDes(plaintext, keyInput || keyHex);
        setEncryptionResult(result);

        if (onNotify) {
          onNotify({
            type: 'warning',
            title: 'DES Encryption Complete',
            message: `Encrypted in ${formatTime(result.executionTimeMs)}. Notice: 56-bit DES is obsolete and vulnerable!`
          });
        }
      }
    } catch (err) {
      setErrorMessage(err.message);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Encryption Error',
          message: err.message
        });
      }
    } finally {
      setIsEncrypting(false);
    }
  };

  // Run Decryption
  const handleDecrypt = async () => {
    if (!encryptionResult) {
      setErrorMessage('Please encrypt a message first.');
      return;
    }

    setIsDecrypting(true);
    setErrorMessage('');

    try {
      if (algorithm === 'AES') {
        const cryptoKey = await importAesKey(keyInput || keyHex, aesKeyLength);
        const result = await decryptAesGcm(encryptionResult, cryptoKey);
        setDecryptionResult(result);
        setDecryptedText(result.decryptedText);

        const match = result.decryptedText === plaintext;
        setIsMatch(match);

        if (onNotify) {
          onNotify({
            type: 'success',
            title: 'AES-GCM Authenticated Decryption Succeeded',
            message: `Decrypted in ${formatTime(result.executionTimeMs)}. 128-bit Galois MAC Tag verified intact!`
          });
        }
      } else {
        // DES
        const result = decryptDes(encryptionResult, keyInput || keyHex);
        setDecryptionResult(result);
        setDecryptedText(result.decryptedText);

        const match = result.decryptedText === plaintext;
        setIsMatch(match);

        if (onNotify) {
          onNotify({
            type: result.isCorrupted ? 'error' : 'info',
            title: result.isCorrupted ? 'DES Decryption Corrupted' : 'DES Decryption Succeeded',
            message: result.isCorrupted 
              ? 'Plaintext corrupted. DES does not support authenticated integrity verification!'
              : `Decrypted in ${formatTime(result.executionTimeMs)}.`
          });
        }
      }
    } catch (err) {
      setErrorMessage(err.message);
      setIsMatch(false);
      setDecryptedText('[DECRYPTION REJECTED BY CRYPTOGRAPHIC ENGINE]');
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Decryption Rejection',
          message: err.message
        });
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  // Tamper Experiment 1: Corrupt 1 byte in Ciphertext
  const handleTamperCiphertext = () => {
    if (!encryptionResult) return;
    if (algorithm === 'AES') {
      const corruptedBytes = new Uint8Array(encryptionResult.rawCombinedBytes);
      // Flip byte at offset 15 (inside ciphertext body, after 12-byte IV)
      corruptedBytes[15] ^= 0xff;
      const corruptedResult = {
        ...encryptionResult,
        rawCombinedBytes: corruptedBytes,
        combinedHex: bytesToHex(corruptedBytes),
        combinedBase64: bytesToBase64(corruptedBytes)
      };
      setEncryptionResult(corruptedResult);
      if (onNotify) {
        onNotify({
          type: 'warning',
          title: 'Active Tampering Injected',
          message: 'Flipped 1 byte in AES ciphertext body. Click "Decrypt" to witness Galois MAC rejection!'
        });
      }
    } else {
      // Corrupt DES ciphertext
      let hex = encryptionResult.combinedHex;
      const corruptedHex = hex.slice(0, 20) + (hex[20] === 'a' ? 'b' : 'a') + hex.slice(21);
      setEncryptionResult({
        ...encryptionResult,
        combinedHex: corruptedHex
      });
      if (onNotify) {
        onNotify({
          type: 'warning',
          title: 'DES Ciphertext Tampered',
          message: 'Altered 1 byte in DES ciphertext. Decrypting will output garbage without warning!'
        });
      }
    }
  };

  // Tamper Experiment 2: Corrupt Auth Tag (AES only)
  const handleTamperTag = () => {
    if (!encryptionResult || algorithm !== 'AES') return;
    const corruptedBytes = new Uint8Array(encryptionResult.rawCombinedBytes);
    // Flip last byte (inside 16-byte authentication tag)
    corruptedBytes[corruptedBytes.length - 1] ^= 0x01;
    setEncryptionResult({
      ...encryptionResult,
      rawCombinedBytes: corruptedBytes,
      combinedHex: bytesToHex(corruptedBytes),
      combinedBase64: bytesToBase64(corruptedBytes)
    });
    if (onNotify) {
      onNotify({
        type: 'warning',
        title: 'Authentication Tag Tampered',
        message: 'Flipped 1 bit in 128-bit Galois MAC Tag. GCM will strictly reject this message.'
      });
    }
  };

  // Tamper Experiment 3: Invert Key to Wrong Key
  const handleUseWrongKey = () => {
    if (algorithm === 'AES') {
      const wrong = new Uint8Array(aesKeyLength / 8);
      window.crypto.getRandomValues(wrong);
      setKeyHex(bytesToHex(wrong));
      setKeyInput(outputFormat === 'hex' ? bytesToHex(wrong) : bytesToBase64(wrong));
    } else {
      const wrong = new Uint8Array(8);
      window.crypto.getRandomValues(wrong);
      setKeyHex(bytesToHex(wrong));
      setKeyInput(outputFormat === 'hex' ? bytesToHex(wrong) : bytesToBase64(wrong));
    }
    if (onNotify) {
      onNotify({
        type: 'info',
        title: 'Key Inverted',
        message: 'Replaced key with an unauthorized random key. Decrypt now to observe engine behavior.'
      });
    }
  };

  // Reset Playground
  const handleReset = () => {
    setPlaintext('Confidential Engineering PBL Telemetry: DES vs AES Verification Payload 2025. 🔐');
    setEncryptionResult(null);
    setDecryptionResult(null);
    setDecryptedText('');
    setIsMatch(null);
    setErrorMessage('');
    handleGenerateKey();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-7 h-7 text-cyan-400" />
            Live Cryptography Playground
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Perform real, client-side encryption and decryption using genuine DES and modern AES-GCM engines.
          </p>
        </div>

        {/* Algorithm Toggle Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => { setAlgorithm('AES'); setEncryptionResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              algorithm === 'AES'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            AES-GCM (Modern)
          </button>

          <button
            onClick={() => { setAlgorithm('DES'); setEncryptionResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              algorithm === 'DES'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            DES-CBC (Obsolete)
          </button>
        </div>
      </div>

      {/* Algorithm Config Sub-Bar */}
      <div className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {algorithm === 'AES' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">AES Key Size:</span>
              {[128, 192, 256].map(bits => (
                <button
                  key={bits}
                  onClick={() => setAesKeyLength(bits)}
                  className={`px-2.5 py-1 rounded font-mono font-bold transition-all ${
                    aesKeyLength === bits
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {bits}-bit
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">DES Key Size:</span>
              <span className="px-2.5 py-1 rounded font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                56 effective bits (64-bit key with 8 parity bits)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Output Format:</span>
            <button
              onClick={() => setOutputFormat('hex')}
              className={`px-2 py-0.5 rounded font-mono ${outputFormat === 'hex' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
            >
              HEX
            </button>
            <button
              onClick={() => setOutputFormat('base64')}
              className={`px-2 py-0.5 rounded font-mono ${outputFormat === 'base64' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
            >
              BASE64
            </button>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Playground
        </button>
      </div>

      {/* Grid: Inputs & Cryptographic Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Plaintext Input & Key */}
        <div className="space-y-6">
          {/* Plaintext Box */}
          <div className="p-5 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Plaintext Input Message
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>Presets:</span>
                <button onClick={() => applyPreset('short')} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-cyan-300">Short</button>
                <button onClick={() => applyPreset('unicode')} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-cyan-300">Unicode</button>
                <button onClick={() => applyPreset('json')} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-cyan-300">JSON</button>
                <button onClick={() => applyPreset('large')} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-cyan-300">Large</button>
              </div>
            </div>

            <textarea
              rows={5}
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter plaintext message or paste UTF-8 data..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />

            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span>Length: {plaintext.length} characters</span>
              <span>Byte Size: {formatBytes(new TextEncoder().encode(plaintext).length)}</span>
            </div>
          </div>

          {/* Key Management Box */}
          <div className="p-5 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                Secret Key ({algorithm === 'AES' ? `${aesKeyLength} bits` : '64 bits / 56 eff.'})
              </label>
              <button
                onClick={handleGenerateKey}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-mono transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Generate Secure Random Key
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setKeyHex(e.target.value);
                }}
                placeholder={algorithm === 'AES' ? `Enter ${aesKeyLength / 4} hex characters or raw key` : "Enter 16 hex characters (8 bytes)"}
                className="w-full p-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleCopy(keyInput, 'Secret Key')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                title="Copy Key"
              >
                {copiedField === 'Secret Key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Entropy Source: <code className="text-emerald-400">crypto.getRandomValues()</code></span>
              <span className="font-mono">{algorithm === 'AES' ? `${aesKeyLength / 8} bytes` : '8 bytes'}</span>
            </div>
          </div>

          {/* Encryption Execution Trigger */}
          <button
            onClick={handleEncrypt}
            disabled={isEncrypting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(0,242,254,0.25)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isEncrypting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Encrypting via Client Crypto Engine...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Encrypt Plaintext ({algorithm})
              </>
            )}
          </button>
        </div>

        {/* Right Column: Ciphertext & Decryption */}
        <div className="space-y-6">
          {/* Ciphertext Output Box */}
          <div className="p-5 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                Ciphertext Output ({viewHexDump ? 'HEX DUMP (XXD)' : outputFormat.toUpperCase()})
              </label>
              {encryptionResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewHexDump(!viewHexDump)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  >
                    {viewHexDump ? 'Compact View' : 'Hex Dump View'}
                  </button>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    ⏱️ {formatTime(encryptionResult.executionTimeMs)}
                  </span>
                  <button
                    onClick={() => handleCopy(outputFormat === 'hex' ? encryptionResult.combinedHex : encryptionResult.combinedBase64, 'Ciphertext')}
                    className="p-1 rounded bg-slate-800 hover:text-white text-slate-400"
                    title="Copy Ciphertext"
                  >
                    {copiedField === 'Ciphertext' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 min-h-[110px] max-h-[160px] overflow-y-auto text-xs font-mono text-emerald-400 break-all leading-relaxed whitespace-pre">
              {encryptionResult ? (
                viewHexDump ? (
                  (() => {
                    const hex = encryptionResult.combinedHex;
                    const lines = [];
                    for (let i = 0; i < hex.length; i += 32) {
                      const chunkHex = hex.substring(i, i + 32);
                      const offset = (i / 2).toString(16).padStart(4, '0');
                      const hexBytes = (chunkHex.match(/.{1,2}/g) || []).join(' ');
                      let ascii = '';
                      for (let j = 0; j < chunkHex.length; j += 2) {
                        const code = parseInt(chunkHex.substring(j, j + 2), 16);
                        ascii += (code >= 32 && code <= 126) ? String.fromCharCode(code) : '.';
                      }
                      lines.push(`${offset}  ${hexBytes.padEnd(48, ' ')}  |${ascii}|`);
                    }
                    return lines.join('\n');
                  })()
                ) : (
                  outputFormat === 'hex' ? encryptionResult.combinedHex : encryptionResult.combinedBase64
                )
              ) : (
                <span className="text-slate-600 italic">No ciphertext generated yet. Click Encrypt to execute.</span>
              )}
            </div>

            {/* Cryptographic Wire Components Breakdown */}
            {encryptionResult && (
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 text-[11px] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {algorithm === 'AES' ? '96-bit Nonce (IV):' : '64-bit IV (CBC):'}
                  </span>
                  <span className="text-cyan-400 truncate max-w-[240px]">{encryptionResult.ivHex}</span>
                </div>
                {algorithm === 'AES' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">128-bit Auth Tag (GMAC):</span>
                    <span className="text-emerald-400 truncate max-w-[240px]">{encryptionResult.tagHex}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-800/60 pt-1">
                  <span className="text-slate-400">Payload Wire Length:</span>
                  <span className="text-slate-200">
                    {algorithm === 'AES' 
                      ? `${encryptionResult.rawCombinedBytes.length} bytes (12B IV + ${encryptionResult.cipherBytes.length}B Cipher + 16B Tag)`
                      : `${encryptionResult.combinedHex.length / 2} bytes (8B IV + Cipher)`
                    }
                  </span>
                </div>

                {/* Shannon Entropy Indicator */}
                <div className="flex justify-between border-t border-slate-800/60 pt-1 text-[10px]">
                  <span className="text-slate-400">Shannon Information Entropy:</span>
                  <span className="text-emerald-400 font-bold">
                    Plaintext: {calculateEntropy(plaintext)} bits/B → Ciphertext: {calculateEntropy(encryptionResult.rawCombinedBytes || encryptionResult.combinedHex)} / 8.000 bits/B
                  </span>
                </div>
              </div>
            )}

            {/* Educational Tamper Experiments Buttons */}
            {encryptionResult && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Educational Tamper Experiments:
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <button
                    onClick={handleTamperCiphertext}
                    className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 font-mono transition-colors"
                  >
                    Corrupt Cipher Byte
                  </button>
                  {algorithm === 'AES' ? (
                    <button
                      onClick={handleTamperTag}
                      className="p-1.5 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 font-mono transition-colors"
                    >
                      Corrupt Auth Tag
                    </button>
                  ) : (
                    <div className="p-1.5 text-center text-slate-500 italic">No tag in DES</div>
                  )}
                  <button
                    onClick={handleUseWrongKey}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
                  >
                    Use Wrong Key
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Decryption Controls & Verification */}
          <div className="p-5 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Unlock className="w-4 h-4 text-cyan-400" />
                Decrypted Plaintext
              </label>
              {decryptionResult && (
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  ⏱️ {formatTime(decryptionResult.executionTimeMs)}
                </span>
              )}
            </div>

            <div className={`p-3 rounded-xl border min-h-[90px] text-xs font-mono break-all leading-relaxed ${
              isMatch === true
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : isMatch === false
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 italic'
            }`}>
              {decryptedText || 'Awaiting decryption execution...'}
            </div>

            {/* Verification Match Badge */}
            {isMatch !== null && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                isMatch
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}>
                {isMatch ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cryptographic Verification Passed: Decrypted message matches original plaintext byte-for-byte.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Verification Failed: Decrypted output does NOT match original plaintext or was rejected.</span>
                  </>
                )}
              </div>
            )}

            {/* Decrypt Execution Button */}
            <button
              onClick={handleDecrypt}
              disabled={isDecrypting || !encryptionResult}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isDecrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Decrypting & Verifying MAC Tag...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Decrypt & Verify Integrity ({algorithm})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert Box if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Cryptographic Rejection / Security Alert:</span>
            <p className="leading-relaxed font-mono">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
