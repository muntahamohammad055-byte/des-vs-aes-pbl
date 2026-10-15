import React from 'react';
import { Shield, ExternalLink, Lock, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print bg-[#070b14] border-t border-slate-800 text-slate-400 text-xs py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Col 1: Project Overview */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200 text-sm">DES vs AES PBL Project</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              An Engineering College Project-Based Learning (PBL) application exploring symmetric key cryptography, comparing legacy DES (56-bit Feistel) against modern AES-GCM (128/192/256-bit SPN) with live browser-based execution and timing measurements.
            </p>
          </div>

          {/* Col 2: Academic Standards & References */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200 text-sm">Standards Compliance</span>
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <span className="text-cyan-400 font-mono">FIPS 46-3:</span> Data Encryption Standard (Withdrawn by NIST)
              </li>
              <li>
                <span className="text-cyan-400 font-mono">FIPS 197:</span> Advanced Encryption Standard (AES)
              </li>
              <li>
                <span className="text-cyan-400 font-mono">NIST SP 800-38D:</span> Galois/Counter Mode (AES-GCM)
              </li>
              <li>
                <span className="text-cyan-400 font-mono">Web Cryptography API:</span> W3C Recommendation
              </li>
            </ul>
          </div>

          {/* Col 3: Privacy & Security Statement */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold text-slate-200 text-sm">Security & Privacy Assurance</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              100% Client-Side Execution. Plaintext messages, secret keys, and nonces are processed entirely within your browser via native Web Crypto API and CryptoJS. No sensitive cryptographic material is ever logged to the console, stored in persistent cookies, or transmitted to any remote server.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2025 Engineering College Project-Based Learning • Department of Computer Science & Cybersecurity Engineering</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-cyan-400/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Client Cryptographic Engine Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
