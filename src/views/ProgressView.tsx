import React, { useState } from "react";
import {
  TrendingUp,
  Plus,
  Scale,
  Calendar,
  Award,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useFitness } from "../context/FitnessContext";
import { MetricCard } from "../components/common/MetricCard";

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
    weightTrendStats,
    userProfile,
    goals,
    weeklyWorkoutConsistency,
  } = useFitness();

  const [inputWeight, setInputWeight] = useState("");
  const [inputNotes, setInputNotes] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);

  // Prepare chart data sorted by date
  const chartData = [...weightEntries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: entry.date.slice(5), // MM-DD
      weight: entry.weight,
    }));

  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWeight) return;
    addWeightEntry(Number(inputWeight), undefined, inputNotes);
    setInputWeight("");
    setInputNotes("");
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. HEADER */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                ANALYTICS & BODY COMPOSITION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#ededed]">
              Progress & Trend Analysis
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              Filtered 7-day rolling averages eliminate day-to-day water weight fluctuations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenWeeklyReview}
              className="px-4 py-2.5 rounded-xl bg-[#0f0f0f] hover:bg-[#161616] border border-[#1a1a1a] text-white/80 text-xs font-medium transition-all"
            >
              Weekly AI Review
            </button>

            <button
              onClick={() => setShowLogModal(true)}
              id="btn-progress-log-weight"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Weight</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS SCORECARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Current Weight"
          value={`${weightTrendStats.current} ${userProfile.preferredUnits}`}
          icon={Scale}
          color="blue"
          subValue="Latest log"
        />
        <MetricCard
          label="7-Day Rolling Avg"
          value={`${weightTrendStats.sevenDayAvg} ${userProfile.preferredUnits}`}
          icon={TrendingUp}
          color="emerald"
          subValue="Trend baseline"
        />
        <MetricCard
          label="Target Goal"
          value={`${weightTrendStats.goal} ${userProfile.preferredUnits}`}
          icon={Target}
          color="purple"
          subValue={`${Math.abs(weightTrendStats.current - weightTrendStats.goal).toFixed(1)} ${userProfile.preferredUnits} away`}
        />
        <MetricCard
          label="30-Day Change"
          value={`${weightTrendStats.thirtyDayChange > 0 ? "+" : ""}${weightTrendStats.thirtyDayChange} ${userProfile.preferredUnits}`}
          color={weightTrendStats.thirtyDayChange <= 0 ? "emerald" : "amber"}
          subValue="Total trajectory"
        />
      </div>

      {/* 3. WEIGHT TREND CHART */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#ededed]">Weight Trend Trajectory</h2>
            <p className="text-xs text-white/40">Tracking consistency across recent weigh-ins</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Weigh-ins</span>
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#ffffff40"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#ffffff40"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "#1f1f1f",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#ededed",
                }}
                labelStyle={{ color: "#ffffff70", fontFamily: "monospace" }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#weightGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. ACTIVE GOALS SUMMARY */}
      <section className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
              Active Milestones
            </h3>
            <p className="text-[11px] text-white/40">Long-term objectives and targets</p>
          </div>

          <button
            onClick={onOpenGoals}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Manage Goals →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const totalDelta = Math.abs(goal.targetValue - goal.startValue);
            const progressDelta = Math.abs(goal.currentValue - goal.startValue);
            const percent = totalDelta > 0 ? Math.min(100, Math.round((progressDelta / totalDelta) * 100)) : 100;

            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#ededed]">{goal.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/60">
                    {percent}%
                  </span>
                </div>
                <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Current: {goal.currentValue} {goal.unit}</span>
                  <span>Target: {goal.targetValue} {goal.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LOG WEIGHT MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-[#ededed]">Record Scale Weight</h3>
            <form onSubmit={handleLogWeightSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/70 block mb-1">
                  Weight ({userProfile.preferredUnits.toUpperCase()}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="181.4"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-sm font-mono text-[#ededed] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Morning fasted"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-xs text-[#ededed] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
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
