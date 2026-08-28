import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  User,
  Zap,
  Target,
  Dumbbell,
  Utensils,
  Flame,
  ArrowRight,
} from "lucide-react";
import Markdown from "react-markdown";
import { useFitness } from "../context/FitnessContext";

export const CoachView: React.FC = () => {
  const {
    aiMessages,
    sendMessageToCoach,
    isAiResponding,
    userProfile,
    todayTotals,
    remainingMacros,
    todayWorkoutScheduledName,
    isTodayWorkoutCompleted,
    weightTrendStats,
  } = useFitness();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isAiResponding]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isAiResponding) return;

    const msg = inputMessage.trim();
    setInputMessage("");
    await sendMessageToCoach(msg);
  };

  const handleSuggestionClick = async (prompt: string) => {
    if (isAiResponding) return;
    await sendMessageToCoach(prompt);
  };

  const quickPrompts = [
    "What should I eat for my next meal to hit remaining protein?",
    "How should I progress my Bench Press next workout?",
    "I'm dining out tonight. How should I manage calories?",
    "Summarize my weekly progress and adherence rate.",
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-4 animate-fade-in">
      {/* 1. TOP COACH CONTEXT HEADER */}
      <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#ededed]">Kinetix AI Coach</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  GEMINI 2.5 ACTIVE
                </span>
              </div>
              <p className="text-xs text-white/40">
                Personalized fitness & nutrition advisor tailored to your current logs
              </p>
            </div>
          </div>

          {/* Active Context Chips */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] text-white/70">
              Goal: <strong className="text-blue-300 capitalize">{userProfile.primaryGoal.replace("_", " ")}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] text-white/70">
              Rem. Protein: <strong className="text-emerald-300">{Math.round(remainingMacros.protein)}g</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] text-white/70">
              Workout: <strong className="text-amber-300">{isTodayWorkoutCompleted ? "Done" : todayWorkoutScheduledName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. CHAT MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] pr-2">
        {aiMessages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20"
                    : "bg-[#0f0f0f] border border-[#1f1f1f] text-[#ededed] rounded-bl-none shadow-sm"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="markdown-body space-y-2 text-[#ededed]/90">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}

                {/* Optional Quick Suggestion buttons provided in assistant response */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1a1a1a] flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(sug)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[11px] transition-colors border border-[#1a1a1a]"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-[#1a1a1a] flex items-center justify-center text-white/70 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAiResponding && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] text-white/50 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Analyzing your logs and drafting response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. SUGGESTIONS CHIPS (If not responding) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none shrink-0">
        <span className="text-[11px] font-mono text-white/40 shrink-0">Try asking:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(prompt)}
            disabled={isAiResponding}
            className="px-3 py-1.5 rounded-xl bg-[#0a0a0a] hover:bg-[#141414] border border-[#1a1a1a] text-white/70 hover:text-white text-[11px] whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* 4. CHAT INPUT FORM */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-2 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask coach anything about food, workouts, recovery, or adjustments..."
          disabled={isAiResponding}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#ededed] placeholder:text-white/30 focus:outline-none font-sans"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isAiResponding}
          id="btn-coach-send"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0"
        >
          {isAiResponding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
