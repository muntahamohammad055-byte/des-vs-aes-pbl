import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Lock, 
  Key, 
  Layers, 
  Cpu, 
  Activity, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal,
  Zap,
  BookOpen,
  FlaskConical
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import SideBySideCompare from '../components/SideBySideCompare';

export default function DashboardPage({ setActivePage, benchmarkResults }) {
  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1633] via-[#091124] to-[#060a14] border border-cyan-500/30 p-8 sm:p-12 shadow-[0_0_40px_rgba(0,242,254,0.06)]">
        {/* Cyber grid background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Academic Engineering Project-Based Learning (PBL)
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            DES vs AES: <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Performance & Security Comparison
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-3xl">
            A comprehensive, rigorous empirical study and interactive testbed comparing the historical 
            <span className="text-rose-400 font-semibold font-mono"> Data Encryption Standard (DES)</span> against the modern 
            <span className="text-cyan-300 font-semibold font-mono"> Advanced Encryption Standard (AES-GCM)</span>. 
            Evaluate live cryptographic throughput, examine algorithmic state transformations, and investigate why DES collapsed under brute-force attacks while AES remains impregnable.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActivePage('encrypt-decrypt')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
            >
              <Lock className="w-4 h-4" />
              Open Crypto Playground
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActivePage('benchmark')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 font-semibold text-sm hover:bg-slate-800 transition-all hover:border-cyan-400"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              Run Empirical Benchmarks
            </button>

            <button
              onClick={() => setActivePage('experiments')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-all hover:text-white"
            >
              <FlaskConical className="w-4 h-4 text-amber-400" />
              7 Guided Experiments
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Mandatory Security Warning Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-rose-900/40 to-slate-950 border-2 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.15)] flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-rose-900/60 border border-rose-500/60 text-rose-300 shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-rose-200">
              CRITICAL CRYPTOGRAPHIC ADVISORY: DES IS CRYPTOGRAPHICALLY OBSOLETE
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              NIST WITHDRAWN (FIPS 46-3)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
            The Data Encryption Standard (DES) possesses an effective key length of only <strong>56 bits</strong> (2⁵⁶ ≈ 7.2 × 10¹⁶ keys). 
            Modern GPU clusters and FPGA rigs can exhaustively brute-force a DES key in under <strong>24 hours</strong> for less than $100. 
            Furthermore, 64-bit blocks are vulnerable to birthday attacks (Sweet32). 
            <span className="underline decoration-rose-400 font-semibold"> DES is included in this academic PBL project solely for comparative historical and educational analysis. It must NEVER be deployed to secure sensitive production data.</span>
          </p>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="DES Key Length"
          value="56 bits"
          subtext="64-bit key with 8 parity bits discarded in PC-1 permutation."
          icon={Key}
          badge="VULNERABLE"
          badgeType="rose"
        />

        <MetricCard
          title="AES Key Lengths"
          value="128 / 192 / 256"
          subtext="Configurable key sizes supporting up to Top Secret classification."
          icon={Shield}
          badge="NIST STANDARD"
          badgeType="emerald"
          glow={true}
        />

        <MetricCard
          title="Block Sizes"
          value="64 vs 128 bits"
          subtext="DES uses 8-byte blocks; AES uses 16-byte blocks (mitigates Sweet32 collision)."
          icon={Layers}
          badge="2x CAPACITY"
          badgeType="cyan"
        />

        <MetricCard
          title="Integrity / Auth"
          value="AEAD (GCM)"
          subtext="AES-GCM includes 128-bit Galois MAC tag; DES has zero built-in integrity."
          icon={Cpu}
          badge="ACTIVE GMAC"
          badgeType="emerald"
        />
      </div>

      {/* Interactive Side-By-Side Comparison Panel */}
      <SideBySideCompare latestBenchmarkResults={benchmarkResults} />

      {/* Primer: Symmetric-Key Cryptography Foundations */}
      <div className="p-8 rounded-3xl bg-[#0b1329]/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold text-white">
              Symmetric-Key Cryptography Primer: Core Theoretical Foundations
            </h2>
            <p className="text-xs text-slate-400">
              Understanding why cryptographic architecture transitioned from Feistel networks to Substitution-Permutation Networks (SPN).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
          {/* Card 1: Feistel Network */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-sm">
              <span className="w-6 h-6 rounded-md bg-cyan-950 flex items-center justify-center border border-cyan-500/40 text-xs">1</span>
              Feistel Cipher Structure (DES)
            </div>
            <p>
              Invented by Horst Feistel at IBM, the Feistel structure divides the 64-bit plaintext into two 32-bit halves: Lᵢ and Rᵢ. 
              In each of the 16 rounds:
            </p>
            <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-cyan-400">
              L_i = R_{'{i-1}'} <br />
              R_i = L_{'{i-1}'} ⊕ F(R_{'{i-1}'}, K_i)
            </div>
            <p>
              Advantage: Encryption and decryption are structurally identical (the round function F does not need to be invertible). 
              Disadvantage: Only half the block is encrypted in each round, slowing diffusion across the entire block.
            </p>
          </div>

          {/* Card 2: Substitution-Permutation Network */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-sm">
              <span className="w-6 h-6 rounded-md bg-cyan-950 flex items-center justify-center border border-cyan-500/40 text-xs">2</span>
              SPN Architecture (AES Rijndael)
            </div>
            <p>
              Developed by Joan Daemen and Vincent Rijmen, AES operates on the entire 128-bit block simultaneously as a 4×4 byte State Matrix over Galois Field GF(2⁸).
            </p>
            <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-cyan-400">
              SubBytes → ShiftRows → MixColumns → AddRoundKey
            </div>
            <p>
              Every byte is substituted non-linearly via the S-Box and diffused across the entire block in a single round, achieving complete avalanche effect within 2 rounds.
            </p>
          </div>

          {/* Card 3: Authenticated Encryption (AEAD) */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-sm">
              <span className="w-6 h-6 rounded-md bg-cyan-950 flex items-center justify-center border border-cyan-500/40 text-xs">3</span>
              AEAD & Galois Counter Mode (GCM)
            </div>
            <p>
              Confidentiality alone does not prevent message tampering. In unauthenticated modes like DES-CBC, bit-flipping attacks can alter plaintext values undetected.
            </p>
            <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-emerald-400">
              Ciphertext + 128-bit Galois MAC Tag
            </div>
            <p>
              AES-GCM combines counter-mode stream encryption with universal hashing over GF(2¹²⁸) to guarantee both secrecy and active integrity verification.
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="p-8 rounded-3xl bg-[#0b1329]/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              PBL Application System Architecture
            </h2>
            <p className="text-xs text-slate-400">
              End-to-end data processing and measurement pipeline within the browser.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            Client-Side Isolation
          </span>
        </div>

        {/* Visual Pipeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {[
            { step: '01', title: 'User Input', desc: 'Plaintext & key selection', icon: '📝' },
            { step: '02', title: 'Validation', desc: 'Byte encoding & sanitization', icon: '🔍' },
            { step: '03', title: 'Engine Select', desc: 'Web Crypto vs CryptoJS DES', icon: '⚙️' },
            { step: '04', title: 'Execution', desc: 'Fresh Nonce & Cipher Ops', icon: '🔒' },
            { step: '05', title: 'Telemetry', desc: 'High-res performance.now()', icon: '⏱️' },
            { step: '06', title: 'Analysis', desc: 'Stats, median & throughput', icon: '📊' },
            { step: '07', title: 'Reporting', desc: 'Charts, CSV, JSON & PDF', icon: '📑' }
          ].map((item, idx) => (
            <div key={idx} className="relative p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold mb-0.5">STEP {item.step}</span>
              <span className="text-xs font-semibold text-slate-200">{item.title}</span>
              <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
