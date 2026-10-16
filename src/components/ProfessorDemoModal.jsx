import React, { useState } from 'react';
import { 
  GraduationCap, 
  X, 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Cpu, 
  Key, 
  FileCheck, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Flame,
  Layers,
  Lock
} from 'lucide-react';

export default function ProfessorDemoModal({ isOpen, onClose, setActivePage, onNotify }) {
  const [activeTab, setActiveTab] = useState('demos'); // 'demos', 'viva-qa', 'summary'
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Content copied for viva presentation.'
      });
    }
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const vivaQuestions = [
    {
      q: "1. Why does AES-192 use 12 rounds while AES-128 uses 10 and AES-256 uses 14?",
      a: "The number of rounds in AES is mathematically calibrated to ensure a secure margin against linear and differential cryptanalysis. Each round consists of SubBytes, ShiftRows, MixColumns, and AddRoundKey (except the final round). Because key expansion generates 4 words per round plus 4 words for pre-whitening: AES-128 expands 4 words to 44 words (10 rounds), AES-192 expands 6 words to 52 words (12 rounds, +20% overhead), and AES-256 expands 8 words to 60 words (14 rounds, +40% overhead)."
    },
    {
      q: "2. What is the effective key size of DES and why are 8 bits discarded?",
      a: "DES accepts a 64-bit key input, but exactly 8 bits (bits 8, 16, 24, 32, 40, 48, 56, 64) are discarded by Permuted Choice 1 (PC-1) as odd-parity check bits. This leaves an effective key length of only 56 bits (2⁵⁶ ≈ 7.21 × 10¹⁶ possible keys). In 1998, EFF's Deep Crack machine searched this entire space in 56 hours. Today, modern GPU clusters exhaust 56 bits in minutes."
    },
    {
      q: "3. What is the Sweet32 attack (CVE-2016-2183) and how does it relate to block size?",
      a: "By the Birthday Paradox, block collisions in CBC mode occur with 50% probability after encrypting approximately 2^(n/2) blocks, where n is block size. For DES (n = 64 bits), collisions occur after just 2³² blocks (approximately 32 GB of data under one key), allowing practical plaintext recovery. AES uses a 128-bit block size, pushing the collision boundary to 2⁶⁴ blocks (~256 Exabytes), eliminating Sweet32."
    },
    {
      q: "4. Why is AES-GCM preferred over unauthenticated modes like DES-CBC or AES-CBC?",
      a: "CBC mode provides confidentiality but zero integrity protection. An adversary can perform bit-flipping attacks or padding oracle attacks (Vaudenay attack). AES-GCM is an Authenticated Encryption with Associated Data (AEAD) standard (NIST SP 800-38D). It combines CTR mode encryption with Galois Message Authentication Code (GMAC) polynomial evaluation over GF(2¹²⁸), generating a 128-bit authentication tag that mathematically guarantees both confidentiality and authenticity."
    },
    {
      q: "5. Why must a fresh 96-bit nonce be generated for every AES-GCM encryption?",
      a: "Reusing the same (Key, Nonce) pair in AES-GCM is catastrophic (known as the 'Nonce-Disrespecting' attack). If two messages are encrypted under the same key and nonce, an attacker can XOR the ciphertexts to recover the XOR of the plaintexts, and can even derive the GHASH authentication subkey H, completely forging arbitrary tags."
    },
    {
      q: "6. What is the role of Galois Field GF(2⁸) in AES?",
      a: "AES operates on 8-bit bytes viewed as elements of the finite field GF(2⁸) modulo the irreducible polynomial m(x) = x⁸ + x⁴ + x³ + x + 1 (0x11B). SubBytes performs multiplicative inversion in GF(2⁸) followed by an affine transformation to prevent algebraic attacks. MixColumns performs matrix multiplication over GF(2⁸) to provide maximal branch diffusion across each 4-byte column."
    },
    {
      q: "7. Why is AES hardware accelerated while DES is not?",
      a: "Modern x86 and ARM processors include native vector instructions for AES (Intel AES-NI, ARMv8 Cryptography Extensions) that execute AES rounds directly in hardware pipelines. Because DES relies on bit-level permutations (Initial Permutation, Expansion E, Permutation P) designed for 1970s hardware wiring, it runs inefficiently on byte-oriented modern CPUs, making AES order-of-magnitude faster despite having double the block size."
    },
    {
      q: "8. How does our project handle the Chromium BoringSSL AES-192 limitation?",
      a: "NIST SP 800-38D specifies 128, 192, and 256-bit keys for AES. While Gecko (Firefox) and WebKit (Safari) support all three in Web Crypto API, Chromium's BoringSSL omits 192-bit Web Crypto. Our project detects browser capabilities dynamically: it executes native hardware Web Crypto where supported, and provides a seamless, 100% compliant 12-round SPN GMAC fallback in Chromium, ensuring universal cross-browser reliability."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1328] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Professor Viva & Demonstration Center
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PBL Defense Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                1-Click Preset Scenarios & Academic Viva Voce Reference
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('demos')}
            className={`px-4 py-2.5 font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'demos'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Guided Demonstrations (6 Scenarios)
          </button>

          <button
            onClick={() => setActiveTab('viva-qa')}
            className={`px-4 py-2.5 font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'viva-qa'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Viva Voce Q&A Cheat Sheet
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'summary'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Project Defense Summary
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GUIDED DEMONSTRATIONS */}
          {activeTab === 'demos' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-300">💡 Professor Presentation Tip:</span> Walk through these 6 demonstration scenarios sequentially during your project review. Each card takes you directly to the relevant working module with pre-loaded educational test data.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scenario 1: AES-192 Deep Dive */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-500/60 transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      SCENARIO 1 • 192-BIT AES
                    </span>
                    <span className="text-xs text-slate-400 font-mono">12 SPN Rounds</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    AES-192 Encryption & Roundtrip Verification
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Demonstrates AES with a 192-bit key (24 bytes / 48 hex characters) across 12 rounds. Generates fresh 96-bit nonce, 128-bit Galois MAC tag, measures execution timing, and validates byte-for-byte decryption.
                  </p>
                  <button
                    onClick={() => {
                      setActivePage('encrypt-decrypt');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold transition-all"
                  >
                    Launch AES-192 in Playground <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 2: Active Ciphertext & Tag Tampering */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-rose-500/30 hover:border-rose-500/60 transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      SCENARIO 2 • INTEGRITY
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Bit-Flipping Rejection</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                    Active Tampering & GMAC Rejection
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Demonstrates that modifying even 1 bit in AES-GCM ciphertext or authentication tag causes immediate cryptographic abort (DOMException), proving AEAD superiority over malleable DES-CBC.
                  </p>
                  <button
                    onClick={() => {
                      setActivePage('experiments');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-all"
                  >
                    Open Tampering Experiment <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 3: Real-Time Benchmark Race */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      SCENARIO 3 • THROUGHPUT
                    </span>
                    <span className="text-xs text-slate-400 font-mono">1KB to 1MB Scaling</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Hardware AES-NI vs Software DES Race
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Executes multi-trial benchmark comparing throughput (MB/s) and latency. Demonstrates why AES processes data orders of magnitude faster due to native CPU vector pipelines.
                  </p>
                  <button
                    onClick={() => {
                      setActivePage('benchmark');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all"
                  >
                    Open Live Benchmark Suite <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 4: Feistel vs SPN State Matrix */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      SCENARIO 4 • ALGORITHMIC
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Interactive Stepper</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    16 Feistel Rounds vs 4×4 State Matrix
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Interactive visualization of DES S-Box 6→4 bit non-linear substitution and 16 Feistel rounds side-by-side with AES SubBytes, ShiftRows, MixColumns over GF(2⁸), and AddRoundKey.
                  </p>
                  <button
                    onClick={() => {
                      setActivePage('visualization');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all"
                  >
                    Open Algorithm Visualizers <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 5: Astronomical Key Space & Sweet32 */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-blue-500/30 hover:border-blue-500/60 transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      SCENARIO 5 • CRYPTANALYSIS
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Exhaustive Search</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    Combinatorial Explosion & Sweet32 Collision
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Visualizes why DES's 56-bit key space (7.21 × 10¹⁶ keys) is trivial for modern hardware, while AES-192 with 6.27 × 10⁵⁷ keys exceeds all physical matter in our planet.
                  </p>
                  <button
                    onClick={() => {
                      setActivePage('security');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold transition-all"
                  >
                    Open Security Matrix <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scenario 6: Academic Defense Report */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      SCENARIO 6 • FORMAL REPORT
                    </span>
                    <span className="text-xs text-slate-400 font-mono">1-Click PDF Ready</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Complete PBL College Documentation
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full academic submission with editable authors, abstract, system architecture diagram, mathematical formulas, empirical conclusions, and one-click browser Print-to-PDF formatting.
                  </p>
                  <button
                    onClick={() => {
                      setActivePage('documentation');
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all"
                  >
                    View Academic Report <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIVA VOCE Q&A CHEAT SHEET */}
          {activeTab === 'viva-qa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Top 8 Technical Viva Questions with Model Answers</span>
                <span className="font-mono text-cyan-400 font-bold">Standard: NIST SP 800-38D / FIPS 197</span>
              </div>

              <div className="space-y-4">
                {vivaQuestions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs sm:text-sm font-bold text-cyan-300 font-mono">
                        {item.q}
                      </h4>
                      <button
                        onClick={() => handleCopy(`${item.q}\n\nAnswer: ${item.a}`, idx)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors flex-shrink-0"
                        title="Copy Q&A"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-cyan-500/40">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT DEFENSE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">
                      Project-Based Learning (PBL) Defense Executive Summary
                    </h3>
                    <span className="text-slate-400">DES vs AES: Performance and Security Comparison</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/30">
                    Grade A+ Target
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">DES Effective Key</span>
                    <span className="text-sm font-bold text-rose-400">56 Bits</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">AES Key Options</span>
                    <span className="text-sm font-bold text-cyan-400">128 / 192 / 256</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">AES-192 Rounds</span>
                    <span className="text-sm font-bold text-indigo-400">12 Rounds</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Integrity Mode</span>
                    <span className="text-sm font-bold text-emerald-400">128-bit GMAC</span>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <h4 className="font-bold text-white font-mono">Key Empirical & Theoretical Conclusions:</h4>
                  <ul className="space-y-1.5 list-disc pl-5">
                    <li><strong>Cryptographic Deprecation:</strong> DES is officially retired (FIPS 46-3 withdrawn 2005) because its 56-bit key space offers only 72 quadrillion keys, easily brute-forced on modern commodity hardware.</li>
                    <li><strong>Block Collision Immunity:</strong> DES's 64-bit block size suffers birthday collisions after 32 GB (Sweet32), while AES's 128-bit block size remains safe up to 256 Exabytes.</li>
                    <li><strong>Hardware Acceleration (AES-NI):</strong> Despite operating across 128-bit blocks and up to 14 rounds, AES outperforms DES by 5x to 20x in throughput due to hardware pipelining.</li>
                    <li><strong>AEAD Authenticated Encryption:</strong> AES-GCM guarantees non-malleability and tamper rejection via polynomial GHASH evaluation over GF(2¹²⁸), preventing classical bit-flipping attacks.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono hidden sm:inline">
            Engineering College PBL Project • Academic Defense Mode
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold transition-all ml-auto"
          >
            Close Presentation Mode
          </button>
        </div>

      </div>
    </div>
  );
}
