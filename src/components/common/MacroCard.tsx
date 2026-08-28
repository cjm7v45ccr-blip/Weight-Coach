import React from "react";

interface MacroCardProps {
  label: string;
  consumed: number;
  target: number;
  remaining: number;
  unit?: string;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple";
  className?: string;
}

export const MacroCard: React.FC<MacroCardProps> = ({
  label,
  consumed,
  target,
  remaining,
  unit = "g",
  color = "blue",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, target > 0 ? (consumed / target) * 100 : 0));

  const colorStyles = {
    blue: {
      bar: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
      badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    emerald: {
      bar: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
      badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    amber: {
      bar: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
      badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    rose: {
      bar: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
      badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    purple: {
      bar: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]",
      badge: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  };

  return (
    <div className={`p-3.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono uppercase text-white/50">{label}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${colorStyles[color].badge}`}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold font-mono text-[#ededed]">{Math.round(consumed)}</span>
          <span className="text-xs font-mono text-white/40">/ {target}{unit}</span>
        </div>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <div className="w-full bg-[#161616] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color].bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>{consumed}{unit} eaten</span>
          <span>{remaining}{unit} left</span>
        </div>
      </div>
    </div>
  );
};
