import React, { useState } from 'react';
import { Shield, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Zap, Info } from 'lucide-react';
import { formatTime, formatThroughput } from '../utils/formatters';

export default function SideBySideCompare({ latestBenchmarkResults }) {
  const [selectedAesVariant, setSelectedAesVariant] = useState('AES-256');

  // Extract latest measured benchmark results if present
  const desBenchmark = latestBenchmarkResults?.find(r => r.algorithm === 'DES' && !r.failed);
  const aesBenchmark = latestBenchmarkResults?.find(r => r.algorithm === selectedAesVariant && !r.failed);

  const aesData = {
    'AES-128': {
      keySize: '128 bits (16 bytes)',
      block: '128 bits (16 bytes)',
      rounds: '10 rounds',
      structure: 'Substitution-Permutation Network (SPN)',
      security: 'Active Standard (FIPS 197)',
      auth: 'Built-in 128-bit Galois MAC (GCM)',
      quantumSecurity: '~64 bits (Grover attack)',
      year: '2001'
    },
    'AES-192': {
      keySize: '192 bits (24 bytes)',
      block: '128 bits (16 bytes)',
      rounds: '12 rounds',
      structure: 'Substitution-Permutation Network (SPN)',
      security: 'Active Standard (FIPS 197)',
      auth: 'Built-in 128-bit Galois MAC (GCM)',
      quantumSecurity: '~96 bits (Grover attack)',
      year: '2001'
    },
    'AES-256': {
      keySize: '256 bits (32 bytes)',
      block: '128 bits (16 bytes)',
      rounds: '14 rounds',
      structure: 'Substitution-Permutation Network (SPN)',
      security: 'Active Top Secret Standard (NSA Suite B)',
      auth: 'Built-in 128-bit Galois MAC (GCM)',
      quantumSecurity: '~128 bits (Post-Quantum Secure against Grover)',
      year: '2001'
    }
  }[selectedAesVariant];

  return (
    <div className="p-6 rounded-2xl bg-[#0b1329]/90 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Side-by-Side Algorithm Comparison Panel
          </h3>
          <p className="text-xs text-slate-400">
            Compare architectural differences and live empirical metrics between DES and AES variants.
          </p>
        </div>

        {/* AES variant selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-700/60 self-start sm:self-auto">
          {['AES-128', 'AES-192', 'AES-256'].map(variant => (
            <button
              key={variant}
              onClick={() => setSelectedAesVariant(variant)}
              className={`px-3 py-1 text-xs font-mono rounded-md font-medium transition-all ${
                selectedAesVariant === variant
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: DES vs AES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DES Column */}
        <div className="p-5 rounded-xl bg-gradient-to-b from-rose-950/20 to-slate-900/60 border border-rose-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span className="font-bold text-white font-mono text-base">DES (Data Encryption Standard)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
              OBSOLETE / INSECURE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Standardization</span>
              <span className="text-slate-200 font-mono">1977 (FIPS 46-3)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Effective Key Size</span>
              <span className="text-rose-300 font-mono font-semibold">56 bits (64 bits with 8 parity bits)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Block Size</span>
              <span className="text-slate-200 font-mono">64 bits (8 bytes)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Design Architecture</span>
              <span className="text-slate-200">16-Round Feistel Network</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Theoretical Key Space</span>
              <span className="text-rose-300 font-mono">2^56 ≈ 7.20 × 10^16 keys</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Cryptographic Integrity</span>
              <span className="text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> None (Malleable)
              </span>
            </div>

            {/* Measured Results */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Empirical Benchmark ({desBenchmark ? desBenchmark.sizeLabel : 'No run yet'})</span>
              {desBenchmark ? (
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Enc Avg:</span>
                    <span className="text-slate-200 font-semibold">{formatTime(desBenchmark.encryption.avgMs)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dec Avg:</span>
                    <span className="text-slate-200 font-semibold">{formatTime(desBenchmark.decryption.avgMs)}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500 block">Throughput:</span>
                    <span className="text-amber-400 font-semibold">{formatThroughput(desBenchmark.encryption.throughputMBps)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-black/20 border border-slate-800 text-slate-500 text-center italic">
                  Run Benchmark suite to populate live timings
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AES Column */}
        <div className="p-5 rounded-xl bg-gradient-to-b from-cyan-950/20 to-slate-900/60 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white font-mono text-base">{selectedAesVariant}-GCM</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              RECOMMENDED STANDARD
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Standardization</span>
              <span className="text-slate-200 font-mono">2001 (FIPS 197 / SP 800-38D)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Effective Key Size</span>
              <span className="text-cyan-300 font-mono font-semibold">{aesData.keySize}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Block Size</span>
              <span className="text-slate-200 font-mono">128 bits (16 bytes)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Design Architecture</span>
              <span className="text-slate-200">{aesData.structure} ({aesData.rounds})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Theoretical Key Space</span>
              <span className="text-cyan-300 font-mono">
                {selectedAesVariant === 'AES-128' ? '2^128 ≈ 3.40 × 10^38' : selectedAesVariant === 'AES-192' ? '2^192 ≈ 6.27 × 10^57' : '2^256 ≈ 1.15 × 10^77'} keys
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Cryptographic Integrity</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> AEAD (128-bit Galois MAC Tag)
              </span>
            </div>

            {/* Measured Results */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Empirical Benchmark ({aesBenchmark ? aesBenchmark.sizeLabel : 'No run yet'})</span>
              {aesBenchmark ? (
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Enc Avg:</span>
                    <span className="text-cyan-300 font-semibold">{formatTime(aesBenchmark.encryption.avgMs)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dec Avg:</span>
                    <span className="text-cyan-300 font-semibold">{formatTime(aesBenchmark.decryption.avgMs)}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500 block">Throughput:</span>
                    <span className="text-emerald-400 font-semibold">{formatThroughput(aesBenchmark.encryption.throughputMBps)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-black/20 border border-slate-800 text-slate-500 text-center italic">
                  Run Benchmark suite to populate live timings
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="mt-5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3 text-xs text-cyan-200">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Engineering PBL Guidance:</span> DES was retired because its 56-bit key can be cracked via brute-force in less than a day by specialized hardware or distributed clusters. In contrast, AES-256 offers 2^256 keys—more than the estimated atoms in the observable universe. AES-GCM additionally guarantees message integrity through its Galois Field authentication tag, defeating ciphertext tampering attacks.
        </div>
      </div>
    </div>
  );
}
