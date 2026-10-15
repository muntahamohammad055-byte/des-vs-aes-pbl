import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  Lock, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Infinity as InfinityIcon,
  HelpCircle,
  Calculator
} from 'lucide-react';

export default function SecurityAnalysisPage() {
  const [bruteForceSpeedExponent, setBruteForceSpeedExponent] = useState(12); // 10^12 keys/sec (1 Trillion keys/sec)

  // Calculations for theoretical exhaustive key search
  // DES: 2^56 = 72,057,594,037,927,936 keys (~7.20576e16)
  // AES-128: 2^128 = ~3.40282e38 keys
  // AES-256: 2^256 = ~1.15792e77 keys
  const keysPerSec = Math.pow(10, bruteForceSpeedExponent);
  const desKeysTotal = Math.pow(2, 56);
  const desAverageSeconds = (desKeysTotal / 2) / keysPerSec; // Average 50% key search
  
  const formatExhaustiveTime = (seconds) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(1)} milliseconds`;
    if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} days`;
    if (seconds < 31536000 * 1000) return `${(seconds / 31536000).toFixed(1)} years`;
    const scientificYears = seconds / 31536000;
    return `${scientificYears.toExponential(2)} years`;
  };

  const securityMatrix = [
    {
      property: 'Full Algorithm Name',
      des: 'Data Encryption Standard',
      aes: 'Advanced Encryption Standard (Rijndael)'
    },
    {
      property: 'Standardization Year & Standard',
      des: '1977 (NIST FIPS PUB 46 / ANSI X3.92)',
      aes: '2001 (NIST FIPS PUB 197 / ISO/IEC 18033-3)'
    },
    {
      property: 'Effective Key Size',
      des: '56 bits (64-bit key input, but 8 bits used solely for byte parity)',
      aes: '128, 192, or 256 bits (all bits cryptographically effective)'
    },
    {
      property: 'Key Size Options',
      des: '1 fixed key length (56 effective bits)',
      aes: '3 standard options: 128, 192, and 256 bits'
    },
    {
      property: 'Cipher Block Size',
      des: '64 bits (8 bytes) — Vulnerable to Sweet32 collision attacks',
      aes: '128 bits (16 bytes) — Collision threshold exceeds exabytes'
    },
    {
      property: 'Internal Design Architecture',
      des: '16-Round Feistel Network (Half-block encryption per round)',
      aes: 'Substitution-Permutation Network (SPN over GF(2^8))'
    },
    {
      property: 'Rounds of Processing',
      des: '16 rounds (fixed)',
      aes: '10 rounds (128-bit), 12 rounds (192-bit), 14 rounds (256-bit)'
    },
    {
      property: 'Current Security Status',
      des: 'OBSOLETE & INSECURE (NIST FIPS 46-3 officially withdrawn)',
      aes: 'ACTIVE GLOBAL STANDARD (NIST approved for Top Secret data)'
    },
    {
      property: 'Theoretical Key-Space Size',
      des: '2^56 ≈ 7.2057 × 10^16 keys',
      aes: '2^128 (3.4 × 10^38) to 2^256 (1.15 × 10^77) keys'
    },
    {
      property: 'Resistance to Exhaustive Brute-Force',
      des: 'BROKEN in practice (Cracked in 1998 by EFF Deep Crack in 56 hours, now in minutes on cloud GPUs)',
      aes: 'UNBREAKABLE. Energy required to enumerate 2^128 keys exceeds thermal energy of our sun.'
    },
    {
      property: 'Resistance to Differential & Linear Attacks',
      des: 'Designed against differential cryptanalysis, but vulnerable to Matsui linear cryptanalysis (2^43 pairs)',
      aes: 'Mathematically proven resistant via Wide Trail Strategy designed by Daemen and Rijmen'
    },
    {
      property: 'Cryptographic Authenticated Integrity',
      des: 'None built-in (malleable in ECB/CBC mode without external HMAC)',
      aes: 'Galois/Counter Mode (GCM) provides integrated 128-bit AEAD tag'
    },
    {
      property: 'Hardware Implementation Efficiency',
      des: 'Optimized for 1970s discrete hardware gates; slow in 32/64-bit software',
      aes: 'Highly parallelizable; native CPU instructions (Intel AES-NI, ARMv8 Crypto)'
    },
    {
      property: 'Post-Quantum Resistance (Grover’s Algorithm)',
      des: '28-bit security margin — instantly solved on fault-tolerant quantum hardware',
      aes: 'AES-256 provides 128-bit post-quantum security margin (NIST PQC compliant)'
    },
    {
      property: 'Contemporary Recommended Role',
      des: 'Strictly educational and historical comparative analysis',
      aes: 'Mandatory standard for TLS 1.3, IPsec, SSH, WPA3, disk encryption & banking'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-7 h-7 text-cyan-400" />
            Comprehensive Security & Cryptanalysis Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative NIST standards comparison, structural cryptanalytic breakdown, and theoretical key-space thermodynamics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            DES: Withdrawn 2005
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            AES: Current Gold Standard
          </span>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Standardization & Cryptographic Property Comparison Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Evaluating structural parameters against official NIST Special Publications and ISO/IEC standards.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-[11px] text-slate-400">
                <th className="p-3.5 w-1/4">Cryptographic Property</th>
                <th className="p-3.5 w-3/8 text-rose-300 bg-rose-950/20 border-l border-r border-rose-500/20">
                  DES (Data Encryption Standard)
                </th>
                <th className="p-3.5 w-3/8 text-cyan-300 bg-cyan-950/20 border-r border-cyan-500/20">
                  AES (Advanced Encryption Standard)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {securityMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-200">
                    {item.property}
                  </td>
                  <td className="p-3.5 text-slate-300 bg-rose-950/10 border-l border-r border-slate-800/60 text-[11px] leading-relaxed">
                    {item.des}
                  </td>
                  <td className="p-3.5 text-slate-200 bg-cyan-950/10 border-r border-slate-800/60 text-[11px] leading-relaxed font-medium">
                    {item.aes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Theoretical Key Space & Brute Force Simulator */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              Theoretical Exhaustive Key Search (Brute-Force) Mathematical Model
            </h2>
            <p className="text-xs text-slate-400">
              Interactive simulator demonstrating why 56 bits fails while 128/256 bits resists the laws of physical computation.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
            Assumes 50% Average Key Space Exploration
          </span>
        </div>

        {/* Attacker Hashrate Slider */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">
              Simulated Attacker Compute Throughput:
            </span>
            <span className="font-mono text-cyan-300 font-bold bg-black/40 px-2.5 py-1 rounded border border-slate-700">
              10^{bruteForceSpeedExponent} keys/second ({keysPerSec.toExponential(0)} keys/s)
            </span>
          </div>

          <input
            type="range"
            min="6"
            max="18"
            step="1"
            value={bruteForceSpeedExponent}
            onChange={(e) => setBruteForceSpeedExponent(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>10^6 (1M/s: Standard PC)</span>
            <span>10^12 (1T/s: High-End GPU Rig)</span>
            <span>10^15 (1P/s: Bitcoin ASIC Cluster)</span>
            <span>10^18 (1E/s: Global Exascale Supercomputer)</span>
          </div>
        </div>

        {/* Crack Time Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* DES Crack Time */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-rose-950/30 to-slate-900 border border-rose-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-rose-300">DES (56-bit Key)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">FEASIBLE</span>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {formatExhaustiveTime(desAverageSeconds)}
            </div>
            <p className="text-[11px] text-slate-400">
              Total Keys: 2⁵⁶ ≈ 7.21 × 10¹⁶. Vulnerable to practical commodity brute force in real time.
            </p>
          </div>

          {/* AES-128 Crack Time */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-cyan-950/30 to-slate-900 border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-cyan-300">AES-128 (128-bit Key)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">IMPOSSIBLE</span>
            </div>
            <div className="text-2xl font-extrabold text-cyan-300 font-mono">
              ~5.39 × 10^{22 - bruteForceSpeedExponent} billion years
            </div>
            <p className="text-[11px] text-slate-400">
              Total Keys: 2¹²⁸ ≈ 3.40 × 10³⁸. Age of the Universe is only 1.38 × 10¹⁰ years!
            </p>
          </div>

          {/* AES-256 Crack Time */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-blue-950/30 to-slate-900 border border-blue-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-blue-300">AES-256 (256-bit Key)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">POST-QUANTUM</span>
            </div>
            <div className="text-2xl font-extrabold text-blue-300 font-mono">
              ~1.83 × 10^{61 - bruteForceSpeedExponent} billion years
            </div>
            <p className="text-[11px] text-slate-400">
              Total Keys: 2²⁵⁶ ≈ 1.15 × 10⁷⁷. Exceeds the number of fundamental atoms in our galaxy.
            </p>
          </div>
        </div>
      </div>

      {/* In-Depth Academic Justification: Why AES Replaced DES */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-cyan-400" />
          Technical Rationale: Why AES Succeeded DES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-300 font-mono">1. Key Length Exhaustion & The Deep Crack Machine</h3>
            <p>
              In 1976, Whitfield Diffie and Martin Hellman argued that a 56-bit key was too small. In July 1998, the Electronic Frontier Foundation (EFF) built "Deep Crack" for under $250,000, recovering a DES key in 56 hours using 1,856 custom search ASIC chips. Today, cloud-based hash cracking platforms achieve this in minutes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-300 font-mono">2. Block Size Deficiencies & The Sweet32 Vulnerability</h3>
            <p>
              DES’s 64-bit block size succumbs to the Birthday Paradox after encrypting approximately 2³² blocks (32 GB) under the same key. The Sweet32 attack (CVE-2016-2183) demonstrated practical plaintext recovery in 64-bit ciphers by exploiting CBC block collisions. AES uses 128-bit blocks, pushing the collision boundary to 2⁶⁴ blocks (~256 Exabytes).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-300 font-mono">3. Feistel Inefficiency vs SPN Galois Parallelism</h3>
            <p>
              DES’s Feistel round function encrypts only 32 bits per round, demanding 16 rounds to achieve sufficient confusion and diffusion. AES uses a Substitution-Permutation Network operating across all 16 bytes simultaneously via vectorizable byte tables and matrix multiplication in Galois Field GF(2⁸).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-300 font-mono">4. Modern Authenticated Encryption (AEAD)</h3>
            <p>
              Classical DES-CBC encrypts data but provides no message authentication. An active adversary can modify ciphertext blocks (bit-flipping attacks) or execute padding oracle attacks (Vaudenay attack). AES-GCM solves this natively by producing a 128-bit authentication tag via polynomial evaluation in GF(2¹²⁸).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
