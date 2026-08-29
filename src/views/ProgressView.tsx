import React, { useState } from "react";
import {
  TrendingUp,
  Plus,
  Scale,
  Calendar,
  Award,
  Sparkles,
  Target,
  Trash2,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useFitness } from "../context/FitnessContext";

interface ProgressViewProps {
  onOpenGoals: () => void;
  onOpenWeeklyReview: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  onOpenGoals,
  onOpenWeeklyReview,
}) => {
  const {
    weightEntries,
    addWeightEntry,
    deleteWeightEntry,
    weightTrendStats,
    userProfile,
    goals,
  } = useFitness();

  const todayStr = new Date().toISOString().split("T")[0];
  const [inputWeight, setInputWeight] = useState("");
  const [inputNotes, setInputNotes] = useState("");
  const [inputDate, setInputDate] = useState(todayStr);
  const [showLogModal, setShowLogModal] = useState(false);
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  // Filter and prepare chart data sorted by date
  const sortedEntries = [...weightEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filteredEntries = sortedEntries.filter((entry) => {
    if (timeframe === "ALL") return true;
    const entryDate = new Date(entry.date).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - entryDate) / (1000 * 3600 * 24);
    if (timeframe === "7D") return daysDiff <= 7;
    if (timeframe === "30D") return daysDiff <= 30;
    if (timeframe === "90D") return daysDiff <= 90;
    return true;
  });

  const chartData = filteredEntries.map((entry) => ({
    date: entry.date.slice(5),
    weight: entry.weight,
  }));

  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWeight) return;
    addWeightEntry(Number(inputWeight), inputDate || todayStr, inputNotes);
    setInputWeight("");
    setInputNotes("");
    setInputDate(todayStr);
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* 1. Header Banner */}
      <div className="crono-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200/80 bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Analytics & Body Metrics</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Progress & Weight Trends
          </h1>
          <p className="text-xs text-gray-500">
            Track 7-day rolling moving averages, body composition trends, and target deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenWeeklyReview}
            className="px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold transition-all"
          >
            Weekly Report
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            id="btn-progress-log-weight"
            className="px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SCORECARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="crono-card p-4 space-y-1 border border-gray-200/80 bg-white">
          <span className="text-xs text-gray-500 font-medium block">Current Weight</span>
          <p className="text-xl font-bold text-gray-900">{weightTrendStats.current} {userProfile.preferredUnits}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Latest weigh-in</span>
        </div>

        <div className="crono-card p-4 space-y-1 border border-gray-200/80 bg-white">
          <span className="text-xs text-gray-500 font-medium block">7-Day Moving Avg</span>
          <p className="text-xl font-bold text-gray-900">{weightTrendStats.sevenDayAvg} {userProfile.preferredUnits}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Trend baseline</span>
        </div>

        <div className="crono-card p-4 space-y-1 border border-gray-200/80 bg-white">
          <span className="text-xs text-gray-500 font-medium block">Target Goal</span>
          <p className="text-xl font-bold text-gray-900">{weightTrendStats.goal} {userProfile.preferredUnits}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {Math.abs(weightTrendStats.current - weightTrendStats.goal).toFixed(1)} {userProfile.preferredUnits} away
          </span>
        </div>

        <div className="crono-card p-4 space-y-1 border border-gray-200/80 bg-white">
          <span className="text-xs text-gray-500 font-medium block">30-Day Trajectory</span>
          <p className="text-xl font-bold text-gray-900">
            {weightTrendStats.thirtyDayChange > 0 ? "+" : ""}{weightTrendStats.thirtyDayChange} {userProfile.preferredUnits}
          </p>
          <span className="text-[11px] text-purple-600 font-semibold">Consistent rate</span>
        </div>
      </div>

      {/* 3. WEIGHT TREND CHART WITH TIMEFRAME FILTER */}
      <div className="crono-card p-5 sm:p-6 space-y-4 border border-gray-200/80 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">Weight Trajectory Chart</h2>
            <p className="text-xs text-gray-500">Smoothed trend timeline and weigh-in progression</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full text-xs font-bold">
            {(["7D", "30D", "90D", "ALL"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-full transition-all ${
                  timeframe === tf ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#0f172a",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#weightGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. ACTIVE GOALS SUMMARY */}
      <div className="crono-card p-5 sm:p-6 space-y-4 border border-gray-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Active Targets & Milestones
            </h3>
          </div>
          <button
            onClick={onOpenGoals}
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold"
          >
            Manage Targets &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const totalDelta = Math.abs(goal.targetValue - goal.startValue);
            const progressDelta = Math.abs(goal.currentValue - goal.startValue);
            const percent = totalDelta > 0 ? Math.min(100, Math.round((progressDelta / totalDelta) * 100)) : 100;

            return (
              <div key={goal.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">{goal.title}</span>
                  <span className="font-bold text-blue-600">{percent}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Current: {goal.currentValue} {goal.unit}</span>
                  <span>Target: {goal.targetValue} {goal.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. WEIGH-IN LOGS TABLE */}
      <div className="crono-card p-5 sm:p-6 space-y-4 border border-gray-200/80 bg-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
          Recent Weigh-In Logs
        </h3>

        <div className="space-y-2 divide-y divide-gray-100">
          {weightEntries.slice(0, 7).map((entry) => (
            <div key={entry.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900">{entry.weight} {userProfile.preferredUnits}</span>
                <span className="text-gray-500 ml-2">{entry.date}</span>
                {entry.notes && <span className="text-gray-500 ml-2 italic">"{entry.notes}"</span>}
              </div>
              <button
                onClick={() => deleteWeightEntry(entry.id)}
                className="p-1 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                title="Delete entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Log Weight Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Log New Body Weight</h3>
            <form onSubmit={handleLogWeightSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Weight ({userProfile.preferredUnits})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  placeholder="e.g. 178.4"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Date</label>
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="Morning, fasted..."
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
