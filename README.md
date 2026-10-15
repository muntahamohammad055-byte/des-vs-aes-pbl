# DES vs AES: Performance and Security Comparison
### Engineering College Project-Based Learning (PBL) Web Application

A fully functional, client-side, interactive cryptography engineering project comparing the historical **Data Encryption Standard (DES)** against the modern **Advanced Encryption Standard (AES-GCM)**. 

Built with **React.js**, **Vite**, **Tailwind CSS**, the **Web Crypto API (SubtleCrypto)**, **CryptoJS**, and **Chart.js**.

---

## 🚀 Live Features & Functional Modules

1. **Dashboard & Metric Overview**
   - Modern cybersecurity dark theme with cyan/blue accents and responsive metric cards.
   - Symmetric-key cryptography primer (Feistel Networks vs. Substitution-Permutation Networks).
   - Critical NIST security warning highlighting why DES is obsolete.
   - Interactive Side-by-Side comparison widget with live telemetry.

2. **Encryption & Decryption Playground**
   - Real, client-side encryption and decryption using genuine DES (64-bit / 56-bit effective) and AES-GCM (128, 192, and 256 bits).
   - Fresh 96-bit cryptographically secure random nonces (`crypto.getRandomValues()`) for every AES-GCM encryption.
   - 128-bit Galois Authentication Tag (GMAC) generation and verification.
   - Presets for plain English, multi-lingual Unicode (Arabic, Chinese, Japanese, Emoji), structured JSON, and large text.
   - Byte-for-byte decryption equality verification with visual match indicators.
   - Interactive tamper injection buttons: Corrupt ciphertext byte, Corrupt auth tag, or Invert to wrong key.

3. **Performance Benchmarking Suite**
   - Standardized input sizes: **1 KB**, **10 KB**, **100 KB**, **1 MB**, and custom buffer sizes (up to 5 MB).
   - Configurable measurement trials (3, 5, 10, 20) with automated JIT compiler warm-up runs.
   - High-resolution timing via `performance.now()`, measuring encryption and decryption separately.
   - Statistical calculations: Mean, Median, Min, Max, Standard Deviation, and Throughput (MB/s).
   - AbortController support for instant cancellation and live progress tracking.
   - One-click export to **CSV** and **JSON**.

4. **Performance & Key-Space Visualizations (Chart.js)**
   - Interactive responsive charts:
     - Encryption Time vs. Input Size
     - Decryption Time vs. Input Size
     - Throughput (MB/s) Comparison
     - AES Round Overhead (AES-128 10 rds vs. AES-192 12 rds vs. AES-256 14 rds)
     - Theoretical Key-Space Logarithmic Scale (\(2^{56}\) vs. \(2^{128}\) vs. \(2^{192}\) vs. \(2^{256}\))

5. **Security & Cryptanalysis Analysis**
   - NIST property comparison matrix covering standardization, key lengths, block dimensions, round functions, and attack resistance.
   - Interactive Exhaustive Brute-Force Key Search simulator modeling attacker hash rates from single PCs to exascale supercomputers.
   - In-depth theoretical rationale: Meet-in-the-middle attacks on 2DES, the Sweet32 birthday collision on 64-bit blocks, EFF Deep Crack history, and Grover's quantum algorithm impact.

6. **Interactive Algorithm Visualizer**
   - **DES:** Step-through the 64-bit input block, Initial Permutation (IP), 16 Feistel rounds with $L$ and $R$ registers, Expansion Permutation $E$, Key XOR, S-Boxes $S_1$–$S_8$ lookup matrix, Permutation $P$, and Final Permutation (FP).
   - **AES:** 128-bit State Matrix ($4 \times 4$ bytes), Initial AddRoundKey, SubBytes (S-Box in $\text{GF}(2^8)$), ShiftRows, MixColumns polynomial multiplication modulo $x^4 + 1$, and final AddRoundKey.

7. **7 Guided Laboratory Experiments**
   - **Exp 1:** Compare DES and AES-GCM wire formats and tag structures on identical plaintext.
   - **Exp 2:** Scale buffer sizes from 500 B to 200 KB and measure latency.
   - **Exp 3:** Quantify round overhead across AES-128, AES-192, and AES-256.
   - **Exp 4:** Demonstrate silent corruption in DES vs. cryptographic exception in AES-GCM under an unauthorized key.
   - **Exp 5:** Flip ciphertext and auth tag bits to demonstrate active Galois MAC integrity checking.
   - **Exp 6:** Calculate combinatorial explosion ratios between DES and AES key spaces.
   - **Exp 7:** Encrypt identical plaintext 4 times with AES-GCM to demonstrate semantic security (CPA resistance) via fresh nonces.

