import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Terminal, 
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import { exportToMarkdown, exportToText, triggerPrint } from '../utils/exportUtils';
import { formatTime, formatThroughput } from '../utils/formatters';

export default function DocumentationPage({ benchmarkResults, onNotify }) {
  const [copied, setCopied] = useState(false);
  const [studentName, setStudentName] = useState('Mohammad Muntaha Sadath');
  const [studentId, setStudentId] = useState('CSE-2025-PBL-042');
  const [institution, setInstitution] = useState('Department of Computer Science & Cybersecurity Engineering');
  const [mentorName, setMentorName] = useState('Dr. A. Sharma, Professor of Cybersecurity');
  const [submissionDate, setSubmissionDate] = useState('October 15, 2025');
  const [showMetaEdit, setShowMetaEdit] = useState(false);

  // Generate complete Academic Markdown Report Content
  const generateMarkdownReport = () => {
    return `# DES vs AES: Performance and Security Comparison
**Academic Project-Based Learning (PBL) Engineering Report**
*Author: ${studentName} (${studentId})*
*Supervisor: ${mentorName}*
*Institution: ${institution}*
*Date: ${submissionDate}*
*Standards Track: NIST FIPS 46-3, FIPS 197, NIST SP 800-38D*

---

## 1. Abstract
This Project-Based Learning (PBL) study presents a comparative empirical and theoretical analysis of two foundational symmetric-key cryptographic standards: the Data Encryption Standard (DES) and the Advanced Encryption Standard (AES). Through client-side software emulation of single DES alongside hardware-accelerated Web Crypto API implementations of AES-GCM (128, 192, and 256 bits), this project measures cryptographic throughput (MB/s), encryption/decryption latencies, and active tamper-detection behavior. The findings validate the theoretical necessity of deprecating DES due to its 56-bit key space vulnerability (crackable in hours) while proving AES-GCM's superiority in both computational throughput and Galois Message Authentication Code (GMAC) integrity assurance.

## 2. Introduction & Background
Symmetric-key cryptography provides the bedrock for global digital privacy, securing protocols such as Transport Layer Security (TLS 1.3), IPsec, and SSH. Historically, the National Bureau of Standards (now NIST) established DES in 1977 based on IBM's Lucifer cipher. As computational power escalated, DES's 56-bit key space proved inadequate. In 2001, NIST replaced DES with Rijndael, establishing the Advanced Encryption Standard (AES).

## 3. Problem Statement
Legacy systems frequently suffer from cryptographic rot—relying on obsolete 64-bit block ciphers with short keys that are vulnerable to collision attacks (Sweet32) and distributed brute-force recovery. Engineering students require concrete empirical evidence to understand why modern systems mandate authenticated encryption (AEAD) and how hardware instructions alter performance profiles.

## 4. Motivation & Objectives
- **Empirical Measurement:** Measure true execution latency and throughput differences between DES and AES across 1 KB, 10 KB, 100 KB, and 1 MB buffers.
- **Architectural Analysis:** Contrast the 16-round Feistel structure with the 4x4 byte Substitution-Permutation Network (SPN).
- **Integrity Demonstration:** Demonstrate how AES-GCM detects active ciphertext tampering, while unauthenticated DES fails silently with corrupted output.
- **Educational Tooling:** Deliver a fully client-side, zero-dependency browser workbench suitable for live engineering college demonstrations.

## 5. Scope & Limitations
- **Scope:** Symmetric block cipher analysis, client-side Web Cryptography API, Galois/Counter Mode (GCM), Feistel networks, key-space thermodynamics.
- **Limitations:** DES execution is emulated in single-threaded JavaScript, whereas AES utilizes native browser assembly with CPU hardware instruction extensions (AES-NI).

## 6. System Architecture
\`\`\`
[User Interface] 
      │ (Plaintext & Parameters)
      ▼
[Input Sanitization & UTF-8 Encoding]
      │
      ▼
[Cryptographic Engine Dispatcher]
 ├── Native Web Crypto API ──► AES-GCM (128 / 192 / 256-bit)
 └── CryptoJS Module      ──► DES-CBC (56 effective bits)
      │
      ▼
[High-Resolution Telemetry (performance.now())]
      │
      ▼
[Statistical Evaluation (Mean, Median, Min/Max, MB/s)]
      │
      ▼
[Visualization & Academic Report Export (CSV / JSON / PDF)]
\`\`\`

## 7. Mathematical & Algorithmic Breakdown
### 7.1 Data Encryption Standard (DES)
- Block Size: 64 bits; Effective Key: 56 bits (8 parity bits discarded via PC-1).
- 16 Feistel rounds: L_i = R_{i-1}, R_i = L_{i-1} ⊕ F(R_{i-1}, K_i).
- Round Function F: Expansion E (32->48 bits), Key XOR, 8 non-linear S-Boxes (48->32 bits), Permutation P.

### 7.2 Advanced Encryption Standard (AES)
- Block Size: 128 bits; Key Sizes: 128 (10 rounds), 192 (12 rounds), 256 bits (14 rounds).
- State Matrix: 4×4 byte array over Galois Field GF(2^8).
- Round Transformations: SubBytes (S-Box inversion), ShiftRows (cyclic shift), MixColumns (matrix multiplication in GF(2^8)), AddRoundKey.
- Authenticated Encryption: AES-GCM incorporates universal hashing over GF(2^128) producing a 128-bit authentication tag.

## 8. Empirical Test Cases & Verification Matrix
1. **Unicode Consistency:** Non-English characters, emojis, and symbols preserved byte-for-byte.
2. **Buffer Scaling:** Scaled evaluation across 1 KB, 10 KB, 100 KB, and 1 MB.
3. **Key Mismatch Rejection:** Wrong-key AES-GCM raises DOMException; wrong-key DES produces corrupted byte noise.
4. **Active Bit Tampering:** Modifying 1 bit of AES-GCM ciphertext or tag triggers immediate decryption abort.
5. **Fresh Nonce Validation:** Re-encrypting identical plaintext generates statistically distinct ciphertexts.

## 9. Measured Experimental Results
${benchmarkResults && benchmarkResults.length > 0 
  ? benchmarkResults.map(r => `- ${r.algorithm} (${r.sizeLabel}): Enc Avg = ${formatTime(r.encryption.avgMs)}, Dec Avg = ${formatTime(r.decryption.avgMs)}, Throughput = ${formatThroughput(r.encryption.throughputMBps)}`).join('\n')
  : '*No live benchmark has been recorded yet. Execute the Benchmark Suite in the application to automatically populate this section with real hardware timings.*'}

## 10. Conclusion & Recommendations
DES is fundamentally obsolete and insecure for production systems due to its 56-bit key space and 64-bit block size. AES-GCM is the definitive modern standard, offering post-quantum security margins (AES-256) and active integrity protection through its 128-bit Galois MAC tag.

## 11. Authoritative References
1. National Institute of Standards and Technology (NIST). (1999). *Data Encryption Standard (DES)*. FIPS PUB 46-3 (Withdrawn).
2. National Institute of Standards and Technology (NIST). (2001). *Advanced Encryption Standard (AES)*. FIPS PUB 197.
3. Dworkin, M. (2007). *Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)*. NIST Special Publication 800-38D.
4. McGrew, D., & Viega, J. (2008). *The Use of Galois/Counter Mode (GCM) in IPsec ESP*. RFC 4106.
5. Daemen, J., & Rijmen, V. (2002). *The Design of Rijndael: AES - The Advanced Encryption Standard*. Springer-Verlag.
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    exportToMarkdown(md);
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Downloaded Markdown Report',
        message: 'Saved complete academic documentation to your downloads.'
      });
    }
  };

  const handleDownloadText = () => {
    const md = generateMarkdownReport();
    exportToText(md);
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Downloaded Text Report',
        message: 'Saved plain text report to your downloads.'
      });
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Copied Report',
        message: 'Complete academic report copied to clipboard.'
      });
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-cyan-400" />
            Project Documentation & Presentation Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete academic project documentation ready for college evaluation, presentation, and thesis submission.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            Copy Markdown
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            .MD
          </button>

          <button
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            .TXT
          </button>

          <button
            onClick={() => setShowMetaEdit(!showMetaEdit)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-medium transition-colors"
          >
            {showMetaEdit ? 'Close Author Form' : 'Edit Author Details'}
          </button>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(0,242,254,0.2)]"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Author & Evaluator Metadata Editor Drawer */}
      {showMetaEdit && (
        <div className="no-print p-5 rounded-2xl bg-[#0b1329] border border-cyan-500/30 space-y-4 animate-in fade-in">
          <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider block">
            Customize Submission Header (Reflected in Print / PDF & Exports):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Student Author Name:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Roll / Enrollment ID:</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Faculty Mentor / Supervisor:</label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Department / Institution:</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Submission Date:</label>
              <input
                type="text"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Printable Document Paper Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0b1329] border border-slate-800 shadow-2xl space-y-10 text-slate-300 leading-relaxed text-xs sm:text-sm">
        {/* Title Section */}
        <div className="text-center pb-8 border-b border-slate-800 space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Engineering College Project-Based Learning (PBL) Report
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            DES vs AES: Performance and Security Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            {institution} • Academic Year 2024–2025
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs font-mono text-slate-300">
            <div>Student Author: <strong className="text-white">{studentName}</strong> ({studentId})</div>
            <span>•</span>
            <div>Faculty Mentor: <strong className="text-cyan-300">{mentorName}</strong></div>
            <span>•</span>
            <div>Date: <strong className="text-slate-400">{submissionDate}</strong></div>
          </div>
        </div>

        {/* Section 1: Abstract */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-cyan-300 font-mono flex items-center gap-2">
            1. Abstract
          </h2>
          <p className="text-slate-300 leading-relaxed text-justify">
            This study evaluates the performance, mathematical architecture, and cryptographic strength of the historical Data Encryption Standard (DES) alongside the modern Advanced Encryption Standard (AES). Through empirical telemetry captured directly within the browser client using native Web Cryptography APIs and discrete JavaScript software emulation, we evaluate encryption latency, decryption throughput, key generation overhead, and tamper-detection mechanisms across buffer sizes ranging from 1 KB to 1 MB. The experimental findings prove why DES was retired by NIST in 2005 due to its vulnerable 56-bit key space and highlight the decisive security and efficiency advantages of AES-GCM authenticated encryption.
          </p>
        </section>

        {/* Section 2: Problem Statement & Motivation */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-cyan-300 font-mono flex items-center gap-2">
            2. Problem Statement & Motivation
          </h2>
          <p className="text-slate-300 leading-relaxed">
            As global compute power has scaled via multi-core GPUs and dedicated ASIC clusters, legacy ciphers with short key lengths have become trivially breakable. The 56-bit key space of DES (≈ 7.2 × 10¹⁶ keys) can now be searched exhaustively in under 24 hours. Furthermore, DES’s 64-bit block size introduces birthday bound vulnerabilities (Sweet32) in high-throughput channels. Modern engineers require hands-on empirical experimentation to comprehend the transition from unauthenticated Feistel networks to hardware-accelerated, authenticated Substitution-Permutation Networks (AES-GCM).
          </p>
        </section>

        {/* Section 3: System Architecture Diagram */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-cyan-300 font-mono flex items-center gap-2">
            3. System Architecture & Component Interaction
          </h2>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400 overflow-x-auto">
            <pre className="leading-tight">
{`+-----------------------------------------------------------------------------------+
|                              User Interface (React / Tailwind)                    |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|               Input Validation & Unicode Character Normalization Engine           |
+-----------------------------------------------------------------------------------+
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
+---------------------------------------+   +---------------------------------------+
|  AES Engine: Web Crypto API (Subtle)  |   |    DES Engine: CryptoJS Implementation|
|  - AES-GCM (128 / 192 / 256 bits)     |   |    - DES-CBC (64-bit / 56 eff. bits)  |
|  - Fresh 96-bit Random Nonces         |   |    - 64-bit Block PKCS#7 Padding      |
|  - 128-bit Galois MAC Tag Generation  |   |    - 16-Round Feistel Inversion       |
+---------------------------------------+   +---------------------------------------+
                    │                                           │
                    └─────────────────────┬─────────────────────┘
                                          ▼
+-----------------------------------------------------------------------------------+
|               High-Resolution Telemetry Engine (performance.now())                |
|               - Warm-up Phase (JIT compiler stabilization)                        |
|               - Separate Encryption vs Decryption Timing Measurements             |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|               Statistical Analysis & Visual Export Pipeline                       |
|               - Mean, Median, Min, Max, StdDev, Throughput (MB/s)                 |
|               - Chart.js Visualizations & Export (CSV, JSON, Markdown, Print PDF) |
+-----------------------------------------------------------------------------------+`}
            </pre>
          </div>
        </section>

        {/* Section 4: Algorithm Comparative Analysis */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-cyan-300 font-mono flex items-center gap-2">
            4. Comparative Algorithmic Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-rose-300 font-mono text-sm">DES (Data Encryption Standard)</h3>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong>Standard:</strong> FIPS PUB 46-3 (1977, Withdrawn 2005)</li>
                <li>• <strong>Effective Key Size:</strong> 56 bits (8 parity bits discarded)</li>
                <li>• <strong>Block Size:</strong> 64 bits (8 bytes)</li>
                <li>• <strong>Internal Structure:</strong> 16-round Feistel Network</li>
                <li>• <strong>Round Function:</strong> 32-bit half expanded to 48 bits, XORed with round key, 8 S-Boxes (6→4 bits), 32-bit permutation</li>
                <li>• <strong>Integrity:</strong> None built-in (malleable without external HMAC)</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-cyan-300 font-mono text-sm">AES (Advanced Encryption Standard)</h3>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <strong>Standard:</strong> FIPS PUB 197 / NIST SP 800-38D (2001)</li>
                <li>• <strong>Effective Key Size:</strong> 128, 192, or 256 bits</li>
                <li>• <strong>Block Size:</strong> 128 bits (16 bytes)</li>
                <li>• <strong>Internal Structure:</strong> Substitution-Permutation Network (SPN)</li>
                <li>• <strong>Round Operations:</strong> SubBytes, ShiftRows, MixColumns over GF(2⁸), AddRoundKey</li>
                <li>• <strong>Integrity:</strong> Built-in 128-bit Galois MAC Tag (AEAD)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: Experimental Results */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-cyan-300 font-mono flex items-center gap-2">
            5. Empirical Benchmark Results & Discussion
          </h2>
          {benchmarkResults && benchmarkResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse border border-slate-800">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="p-2.5">Algorithm</th>
                    <th className="p-2.5">Input Size</th>
                    <th className="p-2.5">Enc Avg (ms)</th>
                    <th className="p-2.5">Enc Median</th>
                    <th className="p-2.5">Dec Avg (ms)</th>
                    <th className="p-2.5">Throughput (MB/s)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {benchmarkResults.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">{r.algorithm}</td>
                      <td className="p-2.5">{r.sizeLabel}</td>
                      <td className="p-2.5 text-cyan-300">{formatTime(r.encryption.avgMs)}</td>
                      <td className="p-2.5 text-slate-400">{formatTime(r.encryption.medianMs)}</td>
                      <td className="p-2.5 text-cyan-300">{formatTime(r.decryption.avgMs)}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{formatThroughput(r.encryption.throughputMBps)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs italic">
              Empirical data will dynamically populate here after running the Benchmark Suite in the application. Results are never fabricated.
            </div>
          )}
        </section>

        {/* Section 6: Authoritative NIST & IEEE References */}
        <section className="space-y-3 pt-4 border-t border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-cyan-300 font-mono flex items-center gap-2">
            6. References & Standards
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 font-mono">
            <li>
              National Institute of Standards and Technology. (1999). <em>Data Encryption Standard (DES)</em>. Federal Information Processing Standards Publication (FIPS PUB) 46-3. 
              <a href="https://csrc.nist.gov/publications/detail/fips/46-3/archive/1999-10-25" target="_blank" rel="noreferrer" className="text-cyan-400 ml-1 hover:underline inline-flex items-center gap-1">
                [NIST CSRC] <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              National Institute of Standards and Technology. (2001). <em>Advanced Encryption Standard (AES)</em>. Federal Information Processing Standards Publication (FIPS PUB) 197. 
              <a href="https://csrc.nist.gov/publications/detail/fips/197/final" target="_blank" rel="noreferrer" className="text-cyan-400 ml-1 hover:underline inline-flex items-center gap-1">
                [FIPS 197] <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Dworkin, M. (2007). <em>Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC</em>. NIST Special Publication 800-38D.
              <a href="https://csrc.nist.gov/publications/detail/sp/800-38d/final" target="_blank" rel="noreferrer" className="text-cyan-400 ml-1 hover:underline inline-flex items-center gap-1">
                [SP 800-38D] <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Bhargavan, K., & Leurent, G. (2016). <em>On the Practical (In-)Security of 64-bit Block Ciphers: The Sweet32 Birthday Attack</em>. ACM SIGSAC Conference on Computer and Communications Security (CCS).
            </li>
            <li>
              Electronic Frontier Foundation (EFF). (1998). <em>Cracking DES: Secrets of Encryption Research, Wiretap Politics & Chip Design</em>. O'Reilly & Associates.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
