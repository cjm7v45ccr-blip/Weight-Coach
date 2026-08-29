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

  const barColors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    purple: "bg-purple-500",
  };

  return (
    <div className={`p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/50">{label}</span>
          <span className="text-[11px] font-medium text-white/40">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-white tracking-tight">{Math.round(consumed)}</span>
          <span className="text-xs text-white/40">/ {target}{unit}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColors[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-white/40">
          <span>{consumed}{unit}</span>
          <span>{remaining}{unit} left</span>
        </div>
      </div>
    </div>
  );
};