8. **Scientific Methodology & PBL Documentation**
   - Detailed experimental protocols and error isolation procedures.
   - Disclosures on browser hardware acceleration (AES-NI / ARMv8 Crypto Extensions) vs. JavaScript single-threaded DES emulation.
   - Full academic report with Abstract, Problem Statement, System Architecture, Experimental Results, and IEEE/NIST citations.
   - Downloadable as **Markdown (.MD)**, **Plain Text (.TXT)**, or formatted for browser **Print to PDF**.

9. **Automated Verification Test Suite**
   - 15 automated unit & integration test cases validating cryptographic round-trips, Unicode support, empty inputs, tamper detection, wrong key rejection, and nonce randomness.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 with Vite 6 |
| **Language** | JavaScript (ES2022 / JSX) |
| **Styling** | Tailwind CSS 3.4 (Cybersecurity Dark Navy theme) |
| **AES Cryptography** | Native Browser Web Crypto API (`window.crypto.subtle`) |
| **DES Cryptography** | Genuine single DES via CryptoJS (`CryptoJS.DES`) |
| **Data Visualization** | Chart.js 4.4 with React-Chartjs-2 |
| **Iconography** | Lucide React |
| **Telemetry** | High-resolution microsecond timer (`performance.now()`) |

---

## 📦 Local Setup & Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Navigate to Project Directory
\`\`\`bash
cd /Users/mohammadmuntahasadath/.gemini/antigravity/scratch/des-vs-aes-pbl
\`\`\`

### 2. Install Dependencies (if not already installed)
\`\`\`bash
npm install
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
The application will start immediately. Open your browser and navigate to:
\`\`\`
http://localhost:3000
\`\`\`

### 4. Build for Production
\`\`\`bash
npm run build
\`\`\`

### 5. Preview Production Build
\`\`\`bash
npm run preview
\`\`\`

---

## 📁 Project Directory Structure

\`\`\`
des-vs-aes-pbl/
├── index.html                   # HTML entry point with dark theme & fonts
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite bundler configuration (Port 3000)
├── tailwind.config.js           # Tailwind CSS cyberpunk theme palette
├── postcss.config.js            # PostCSS configuration
├── README.md                    # Comprehensive documentation
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Navigation, theme state, global benchmark state
│   ├── index.css                # Tailwind directives & print media styles
│   ├── components/
│   │   ├── Navbar.jsx           # Top navigation with 10 views & theme toggle
│   │   ├── Footer.jsx           # Academic credits, standards & privacy notice
│   │   ├── Notification.jsx     # Floating toast alert system
│   │   ├── MetricCard.jsx       # Reusable cyberpunk metric card
│   │   └── SideBySideCompare.jsx# Live comparison widget
│   ├── pages/
│   │   ├── DashboardPage.jsx    # Hero, primer, warning banner & architecture
│   │   ├── EncryptDecryptPage.jsx# Interactive live cryptographic playground
│   │   ├── BenchmarkPage.jsx    # Multi-size empirical benchmark engine
│   │   ├── ChartsPage.jsx       # Interactive Chart.js charts
│   │   ├── SecurityAnalysisPage.jsx # NIST matrix & brute force simulator
│   │   ├── VisualizationPage.jsx# Feistel & AES 4x4 State Matrix visualizers
│   │   ├── ExperimentsPage.jsx  # 7 guided PBL experiments
│   │   ├── MethodologyPage.jsx  # Scientific measurement protocols
│   │   ├── DocumentationPage.jsx# Complete academic report with PDF/MD export
│   │   └── TestPage.jsx         # 15 automated verification test cases
│   ├── services/
│   │   ├── cryptoAes.js         # Web Crypto AES-GCM (128/192/256-bit)
│   │   ├── cryptoDes.js         # Genuine DES (56-bit effective, CBC mode)
│   │   └── benchmarkService.js  # Multi-iteration timer, throughput & stats
│   └── utils/
│       ├── formatters.js        # Formatting for bytes, time (ms), throughput
│       └── exportUtils.js       # CSV, JSON, Markdown, and Print export helpers
\`\`\`

---

## 🔒 Security & Privacy Guarantee
- **100% Client-Side Processing**: Plaintext strings, secret keys, and nonces are processed entirely in memory within the user's browser.
- **Zero Network Transmission**: No sensitive cryptographic data or keys are transmitted to any external server.
- **Console Privacy**: Sensitive cryptographic materials are never printed to the browser developer console.
- **Educational Disclaimer**: This application demonstrates cryptographic principles for engineering education. DES is presented solely for historical comparison and must never be used to secure modern sensitive data.

---

## 📜 Standards & References
1. **NIST FIPS PUB 46-3**: Data Encryption Standard (DES) *(Withdrawn)*
2. **NIST FIPS PUB 197**: Advanced Encryption Standard (AES)
3. **NIST SP 800-38D**: Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)
4. **RFC 5116**: An Interface and Algorithms for Authenticated Encryption
5. **W3C Recommendation**: Web Cryptography API (`SubtleCrypto`)
