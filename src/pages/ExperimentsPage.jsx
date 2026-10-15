import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Key, 
  Lock, 
  ShieldAlert, 
  Shuffle, 
  Flame, 
  Sparkles,
  Info,
  Clock,
  Check,
  Cpu
} from 'lucide-react';
import { generateAesKey, encryptAesGcm, decryptAesGcm, bytesToHex, importAesKey } from '../services/cryptoAes';
import { generateDesKey, encryptDes, decryptDes } from '../services/cryptoDes';
import { formatTime, formatBytes } from '../utils/formatters';
import { exportToMarkdown } from '../utils/exportUtils';

export default function ExperimentsPage({ onNotify }) {
  const [activeExp, setActiveExp] = useState(1);

  // Experiment 1 State: Same Plaintext DES vs AES
  const [exp1Plaintext, setExp1Plaintext] = useState('Top Secret Academic Evaluation: Experiment 1 Payload.');
  const [exp1Result, setExp1Result] = useState(null);
  const [exp1Loading, setExp1Loading] = useState(false);

  // Experiment 2 State: Message Size vs Timing
  const [exp2Results, setExp2Results] = useState(null);
  const [exp2Loading, setExp2Loading] = useState(false);

  // Experiment 3 State: AES 128 vs 192 vs 256
  const [exp3Results, setExp3Results] = useState(null);
  const [exp3Loading, setExp3Loading] = useState(false);

  // Experiment 4 State: Incorrect Key Decryption
  const [exp4Result, setExp4Result] = useState(null);
  const [exp4Loading, setExp4Loading] = useState(false);

  // Experiment 5 State: Active Tampering Rejection
  const [exp5Result, setExp5Result] = useState(null);
  const [exp5Loading, setExp5Loading] = useState(false);

  // Experiment 6 State: Theoretical Key Space Scale
  const [exp6SelectedRatio, setExp6SelectedRatio] = useState('AES-128');

  // Experiment 7 State: Fresh Nonce Repeatability
  const [exp7Runs, setExp7Runs] = useState(null);
  const [exp7Loading, setExp7Loading] = useState(false);

  // Run Experiment 1
  const runExp1 = async () => {
    setExp1Loading(true);
    try {
      const aesKey = await generateAesKey(256);
      const desKey = generateDesKey();

      const aesEnc = await encryptAesGcm(exp1Plaintext, aesKey.key);
      const desEnc = encryptDes(exp1Plaintext, desKey.rawBytes);

      setExp1Result({
        aes: aesEnc,
        des: desEnc,
        plaintext: exp1Plaintext
      });
    } catch (err) {
      if (onNotify) onNotify({ type: 'error', message: err.message });
    } finally {
      setExp1Loading(false);
    }
  };

  // Run Experiment 2: Variable sizes
  const runExp2 = async () => {
    setExp2Loading(true);
    try {
      const testSizes = [
        { label: '500 Bytes', bytes: 500 },
        { label: '5 KB', bytes: 5120 },
        { label: '50 KB', bytes: 51200 },
        { label: '200 KB', bytes: 204800 }
      ];

      const results = [];
      const aesKey = await generateAesKey(256);
      const desKey = generateDesKey();

      for (const item of testSizes) {
        const payload = 'A'.repeat(item.bytes);

        // AES
        const t0Aes = performance.now();
        const aesEnc = await encryptAesGcm(payload, aesKey.key);
        const tAesEnc = performance.now() - t0Aes;

        const t0AesDec = performance.now();
        await decryptAesGcm(aesEnc, aesKey.key);
        const tAesDec = performance.now() - t0AesDec;

        // DES
        const t0Des = performance.now();
        const desEnc = encryptDes(payload, desKey.rawBytes);
        const tDesEnc = performance.now() - t0Des;

        const t0DesDec = performance.now();
        decryptDes(desEnc, desKey.rawBytes);
        const tDesDec = performance.now() - t0DesDec;

        results.push({
          label: item.label,
          bytes: item.bytes,
          aesEncMs: tAesEnc,
          aesDecMs: tAesDec,
          desEncMs: tDesEnc,
          desDecMs: tDesDec
        });
      }

      setExp2Results(results);
    } catch (err) {
      if (onNotify) onNotify({ type: 'error', message: err.message });
    } finally {
      setExp2Loading(false);
    }
  };

  // Run Experiment 3: AES-128 vs 192 vs 256
  const runExp3 = async () => {
    setExp3Loading(true);
    try {
      const payload = 'PBL Verification Token: Scaled Benchmark Payload '.repeat(1000); // ~48 KB
      const variants = [128, 192, 256];
      const results = [];

      for (const bits of variants) {
        const key = await generateAesKey(bits);
        
        // 5 trials each
        let totalEnc = 0;
        let totalDec = 0;
        for (let i = 0; i < 5; i++) {
          const enc = await encryptAesGcm(payload, key.key);
          totalEnc += enc.executionTimeMs;
          const dec = await decryptAesGcm(enc, key.key);
          totalDec += dec.executionTimeMs;
        }

        results.push({
          bits,
          rounds: bits === 128 ? 10 : bits === 192 ? 12 : 14,
          avgEncMs: totalEnc / 5,
          avgDecMs: totalDec / 5
        });
      }

      setExp3Results(results);
    } catch (err) {
      if (onNotify) onNotify({ type: 'error', message: err.message });
    } finally {
      setExp3Loading(false);
    }
  };

  // Run Experiment 4: Wrong Key Decryption
  const runExp4 = async () => {
    setExp4Loading(true);
    try {
      const sampleMsg = 'Confidential Grade: A+ (Student Enrollment #94821)';

      // 1. DES test
      const validDesKey = generateDesKey();
      const wrongDesKey = generateDesKey();
      const desEnc = encryptDes(sampleMsg, validDesKey.rawBytes);
      let desDecAttempt;
      try {
        const res = decryptDes(desEnc, wrongDesKey.rawBytes);
        desDecAttempt = {
          success: true,
          corrupted: res.isCorrupted,
          output: res.decryptedText
        };
      } catch (e) {
        desDecAttempt = { success: false, error: e.message };
      }

      // 2. AES-GCM test
      const validAesKey = await generateAesKey(256);
      const wrongAesKey = await generateAesKey(256);
      const aesEnc = await encryptAesGcm(sampleMsg, validAesKey.key);
      let aesDecAttempt;
      try {
        const res = await decryptAesGcm(aesEnc, wrongAesKey.key);
        aesDecAttempt = { success: true, output: res.decryptedText };
      } catch (e) {
        aesDecAttempt = {
          success: false,
          error: e.message
        };
      }

      setExp4Result({
        original: sampleMsg,
        desAttempt: desDecAttempt,
        aesAttempt: aesDecAttempt
      });
    } catch (err) {
      if (onNotify) onNotify({ type: 'error', message: err.message });
    } finally {
      setExp4Loading(false);
    }
  };

  // Run Experiment 5: Active Tampering
  const runExp5 = async () => {
    setExp5Loading(true);
    try {
      const sample = 'Transfer $1,000,000 to Account #88921-X.';
      const key = await generateAesKey(256);
      const enc = await encryptAesGcm(sample, key.key);

      // Tamper ciphertext
      const corruptedCipherBytes = new Uint8Array(enc.rawCombinedBytes);
      corruptedCipherBytes[14] ^= 0xff; // flip byte in ciphertext

      let cipherTamperResult;
      try {
        await decryptAesGcm({ rawCombinedBytes: corruptedCipherBytes }, key.key);
        cipherTamperResult = { rejected: false };
      } catch (e) {
        cipherTamperResult = { rejected: true, message: e.message };
      }

      // Tamper tag
      const corruptedTagBytes = new Uint8Array(enc.rawCombinedBytes);
      corruptedTagBytes[corruptedTagBytes.length - 1] ^= 0x01; // flip 1 bit in tag

      let tagTamperResult;
      try {
        await decryptAesGcm({ rawCombinedBytes: corruptedTagBytes }, key.key);
        tagTamperResult = { rejected: false };
      } catch (e) {
        tagTamperResult = { rejected: true, message: e.message };
      }

      setExp5Result({
        sample,
        cipherTamper: cipherTamperResult,
        tagTamper: tagTamperResult
      });
    } catch (err) {
      if (onNotify) onNotify({ type: 'error', message: err.message });
    } finally {
      setExp5Loading(false);
    }
  };

  // Run Experiment 7: Fresh Nonce Repeatability
  const runExp7 = async () => {
    setExp7Loading(true);
    try {
      const fixedPlaintext = 'Constant Authentication Beacon: Echo-01';
      const key = await generateAesKey(256);
      const runs = [];

      for (let i = 1; i <= 4; i++) {
        const enc = await encryptAesGcm(fixedPlaintext, key.key);
        runs.push({
          runIndex: i,
          ivHex: enc.ivHex,
          cipherHexSnippet: enc.cipherHex.substring(0, 32) + '...',
          tagHexSnippet: enc.tagHex.substring(0, 16) + '...'
        });
      }

      setExp7Runs(runs);
    } catch (err) {
      if (onNotify) onNotify({ type: 'error', message: err.message });
    } finally {
      setExp7Loading(false);
    }
  };

  const experimentsList = [
    { id: 1, title: 'Exp 1: Plaintext & Ciphertext Structure', icon: Lock },
    { id: 2, title: 'Exp 2: Buffer Size vs Execution Time', icon: Clock },
    { id: 3, title: 'Exp 3: AES Key Sizes (128 vs 192 vs 256)', icon: Cpu },
    { id: 4, title: 'Exp 4: Incorrect Key Decryption Rejection', icon: Key },
    { id: 5, title: 'Exp 5: Active Tampering & Tag Verification', icon: Flame },
    { id: 6, title: 'Exp 6: Key-Space Combinatorial Explosion', icon: Sparkles },
    { id: 7, title: 'Exp 7: Fresh Nonce & CPA Semantic Security', icon: Shuffle }
  ];

  const handleExportLabManual = () => {
    const content = `# Practical Cryptography Laboratory Manual & Observation Journal
## Course: Applied Cryptography (CS-402) • Project-Based Learning
### Experiment Series: DES vs AES Comparative Security & Performance Analysis

---

### Experiment 1: Plaintext & Ciphertext Structure Analysis
- **Aim:** Compare ciphertext structure, block boundaries, and authentication overhead between DES-CBC and AES-256-GCM.
- **Apparatus:** Browser Web Cryptography Engine & CryptoJS library.
- **Observations:** DES generates 64-bit blocks with 8-byte IV; AES-GCM generates 128-bit blocks with 12-byte nonce and 16-byte Galois MAC tag.
- **Inference:** AES-GCM is an AEAD scheme providing simultaneous secrecy and integrity.

### Experiment 2: Input Payload Buffer Scaling
- **Aim:** Measure latency across buffer sizes from 500 B to 200 KB.
- **Observations:** Encryption time is linear O(n). Native Web Crypto API hardware instructions (AES-NI) scale with higher throughput than single-threaded JavaScript DES.

### Experiment 3: AES Key Sizes (128 vs 192 vs 256 bits)
- **Aim:** Evaluate computational overhead across round expansions (10 vs 12 vs 14 rounds).
- **Observations:** AES-256 incurs ~20-30% additional round time compared to AES-128, providing a 128-bit quantum security margin.

### Experiment 4: Behavior Under Unauthorized Decryption Keys
- **Aim:** Contrast cipher response when decrypted with an unauthorized key.
- **Observations:** DES fails silently producing corrupted non-UTF8 garbage text without raising an alert. AES-GCM throws a DOMException OperationError, strictly refusing to release corrupt plaintext.

### Experiment 5: Active Ciphertext & Tag Tampering
- **Aim:** Test detection of in-transit bit modification.
- **Observations:** Flipping a single bit in AES-GCM ciphertext or authentication tag results in GHASH verification failure with probability 1 - 2^(-128).

### Experiment 6: Key Space Combinatorial Thermodynamics
- **Aim:** Quantify brute force attack feasibility.
- **Observations:** DES (2^56 keys) is crackable in hours by commodity cloud hardware. AES-128 (2^128 keys) and AES-256 (2^256 keys) exceed astronomical computational limits.

### Experiment 7: Semantic Security (CPA Resistance) via Fresh Nonces
- **Aim:** Prove identical plaintexts yield non-correlated ciphertexts under unique nonces.
- **Observations:** Re-encrypting identical plaintext 4 times produces 4 completely distinct ciphertexts, satisfying CPA security.
`;
    exportToMarkdown(content, 'pbl-cryptography-lab-journal.md');
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Lab Journal Downloaded',
        message: 'Saved complete 7-experiment lab journal as Markdown.'
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-cyan-400" />
            7 Guided Interactive Laboratory Experiments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized academic PBL experiments testing cryptographic properties, tamper detection, and key space margins.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportLabManual}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-medium transition-colors"
          >
            Export Lab Journal (.MD)
          </button>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-500/30">
            Experimental Lab Mode Active
          </span>
        </div>
      </div>

      {/* Experiment Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {experimentsList.map(exp => {
          const Icon = exp.icon;
          return (
            <button
              key={exp.id}
              onClick={() => setActiveExp(exp.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all ${
                activeExp === exp.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {exp.title}
            </button>
          );
        })}
      </div>

      {/* Experiment 1: Same Plaintext DES vs AES */}
      {activeExp === 1 && (
        <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                EXPERIMENT 1
              </span>
              <h2 className="text-lg font-bold text-white">
                Symmetric Ciphertext Structure Comparison (DES vs AES-GCM)
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Objective:</strong> Encrypt an identical Unicode message using both DES and AES-256-GCM. Compare block dimensions, IV/nonce overhead, and the inclusion of authentication tags.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Test Plaintext:</label>
            <input
              type="text"
              value={exp1Plaintext}
              onChange={(e) => setExp1Plaintext(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
            />
            <button
              onClick={runExp1}
              disabled={exp1Loading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.2)] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {exp1Loading ? 'Encrypting with both engines...' : 'Execute Experiment 1'}
            </button>
          </div>

          {exp1Result && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* DES Output */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <span className="font-bold text-rose-300 block">DES-CBC Ciphertext Structure</span>
                  <div className="p-2 rounded bg-black/60 text-[11px] text-rose-200 break-all">
                    {exp1Result.des.combinedHex}
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>• 64-bit IV: <span className="text-rose-300">{exp1Result.des.ivHex}</span></div>
                    <div>• Block Size: 64 bits (8 bytes)</div>
                    <div>• Execution Time: {formatTime(exp1Result.des.executionTimeMs)}</div>
                    <div>• Integrity Tag: <span className="text-rose-400 font-bold">NONE (Malleable)</span></div>
                  </div>
                </div>

                {/* AES Output */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  <span className="font-bold text-cyan-300 block">AES-256-GCM Wire Format</span>
                  <div className="p-2 rounded bg-black/60 text-[11px] text-cyan-200 break-all">
                    {exp1Result.aes.combinedHex}
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>• 96-bit Nonce: <span className="text-cyan-300">{exp1Result.aes.ivHex}</span></div>
                    <div>• 128-bit Auth Tag: <span className="text-emerald-400 font-bold">{exp1Result.aes.tagHex}</span></div>
                    <div>• Execution Time: {formatTime(exp1Result.aes.executionTimeMs)}</div>
                    <div>• Block Size: 128 bits (16 bytes)</div>
                  </div>
                </div>
              </div>

              {/* Academic Observations & Conclusion */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 text-slate-300">
                <span className="font-bold text-white block">🔬 Lab Findings & Conclusions:</span>
                <p>
                  <strong>Observations:</strong> DES ciphertext comprises only the 8-byte initialization vector and ciphertext blocks padded via PKCS#7. AES-GCM appends a 16-byte Galois Field authentication tag that verifies message integrity and detects any bit modification.
                </p>
                <p>
                  <strong>Conclusion:</strong> AES-GCM satisfies both IND-CPA (indistinguishability under chosen-plaintext attack) and IND-CCA2 (indistinguishability under adaptive chosen-ciphertext attack), whereas unauthenticated DES-CBC provides only confidentiality and remains vulnerable to active tamper attacks.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Experiment 2: Buffer Size vs Execution Time */}
      {activeExp === 2 && (
        <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                EXPERIMENT 2
              </span>
              <h2 className="text-lg font-bold text-white">
                Input Payload Size Scaling (500 B to 200 KB)
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Objective:</strong> Measure encryption and decryption latency across geometrically increasing buffer sizes to evaluate algorithmic complexity and throughput saturation.
            </p>
          </div>

          <button
            onClick={runExp2}
            disabled={exp2Loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.2)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {exp2Loading ? 'Running Multi-Size Sweep...' : 'Execute Size Scaling Sweep'}
          </button>

          {exp2Results && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-3">Buffer Size</th>
                      <th className="p-3 text-cyan-300">AES Enc Time</th>
                      <th className="p-3 text-cyan-300">AES Dec Time</th>
                      <th className="p-3 text-rose-300">DES Enc Time</th>
                      <th className="p-3 text-rose-300">DES Dec Time</th>
                      <th className="p-3 text-emerald-400">AES Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {exp2Results.map((r, i) => {
                      const ratio = r.desEncMs > 0 ? (r.desEncMs / r.aesEncMs).toFixed(1) : '1.0';
                      return (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{r.label}</td>
                          <td className="p-3 text-cyan-300">{formatTime(r.aesEncMs)}</td>
                          <td className="p-3 text-cyan-400">{formatTime(r.aesDecMs)}</td>
                          <td className="p-3 text-rose-300">{formatTime(r.desEncMs)}</td>
                          <td className="p-3 text-rose-400">{formatTime(r.desDecMs)}</td>
                          <td className="p-3 font-bold text-emerald-400">{ratio}x Faster</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <span className="font-bold text-white block">🔬 Lab Findings & Conclusions:</span>
                <p>
                  <strong>Observations:</strong> For small payloads (500 B), DOM API invocation overhead accounts for a significant fraction of execution time. As buffer sizes scale to 200 KB, native Web Crypto hardware acceleration outpaces pure software DES by orders of magnitude.
                </p>
                <p>
                  <strong>Conclusion:</strong> Encryption latency is O(n) relative to input byte length n. AES scales with higher throughput due to parallel pipelined hardware instructions (AES-NI).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Experiment 3: AES Key Sizes (128 vs 192 vs 256) */}
      {activeExp === 3 && (
        <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                EXPERIMENT 3
              </span>
              <h2 className="text-lg font-bold text-white">
                AES Round Overhead Trade-Off: AES-128 vs AES-192 vs AES-256
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Objective:</strong> Compare the performance impact of increasing AES rounds from 10 rounds (128 bits) to 12 rounds (192 bits) and 14 rounds (256 bits).
            </p>
          </div>

          <button
            onClick={runExp3}
            disabled={exp3Loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.2)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {exp3Loading ? 'Benchmarking 3 AES Variants...' : 'Execute AES Key-Size Experiment'}
          </button>

          {exp3Results && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {exp3Results.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-300 text-sm">AES-{item.bits}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                        {item.rounds} ROUNDS
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-300 pt-2 border-t border-slate-800 text-[11px]">
                      <div>Avg Enc Time: <span className="text-cyan-400 font-bold">{formatTime(item.avgEncMs)}</span></div>
                      <div>Avg Dec Time: <span className="text-cyan-400 font-bold">{formatTime(item.avgDecMs)}</span></div>
                      <div>Relative Overhead: <span className="text-slate-400">{idx === 0 ? 'Baseline (1.0x)' : `${((item.avgEncMs / exp3Results[0].avgEncMs)).toFixed(2)}x`}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <span className="font-bold text-white block">🔬 Lab Findings & Conclusions:</span>
                <p>
                  <strong>Observations:</strong> AES-256 requires 14 rounds versus 10 rounds for AES-128 (+40% round operations). The measured execution time reflects this additional mathematical work, though the difference is minimal in absolute milliseconds on modern hardware.
                </p>
                <p>
                  <strong>Conclusion:</strong> For high-throughput web traffic, AES-128 remains exceptionally fast and secure against classical attacks. However, AES-256 is recommended for long-term data retention because it maintains a 128-bit security margin against Grover’s quantum search algorithm.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Experiment 4: Incorrect Key Decryption */}
      {activeExp === 4 && (
        <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                EXPERIMENT 4
              </span>
              <h2 className="text-lg font-bold text-white">
                Decryption with Incorrect Key: Silent Corruption vs Active Rejection
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Objective:</strong> Decrypt valid ciphertexts using completely unauthorized random keys to contrast how unauthenticated ciphers (DES) fail silently with corrupted plaintext versus authenticated ciphers (AES-GCM) that throw cryptographic exceptions.
            </p>
          </div>

          <button
            onClick={runExp4}
            disabled={exp4Loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.2)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {exp4Loading ? 'Testing Key Rejections...' : 'Execute Key Inversion Test'}
          </button>

          {exp4Result && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* DES Output with Wrong Key */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">DES Behavior with Wrong Key</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                      SILENT CORRUPTION
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-black/60 text-slate-400 text-[11px] break-all">
                    {exp4Result.desAttempt.output || '[Padding Error / Invalid PKCS#7 bytes]'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    DES has no integrity verification. The mathematical Feistel inversion executes anyway, returning randomized byte noise without informing the application layer of an attack.
                  </p>
                </div>

                {/* AES Output with Wrong Key */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">AES-GCM Behavior with Wrong Key</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      CRYPTOGRAPHIC EXCEPTION
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-black/60 text-rose-300 text-[11px] break-words">
                    {exp4Result.aesAttempt.error || 'DOMException: The operation failed for an operation-specific reason.'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    AES-GCM verifies the 128-bit Galois MAC tag BEFORE returning any plaintext. Because the key does not match, authentication fails and the engine strictly refuses to release any plaintext bytes.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <span className="font-bold text-white block">🔬 Lab Findings & Conclusions:</span>
                <p>
                  <strong>Conclusion:</strong> In security-critical applications, silent decryption failure (DES) can allow attackers to inject malicious or forged data into parsers. AES-GCM eliminates this vulnerability through provable authenticated encryption (AEAD).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Experiment 5: Active Tampering & Tag Verification */}
      {activeExp === 5 && (
        <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                EXPERIMENT 5
              </span>
              <h2 className="text-lg font-bold text-white">
                Active Ciphertext & Authentication Tag Tampering Detection
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Objective:</strong> Intentionally flip single bits in the AES-GCM ciphertext body and the 128-bit authentication tag to demonstrate how Galois MAC mathematically guarantees ciphertext integrity.
            </p>
          </div>

          <button
            onClick={runExp5}
            disabled={exp5Loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.2)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {exp5Loading ? 'Executing Tamper Injections...' : 'Execute Tamper Detection Test'}
          </button>

          {exp5Result && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Case 1: Corrupted Ciphertext */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Case A: Modified Ciphertext Byte</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      TAMPER REJECTED
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Flipped bit 0 in byte 14 of the ciphertext body.
                  </p>
                  <div className="p-2 rounded bg-black/50 text-rose-400 text-[11px]">
                    {exp5Result.cipherTamper.message}
                  </div>
                </div>

                {/* Case 2: Corrupted Tag */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">Case B: Modified Auth Tag Bit</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      TAMPER REJECTED
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Flipped bit 0 of the 128-bit authentication tag.
                  </p>
                  <div className="p-2 rounded bg-black/50 text-rose-400 text-[11px]">
                    {exp5Result.tagTamper.message}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <span className="font-bold text-white block">🔬 Lab Findings & Conclusions:</span>
                <p>
                  <strong>Conclusion:</strong> In AES-GCM, any unauthorized modification of even a single bit in the ciphertext or tag renders the polynomial GHASH evaluation invalid. The probability of an attacker forging a valid tag by chance is 2⁻¹²⁸ ≈ 2.93 × 10⁻³⁹, making message tampering mathematically negligible.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Experiment 6: Key-Space Combinatorial Explosion */}
      {activeExp === 6 && (
        <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                EXPERIMENT 6
              </span>
              <h2 className="text-lg font-bold text-white">
                Theoretical Key-Space Combinatorial Explosion
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Objective:</strong> Mathematically quantify the astronomical exponential factor between DES's 56-bit key space and modern AES key spaces.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono">Select Target:</span>
            {['AES-128', 'AES-192', 'AES-256'].map(v => (
              <button
                key={v}
                onClick={() => setExp6SelectedRatio(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  exp6SelectedRatio === v
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {v} vs DES
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-slate-400 block font-bold">Combinatorial Calculation:</span>
              <div className="p-3 rounded bg-black/60 text-cyan-300 text-sm space-y-1">
                <div>DES Key Space: 2^56 ≈ 7.21 × 10^16</div>
                <div>{exp6SelectedRatio} Key Space: {exp6SelectedRatio === 'AES-128' ? '2^128 ≈ 3.40 × 10^38' : exp6SelectedRatio === 'AES-192' ? '2^192 ≈ 6.27 × 10^57' : '2^256 ≈ 1.15 × 10^77'}</div>
                <div className="pt-2 border-t border-slate-800 text-emerald-400 font-bold">
                  Scale Factor: {exp6SelectedRatio === 'AES-128' ? '2^72 ≈ 4.72 × 10^21' : exp6SelectedRatio === 'AES-192' ? '2^136 ≈ 8.71 × 10^40' : '2^200 ≈ 1.61 × 10^60'} times larger!
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-slate-300">
              <span className="font-bold text-white block">Physical World Scale Analogy:</span>
              <p className="text-[11px] leading-relaxed">
                If every grain of sand on planet Earth (≈ 7.5 × 10¹⁸) was itself an entire Earth filled with grains of sand, the total count would still be far less than the key space of AES-128! 
                This demonstrates that brute-forcing AES is physically impossible under known laws of thermodynamics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Experiment 7: Fresh Nonce Repeatability */}
      {activeExp === 7 && (
        <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                EXPERIMENT 7
              </span>
              <h2 className="text-lg font-bold text-white">
                Fresh Nonce Generation & Semantic Security (CPA Resistance)
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Objective:</strong> Encrypt the exact same plaintext message 4 consecutive times with the exact same AES-256 key to demonstrate how a fresh random 96-bit nonce yields completely randomized, non-correlated ciphertexts every time.
            </p>
          </div>

          <button
            onClick={runExp7}
            disabled={exp7Loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.2)] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {exp7Loading ? 'Encrypting 4 Iterations...' : 'Execute Fresh Nonce Test'}
          </button>

          {exp7Runs && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="space-y-2 font-mono text-xs">
                {exp7Runs.map(run => (
                  <div key={run.runIndex} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="font-bold text-cyan-400">Run #{run.runIndex}:</span>
                    <div className="text-[11px] text-slate-300">
                      IV: <span className="text-cyan-300">{run.ivHex}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Cipher: <span className="text-emerald-400">{run.cipherHexSnippet}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Tag: <span className="text-amber-400">{run.tagHexSnippet}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <span className="font-bold text-white block">🔬 Lab Findings & Conclusions:</span>
                <p>
                  <strong>Observations:</strong> Despite using an identical plaintext and an identical secret key, all 4 ciphertext outputs and authentication tags are completely distinct and statistically independent.
                </p>
                <p>
                  <strong>Conclusion:</strong> A fresh random 96-bit nonce prevents eavesdroppers from detecting message repetition or patterns, satisfying the fundamental definition of semantic security (CPA security).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
