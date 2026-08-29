import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Flame, Activity, Zap } from "lucide-react";

interface CronometerCalorieSummaryProps {
  consumed: number;
  burned: number;
  bmr: number;
  targetBudget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export const CronometerCalorieSummary: React.FC<CronometerCalorieSummaryProps> = ({
  consumed,
  burned,
  bmr,
  targetBudget,
  proteinGrams,
  carbsGrams,
  fatGrams,
}) => {
  const totalBurned = Math.round(bmr + burned);
  const remaining = Math.round(targetBudget - consumed);
  const energyBalance = Math.round(consumed - totalBurned);

  // Macro Energy Ratio
  const pCal = proteinGrams * 4;
  const cCal = carbsGrams * 4;
  const fCal = fatGrams * 9;
  const totalMacroCal = pCal + cCal + fCal || 1;

  const pRatio = Math.round((pCal / totalMacroCal) * 100);
  const cRatio = Math.round((cCal / totalMacroCal) * 100);
  const fRatio = Math.round((fCal / totalMacroCal) * 100);

  const pieData = [
    { name: "Protein", value: pCal || 1, color: "#2EC47D" },
    { name: "Carbs", value: cCal || 1, color: "#00C1D4" },
    { name: "Fat", value: fCal || 1, color: "#9B51E0" },
  ];

  return (
    <div className="crono-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Energy & Macronutrient Balance
        </h2>
        <span className="text-xs text-gray-500">
          Daily Budget: <strong className="text-gray-900 font-bold">{targetBudget} kcal</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Gauge 1: Energy Consumed vs Budget */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> Consumed
            </span>
            <span className="font-bold text-gray-900">{consumed} kcal</span>
          </div>

          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((consumed / targetBudget) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Target: {targetBudget}</span>
            <span className={remaining >= 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
              {remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over`}
            </span>
          </div>
        </div>

        {/* Gauge 2: Energy Burned (BMR + Exercise) */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" /> Total Burned
            </span>
            <span className="font-bold text-gray-900">{totalBurned} kcal</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-white border border-gray-100">
              <span className="text-gray-400 block text-[10px]">Basal (BMR)</span>
              <span className="font-bold text-gray-900">{bmr} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-gray-100">
              <span className="text-gray-400 block text-[10px]">Activity</span>
              <span className="font-bold text-gray-900">{burned} kcal</span>
            </div>
          </div>
        </div>

        {/* Gauge 3: Macro Distribution Chart */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <div className="w-20 h-20 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={22}
                  outerRadius={36}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 pl-3 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Protein
              </span>
              <span className="font-bold text-gray-900">{pRatio}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Net Carbs
              </span>
              <span className="font-bold text-gray-900">{cRatio}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Fat
              </span>
              <span className="font-bold text-gray-900">{fRatio}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
