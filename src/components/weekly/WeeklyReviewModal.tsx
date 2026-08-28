import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RotateCw,
  Award,
  ArrowRight,
  Flame,
  Loader2,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ isOpen, onClose }) => {
  const { latestWeeklyReview, generateWeeklyReview, userProfile } = useFitness();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateWeeklyReview();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#ededed]">Weekly Retrospective & Review</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  AI INSIGHTS
                </span>
              </div>
              <p className="text-xs text-white/40">
                {latestWeeklyReview ? latestWeeklyReview.weekRange : "Current Period"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metric Scorecard */}
          {latestWeeklyReview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase">Weight Delta</p>
                <p className="text-base font-bold font-mono text-[#ededed] mt-0.5">
                  {latestWeeklyReview.avgWeightChange > 0 ? "+" : ""}
                  {latestWeeklyReview.avgWeightChange} {userProfile.preferredUnits}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase">Workouts Done</p>
                <p className="text-base font-bold font-mono text-[#ededed] mt-0.5">
                  {latestWeeklyReview.completedWorkouts} / {latestWeeklyReview.targetWorkouts}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase">Protein Adherence</p>
                <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                  {latestWeeklyReview.proteinAdherencePercent}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-center">
                <p className="text-[10px] font-mono text-white/40 uppercase">Calorie Target</p>
                <p className="text-base font-bold font-mono text-blue-400 mt-0.5">
                  {latestWeeklyReview.calorieAdherencePercent}%
                </p>
              </div>
            </div>
          )}

          {/* What Went Well */}
          {latestWeeklyReview && latestWeeklyReview.whatWentWell.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">What Went Well</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-white/80">
                {latestWeeklyReview.whatWentWell.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What Could Improve */}
          {latestWeeklyReview && latestWeeklyReview.whatCouldImprove.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-amber-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Opportunities for Optimization</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-white/80">
                {latestWeeklyReview.whatCouldImprove.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Week Action Focus */}
          {latestWeeklyReview && latestWeeklyReview.nextWeekFocus.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-blue-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-blue-400">
                <ArrowRight className="w-4 h-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">High Leverage Targets for Next Week</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-white/80">
                {latestWeeklyReview.nextWeekFocus.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a1a1a] bg-[#0c0c0c] flex items-center justify-between">
          <p className="text-[11px] text-white/40 font-mono">
            Analyzed via Gemini AI Coach engine
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Logs...</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>Re-Analyze Week</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
