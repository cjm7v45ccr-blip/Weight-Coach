import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  target?: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  progress?: number; // 0 to 100
  color?: "blue" | "emerald" | "amber" | "purple" | "rose" | "zinc";
  onClick?: () => void;
  className?: string;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  target,
  icon: Icon,
  trend,
  progress,
  color = "blue",
  onClick,
  className = "",
  badge,
}) => {
  const accentColors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    zinc: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  };

  const progressColors = {
    blue: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]",
    emerald: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
    amber: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
    purple: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]",
    rose: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
    zinc: "bg-zinc-400",
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-[#2a2a2a] hover:bg-[#0f0f0f] active:scale-[0.99]" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-1.5 rounded-lg border ${accentColors[color]}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">{label}</span>
        </div>
        {badge && (
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-white/50 border border-white/[0.06]">
            {badge}
          </span>
        )}
        {trend && (
          <span
            className={`text-[11px] font-mono flex items-center gap-0.5 ${
              trend.isNeutral
                ? "text-white/50"
                : trend.isPositive
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#ededed]">{value}</span>
        {target !== undefined && (
          <span className="text-xs font-mono text-white/40">/ {target}</span>
        )}
      </div>

      {subValue && <p className="text-xs text-white/50 mt-1">{subValue}</p>}

      {progress !== undefined && (
        <div className="w-full bg-[#161616] h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColors[color]}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};
