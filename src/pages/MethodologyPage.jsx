import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  Activity, 
  BarChart2, 
  FileCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function MethodologyPage() {
  const steps = [
    {
      step: '01',
      title: 'Sample Plaintext Generation',
      desc: 'Deterministic and pseudorandom buffer construction spanning exact byte thresholds (1 KB, 10 KB, 100 KB, 1 MB). The exact same byte array is fed into both DES and AES engines to ensure controlled experimental parity.'
    },
    {
      step: '02',
      title: 'Cryptographic Key Derivation',
      desc: 'Generation of cryptographically secure random keys via native window.crypto.getRandomValues(). AES keys are generated at 128, 192, and 256 bits; DES keys are generated as 64-bit blocks with 8 parity bits.'
    },
    {
      step: '03',
      title: 'JIT Compiler Warm-Up Phase',
      desc: 'Executing 2 unrecorded dummy runs prior to measurement. This triggers V8 / SpiderMonkey Just-In-Time optimization and warms browser memory caches, preventing initial JIT compile spikes from distorting measurements.'
    },
    {
      step: '04',
      title: 'Separate High-Resolution Timing',
      desc: 'Microsecond-accurate timing captured via performance.now(). Encryption and decryption routines are measured as independent phases. Key-generation and setup time is isolated and excluded from cipher throughput calculations.'
    },
    {
      step: '05',
      title: 'Multi-Iteration Statistical Sampling',
      desc: 'Each test configuration is repeated across multiple trials (default N=5). Outlier resistance is achieved by computing both the median (50th percentile) and mean with standard deviation.'
    },
    {
      step: '06',
      title: 'Throughput Calculation (MB/s)',
      desc: 'Throughput is calculated via the formula: Throughput = (Payload_Bytes / (1024 × 1024)) / (Execution_Time_ms / 1000). Both encryption and decryption throughputs are reported.'
    },
    {
      step: '07',
      title: 'Cryptographic Integrity Verification',
      desc: 'Decrypted plaintext buffers are verified byte-for-byte against the original input. For AES-GCM, the 128-bit authentication tag must validate before the trial is marked complete.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-cyan-400" />
            Scientific Experimental Methodology
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rigorous experimental protocols, error isolation methods, and statistical instrumentation frameworks.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-500/30 self-start sm:self-auto">
          Scientific Reproducibility Protocol
        </span>
      </div>

      {/* 7-Step Protocol Stepper */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Step-by-Step Experimental Procedure
          </h2>
          <p className="text-xs text-slate-400">
            Standard operating procedure implemented in the benchmark engine to ensure unbiased measurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-cyan-950 flex items-center justify-center font-mono font-bold text-cyan-400 text-xs border border-cyan-500/40">
                  {item.step}
                </span>
                <span className="font-bold text-white text-xs">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Scientific Distinction: Implementation vs Algorithm Benchmark */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-bold text-white">
            Critical Methodological Disclosure: Implementation Overhead vs Theoretical Algorithms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-300 font-mono">1. Native Web Crypto Hardware Acceleration</h3>
            <p>
              In modern browsers (Chrome, Firefox, Safari, Edge), the Web Crypto API (<code className="text-cyan-400">window.crypto.subtle</code>) invokes native browser engine binaries written in C++ or Rust (BoringSSL/NSS). These binaries directly execute specialized CPU assembly instructions:
            </p>
            <ul className="list-disc list-inside font-mono text-[11px] text-slate-400 space-y-0.5">
              <li>x86_64: Intel AES-NI & PCLMULQDQ instructions</li>
              <li>ARM64: ARMv8-A Cryptography Extensions & PMULL</li>
            </ul>
            <p className="text-[11px] text-emerald-400">
              Hardware instructions compute SubBytes, ShiftRows, and MixColumns in single CPU cycles with zero memory lookups.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-rose-300 font-mono">2. Software-Emulated DES in JavaScript</h3>
            <p>
              Because DES was deprecated by NIST before modern Web APIs were standardized, no native browser Web Crypto API supports single DES. Thus, DES is executed via <code className="text-rose-300">CryptoJS.DES</code>, running on the single-threaded JavaScript virtual machine (V8).
            </p>
            <p className="text-[11px] text-slate-400">
              The DES Feistel network relies on 64-bit bitwise shifts and 8 discrete S-Box table lookups, incurring JavaScript object boxing and garbage collection overhead.
            </p>
            <p className="text-[11px] text-amber-300">
              Therefore, measured differences reflect both algorithmic efficiency AND native hardware acceleration versus JavaScript software emulation.
            </p>
          </div>
        </div>
      </div>

      {/* Statistical Treatment Rationale */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          Statistical Robustness: Why Median & IQR Outperform Simple Mean
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed">
          Web browsers are non-deterministic execution environments subject to background OS scheduling, thread preemption, and sudden garbage collector (GC) invocations. 
          If a garbage collection sweep occurs during iteration 4 of an encryption trial, the execution time will spike dramatically. 
          While an arithmetic mean is sensitive to such single-trial spikes, the <strong>Median</strong> remains mathematically invariant to asymmetric outliers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Mean (Arithmetic Average)</span>
            <span className="text-cyan-300 font-bold text-sm">μ = (Σ xᵢ) / N</span>
            <span className="text-[10px] text-slate-500 block mt-1">Quantifies cumulative total work</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-center shadow-[0_0_15px_rgba(0,242,254,0.08)]">
            <span className="text-cyan-400 text-[10px] block">Median (50th Percentile)</span>
            <span className="text-white font-bold text-sm">x̃ = Midpoint Value</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Immune to Garbage Collector Spikes</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Sample Standard Deviation</span>
            <span className="text-slate-300 font-bold text-sm">s = √[Σ(xᵢ - μ)² / (N-1)]</span>
            <span className="text-[10px] text-slate-500 block mt-1">Measures measurement variance</span>
          </div>
        </div>
      </div>

      {/* Mathematical Formulations Section */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Formal Mathematical Formulations & Cryptographic Equations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Card 1: Feistel Equation */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-rose-300 font-bold block text-[11px]">1. DES Feistel Round Inversion:</span>
            <div className="p-2.5 rounded bg-black/60 text-rose-200 text-xs">
              L_i = R_{'{i-1}'} <br />
              R_i = L_{'{i-1}'} ⊕ P(S_boxes(E(R_{'{i-1}'}) ⊕ K_i))
            </div>
            <p className="text-[10px] text-slate-400">
              Where E is the 32→48 bit expansion, S_boxes is non-linear 48→32 bit substitution, and P is the 32-bit permutation.
            </p>
          </div>

          {/* Card 2: AES MixColumns Matrix */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-cyan-300 font-bold block text-[11px]">2. AES MixColumns Matrix in GF(2^8):</span>
            <div className="p-2.5 rounded bg-black/60 text-cyan-200 text-[11px]">
              [s'0,c] = [02 03 01 01] · [s0,c] <br />
              [s'1,c] = [01 02 03 01] · [s1,c] <br />
              [s'2,c] = [01 01 02 03] · [s2,c] <br />
              [s'3,c] = [03 01 01 02] · [s3,c]
            </div>
            <p className="text-[10px] text-slate-400">
              Evaluated over Galois Field modulo irreducible polynomial m(x) = x^8 + x^4 + x^3 + x + 1.
            </p>
          </div>

          {/* Card 3: Shannon Entropy */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-emerald-300 font-bold block text-[11px]">3. Shannon Information Entropy (bits/byte):</span>
            <div className="p-2.5 rounded bg-black/60 text-emerald-300 text-xs">
              H(X) = - Σ (P(x_i) · log2(P(x_i)))  [for i = 0 to 255]
            </div>
            <p className="text-[10px] text-slate-400">
              Measures byte distribution uniformity. Maximum value is 8.000 bits/byte for ideal cryptographic pseudo-randomness.
            </p>
          </div>

          {/* Card 4: Throughput Formula */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-amber-300 font-bold block text-[11px]">4. Cryptographic Throughput (MB/s):</span>
            <div className="p-2.5 rounded bg-black/60 text-amber-300 text-xs">
              Throughput = (Bytes / 1,048,576) / (Δt_ms / 1,000)
            </div>
            <p className="text-[10px] text-slate-400">
              Measures sustained continuous byte processing rate excluding key setup and memory allocation latency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
