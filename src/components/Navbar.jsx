import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Cpu, 
  BarChart3, 
  Activity, 
  Eye, 
  FlaskConical, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Menu, 
  X,
  Sun,
  Moon,
  GraduationCap
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, isDark, toggleTheme, onOpenVivaModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'encrypt-decrypt', label: 'Encrypt & Decrypt', icon: Lock },
    { id: 'benchmark', label: 'Benchmark', icon: Activity },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'security', label: 'Security Analysis', icon: Cpu },
    { id: 'visualization', label: 'Visualization', icon: Eye },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'tests', label: 'Tests', icon: CheckCircle2 }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b1329]/90 backdrop-blur-md border-b border-cyan-500/20 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,242,254,0.15)]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  DES vs AES
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PBL Project
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
                Performance & Security Comparison
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Controls: Viva Demo, Theme & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVivaModal}
              title="Professor Viva & Demonstration Center"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,242,254,0.15)] active:scale-95"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Viva Demo</span>
            </button>

            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0b1329] border-b border-cyan-500/20 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => { onOpenVivaModal && onOpenVivaModal(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mb-3"
          >
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            Professor Viva & Demonstration Center
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
