import React, { useState } from 'react';
import { 
  Eye, 
  Layers, 
  Shuffle, 
  ArrowRight, 
  Key, 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Sparkles,
  HelpCircle,
  Binary,
  Calculator
} from 'lucide-react';

// Complete FIPS 46-3 Standard S-Boxes 1 through 8
const DES_SBOXES = [
  // S1
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
  ],
  // S2
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
  ],
  // S3
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
  ],
  // S4
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
  ],
  // S5
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
  ],
  // S6
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
  ],
  // S7
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
  ],
  // S8
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
  ]
];

// AES Rcon values for rounds 1 to 10
const AES_RCON = ['0x01', '0x02', '0x04', '0x08', '0x10', '0x20', '0x40', '0x80', '0x1b', '0x36'];

// Sample 4x4 State Matrix for AES educational walkthrough
const SAMPLE_AES_STATE = [
  ['0x32', '0x88', '0x31', '0xe0'],
  ['0x43', '0x5a', '0x31', '0x37'],
  ['0xf6', '0x30', '0x98', '0x07'],
  ['0xa8', '0x8d', '0xa2', '0x34']
];

export default function VisualizationPage() {
  const [activeAlgo, setActiveAlgo] = useState('DES'); // 'DES' or 'AES'
  const [desRound, setDesRound] = useState(1); // 1 to 16
  const [aesRound, setAesRound] = useState(1); // 1 to 10
  const [aesStep, setAesStep] = useState(0); // 0: SubBytes, 1: ShiftRows, 2: MixColumns, 3: AddRoundKey

  // Interactive S-Box State
  const [selectedSBoxIdx, setSelectedSBoxIdx] = useState(0); // 0 to 7 (S1 to S8)
  const [sixBitInput, setSixBitInput] = useState('101011'); // 6-bit binary string

  // Compute S-Box row & col lookup dynamically
  const cleanSixBits = sixBitInput.replace(/[^01]/g, '').padEnd(6, '0').slice(0, 6);
  const sboxRow = parseInt(cleanSixBits[0] + cleanSixBits[5], 2); // outer bits b1 and b6
  const sboxCol = parseInt(cleanSixBits.slice(1, 5), 2); // inner bits b2 b3 b4 b5
  const currentSBoxTable = DES_SBOXES[selectedSBoxIdx];
  const sboxOutputValue = currentSBoxTable[sboxRow][sboxCol];
  const sboxOutputBinary = sboxOutputValue.toString(2).padStart(4, '0');

  // DES left shifts per round table (FIPS 46-3)
  const desShiftsPerRound = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Eye className="w-7 h-7 text-cyan-400" />
            Interactive Cryptographic Algorithm Visualizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Step-by-step visual exploration of internal round transformations, S-Boxes, and key schedules.
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveAlgo('DES')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeAlgo === 'DES'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DES: 16 Feistel Rounds
          </button>
          <button
            onClick={() => setActiveAlgo('AES')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeAlgo === 'AES'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AES: 4×4 SPN State Matrix
          </button>
        </div>
      </div>

      {/* Educational Notice Badge */}
      <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Conceptual Academic Model:</strong> This module illustrates the exact mathematical transformations prescribed by NIST FIPS 46-3 and FIPS 197. Real-world browser libraries encapsulate these operations internally for security and side-channel immunity.
        </span>
      </div>

      {/* DES Visualization Section */}
      {activeAlgo === 'DES' && (
        <div className="space-y-6">
          {/* Main Round Stepper Card */}
          <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-rose-400" />
                  DES Feistel Network Architecture (Round {desRound} of 16)
                </h2>
                <p className="text-xs text-slate-400">
                  Observe how the 64-bit block is split into L and R 32-bit registers and mixed with 48-bit subkey K_{desRound}.
                </p>
              </div>

              {/* Round Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDesRound(prev => Math.max(1, prev - 1))}
                  disabled={desRound === 1}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
                  title="Previous Round"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold text-rose-300 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30">
                  Round {desRound} / 16
                </span>
                <button
                  onClick={() => setDesRound(prev => Math.min(16, prev + 1))}
                  disabled={desRound === 16}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
                  title="Next Round"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feistel Diagram Visualization Canvas */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-6 text-xs font-mono">
              {/* Top Block: 64-bit Plaintext & IP */}
              <div className="text-center space-y-2">
                <div className="inline-block p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                  64-bit Input Block (Plaintext)
                </div>
                <div className="text-slate-500">↓ Initial Permutation (IP) ↓</div>
              </div>

              {/* L & R Registers */}
              <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
                {/* Left Half (L_i-1) */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-center space-y-2">
                  <span className="text-slate-400 text-[11px] block">Left Half (32 bits)</span>
                  <span className="text-rose-300 font-bold text-sm block">L_{desRound - 1}</span>
                  <div className="p-2 rounded bg-black/50 text-[10px] text-slate-400 truncate">
                    01001100 10100111 ...
                  </div>
                </div>

                {/* Right Half (R_i-1) */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-center space-y-2 shadow-[0_0_15px_rgba(0,242,254,0.05)]">
                  <span className="text-cyan-400 text-[11px] block">Right Half (32 bits)</span>
                  <span className="text-cyan-300 font-bold text-sm block">R_{desRound - 1}</span>
                  <div className="p-2 rounded bg-black/50 text-[10px] text-cyan-400 truncate">
                    11010010 01101101 ...
                  </div>
                </div>
              </div>

              {/* Feistel Round Function F Box */}
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
                  <span>Feistel Function F(R_{desRound - 1}, K_{desRound})</span>
                  <span className="text-[10px] text-slate-400">32 bits → Expands to 48 bits → Produces 32 bits</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-400 block">Expansion (E)</span>
                    <span className="text-white font-semibold">32 → 48 bits</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-400 block">Round Key XOR</span>
                    <span className="text-white font-semibold">⊕ K_{desRound} (48b)</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-400 block">8 S-Boxes</span>
                    <span className="text-cyan-400 font-semibold">48 → 32 bits</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-400 block">P-Permutation</span>
                    <span className="text-emerald-400 font-semibold">32-bit Shuffle</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-800/60">
                  Key Schedule for Round {desRound}: Circular Left Shift of {desShiftsPerRound[desRound - 1]} bit{desShiftsPerRound[desRound - 1] > 1 ? 's' : ''} → Permuted Choice 2 (PC-2)
                </div>
              </div>

              {/* Feistel Output Step */}
              <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto pt-2">
                {/* New Left Half */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">L_{desRound} = R_{desRound - 1}</span>
                  <span className="text-slate-200 text-xs font-bold">Direct Copy from Previous R</span>
                </div>

                {/* New Right Half */}
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center">
                  <span className="text-[10px] text-rose-300 block">R_{desRound} = L_{desRound - 1} ⊕ F(R, K)</span>
                  <span className="text-rose-200 text-xs font-bold">XOR with Function F Output</span>
                </div>
              </div>

              {/* Bottom Block: Final Permutation */}
              {desRound === 16 && (
                <div className="text-center space-y-2 pt-4 border-t border-slate-800">
                  <div className="text-slate-400 text-xs">Swap Halves (R16, L16) & Apply Final Permutation (FP / IP⁻¹)</div>
                  <div className="inline-block p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 font-bold">
                    64-bit Final DES Ciphertext Block
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive S-Box Explorer with Calculator */}
          <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  Interactive DES S-Box 1–8 Lookup Calculator
                </h3>
                <p className="text-xs text-slate-400">
                  Enter any 6 binary bits to observe outer bit row selection and inner bit column selection.
                </p>
              </div>

              {/* S-Box Selector */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {DES_SBOXES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSBoxIdx(i)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                      selectedSBoxIdx === i
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    S{i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Live 6-Bit Input & Output Evaluator */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono items-center">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">6-Bit Input (b1 b2 b3 b4 b5 b6):</label>
                <input
                  type="text"
                  maxLength={6}
                  value={sixBitInput}
                  onChange={(e) => setSixBitInput(e.target.value.replace(/[^01]/g, ''))}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-bold text-center tracking-widest text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1 text-slate-300 text-[11px]">
                <div>• Outer Bits (b1, b6): <span className="text-rose-300 font-bold">{cleanSixBits[0]}{cleanSixBits[5]}</span> → <strong>Row {sboxRow}</strong></div>
                <div>• Inner Bits (b2-b5): <span className="text-cyan-300 font-bold">{cleanSixBits.slice(1, 5)}</span> → <strong>Col {sboxCol}</strong></div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 block">4-Bit Substituted Output:</span>
                <span className="text-emerald-400 font-bold text-base font-mono">{sboxOutputValue} (0b{sboxOutputBinary})</span>
              </div>
            </div>

            {/* S-Box Matrix Grid with Dynamic Active Cell Highlight */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="p-2 text-left">S{selectedSBoxIdx + 1} Matrix</th>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <th key={i} className={`p-2 ${i === sboxCol ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400'}`}>
                        {i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentSBoxTable.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx === sboxRow ? 'bg-rose-950/30' : 'hover:bg-slate-800/30'}>
                      <td className={`p-2 text-left font-bold ${rIdx === sboxRow ? 'text-rose-300' : 'text-slate-400'}`}>
                        Row {rIdx}
                      </td>
                      {row.map((val, cIdx) => {
                        const isSelected = rIdx === sboxRow && cIdx === sboxCol;
                        return (
                          <td 
                            key={cIdx} 
                            className={`p-2 transition-all ${
                              isSelected 
                                ? 'bg-cyan-500 text-slate-950 font-extrabold rounded shadow-[0_0_10px_rgba(0,242,254,0.5)] scale-110' 
                                : 'text-slate-300'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AES Visualization Section */}
      {activeAlgo === 'AES' && (
        <div className="space-y-6">
          {/* Main AES Round Stepper */}
          <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  AES Rijndael Substitution-Permutation Network (Round {aesRound} of 10)
                </h2>
                <p className="text-xs text-slate-400">
                  Step through the four algebraic transformations of the 128-bit (4×4 Byte) State Matrix.
                </p>
              </div>

              {/* Round & Step Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAesRound(prev => Math.max(1, prev - 1))}
                  disabled={aesRound === 1}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
                  title="Previous Round"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-bold text-cyan-300 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                  Round {aesRound} / 10
                </span>
                <button
                  onClick={() => setAesRound(prev => Math.min(10, prev + 1))}
                  disabled={aesRound === 10}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
                  title="Next Round"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4 Steps Tabs within Round */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { step: 0, name: '1. SubBytes', desc: 'Non-linear S-Box substitution in GF(2^8)' },
                { step: 1, name: '2. ShiftRows', desc: 'Cyclic byte rotation of matrix rows' },
                { step: 2, name: '3. MixColumns', desc: 'Polynomial multiplication (Omitted in Rd 10)' },
                { step: 3, name: '4. AddRoundKey', desc: 'Bitwise XOR with 128-bit Expanded Round Key' }
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => setAesStep(s.step)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    aesStep === s.step
                      ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold block ${aesStep === s.step ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {s.name}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* State Matrix Canvas */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-8">
              {/* 4x4 State Grid */}
              <div className="space-y-2 text-center">
                <span className="text-xs font-mono font-bold text-slate-400 block">
                  128-bit (16-Byte) State Matrix S
                </span>
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-black/60 border border-cyan-500/30 font-mono text-xs shadow-inner">
                  {SAMPLE_AES_STATE.map((row, rIdx) => 
                    row.map((cell, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-14 h-12 flex items-center justify-center rounded-lg border font-bold transition-all ${
                          aesStep === 1 && rIdx === 1
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                            : aesStep === 2
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-slate-900 border-slate-800 text-cyan-300'
                        }`}
                      >
                        {cell}
                      </div>
                    ))
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Rows = bytes mod 4, Cols = bytes div 4
                </span>
              </div>

              {/* Transformation Explanation Box */}
              <div className="max-w-md space-y-3 text-xs text-slate-300 leading-relaxed">
                {aesStep === 0 && (
                  <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-cyan-300 text-sm font-mono block">Step 1: SubBytes (Confusion)</span>
                    <p>
                      Each byte S_{'{r,c}'} in the state matrix is independently mapped to an invertible 8-bit substitution S-Box. The S-Box is derived from multiplicative inversion in Galois Field GF(2^8) with irreducible polynomial m(x) = x^8 + x^4 + x^3 + x + 1, followed by an affine transformation over GF(2).
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono">
                      Guarantees non-linearity and thwarts differential cryptanalysis.
                    </p>
                  </div>
                )}

                {aesStep === 1 && (
                  <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-amber-300 text-sm font-mono block">Step 2: ShiftRows (Diffusion)</span>
                    <p>
                      Bytes in each row of the state are cyclically shifted to the left:
                    </p>
                    <ul className="list-disc list-inside font-mono text-[11px] text-slate-400 space-y-1">
                      <li>Row 0: Shifted by 0 positions (unmodified)</li>
                      <li>Row 1: Cyclically shifted left by 1 byte</li>
                      <li>Row 2: Cyclically shifted left by 2 bytes</li>
                      <li>Row 3: Cyclically shifted left by 3 bytes</li>
                    </ul>
                    <p className="text-[11px] text-amber-300">
                      Ensures the 4 bytes of each column are distributed to 4 distinct columns.
                    </p>
                  </div>
                )}

                {aesStep === 2 && (
                  <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-blue-300 text-sm font-mono block">Step 3: MixColumns (Complete Diffusion)</span>
                    <p>
                      Each column of 4 bytes is treated as a four-term polynomial over GF(2^8) and multiplied modulo (x^4 + 1) with the fixed polynomial a(x) = 0x03·x³ + 0x01·x² + 0x01·x + 0x02.
                    </p>
                    <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-cyan-400">
                      [s'0,c s'1,c s'2,c s'3,c]ᵀ = [[02 03 01 01],[01 02 03 01],[01 01 02 03],[03 01 01 02]] · [s0,c s1,c s2,c s3,c]ᵀ
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      Note: MixColumns is skipped in the final 10th round (for AES-128).
                    </p>
                  </div>
                )}

                {aesStep === 3 && (
                  <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-emerald-300 text-sm font-mono block">Step 4: AddRoundKey (Key Injection)</span>
                    <p>
                      A 128-bit Round Key generated by the Rijndael Key Schedule is XORed directly into the state matrix:
                    </p>
                    <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-emerald-400">
                      State_{'{r,c}'} = State_{'{r,c}'} ⊕ RoundKey_{'{r,c}'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Round Constant for Round {aesRound}: <strong className="text-cyan-300">{AES_RCON[aesRound - 1]}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Schedule Comparison Box */}
          <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              AES Key Expansion & Round Specification Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-cyan-300 font-bold block">AES-128:</span>
                <span className="text-slate-400 block">Key: 128 bits (4 words)</span>
                <span className="text-slate-400 block">Rounds: 10 rounds</span>
                <span className="text-slate-200 block">Expanded Keys: 11 keys (44 words)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-cyan-300 font-bold block">AES-192:</span>
                <span className="text-slate-400 block">Key: 192 bits (6 words)</span>
                <span className="text-slate-400 block">Rounds: 12 rounds</span>
                <span className="text-slate-200 block">Expanded Keys: 13 keys (52 words)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-cyan-300 font-bold block">AES-256:</span>
                <span className="text-slate-400 block">Key: 256 bits (8 words)</span>
                <span className="text-slate-400 block">Rounds: 14 rounds</span>
                <span className="text-slate-200 block">Expanded Keys: 15 keys (60 words)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
