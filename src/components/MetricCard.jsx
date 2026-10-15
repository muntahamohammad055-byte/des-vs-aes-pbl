import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  badge, 
  badgeType = 'cyan', // cyan, rose, emerald, amber
  glow = false 
}) {
  const badgeStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };

  const glowStyles = glow 
    ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,254,0.12)]' 
    : 'border-slate-800 hover:border-slate-700';

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-b from-[#0f1b38]/70 to-[#0b1329]/90 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${glowStyles}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-cyan-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-slate-400 leading-normal">
          {subtext}
        </p>
      )}
    </div>
  );
}
