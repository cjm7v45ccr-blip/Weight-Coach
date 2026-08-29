import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: "blue" | "emerald" | "amber" | "purple" | "rose" | "cyan";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  unit?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = "blue",
  size = "md",
  showLabel = false,
  unit = "",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));

  const colorStyles = {
    blue: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]",
    emerald: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
    amber: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    purple: "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
    rose: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
    cyan: "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]",
  };

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono">
          <span className="text-gray-500">
            {value.toLocaleString()} {unit}
          </span>
          <span className="text-white/40">
            / {max.toLocaleString()} {unit}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
