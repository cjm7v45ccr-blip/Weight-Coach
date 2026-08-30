import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Settings,
  RotateCcw,
  Trash2,
  Check,
  User,
  Target,
  Flame,
  Utensils,
  Sliders,
  Download,
  Upload,
  Cloud,
  RefreshCw,
  Smartphone,
  Copy,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";
import { PrimaryFitnessGoal } from "../../types";
import { WeeklyRateSlider } from "../common/WeeklyRateSlider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    userProfile,
    updateUserProfile,
    updateDailyTargets,
    resetToDemoData,
    clearAllData,
    currentUser,
    signInWithGoogle,
    signInWithEmail,
    signInAnon,
    resetPassword,
    signOutUser,
    isCloudSynced,
    syncAccountId,
    lastCloudSyncTime,
    isSyncing,
    connectSyncAccount,
    disconnectSyncAccount,
    forceSyncToCloud,
    exportData,
    importData,
  } = useFitness();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [customSyncInput, setCustomSyncInput] = useState(syncAccountId || "rembertovalenzuela12@gmail.com");
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState("");

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState("");
  const [hasServerKey, setHasServerKey] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasApiKey === "boolean") {
          setHasServerKey(data.hasApiKey);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (syncAccountId) {
      setCustomSyncInput(syncAccountId);
    }
  }, [syncAccountId]);

  const [name, setName] = useState(userProfile.name);
  const [units, setUnits] = useState(userProfile.preferredUnits);
  const [goal, setGoal] = useState<PrimaryFitnessGoal>(userProfile.primaryGoal);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(userProfile.weeklyWorkoutTarget);

  // Targets
  const [calories, setCalories] = useState(userProfile.dailyTargets.calories);
  const [protein, setProtein] = useState(userProfile.dailyTargets.protein);
  const [carbs, setCarbs] = useState(userProfile.dailyTargets.carbs);
  const [fat, setFat] = useState(userProfile.dailyTargets.fat);
  const [steps, setSteps] = useState(userProfile.dailyTargets.steps);
  const [waterMl, setWaterMl] = useState(userProfile.dailyTargets.waterMl);

  // Preferences
  const [dietary, setDietary] = useState(userProfile.dietaryPreferences?.join(", ") || "");
  const [avoided, setAvoided] = useState(userProfile.avoidedFoods?.join(", ") || "");

  // Synchronize modal state whenever modal opens or user profile is updated
  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name || "");
      setUnits(userProfile.preferredUnits || "lbs");
      setGoal(userProfile.primaryGoal || "lose_fat");
      setWorkoutsPerWeek(userProfile.weeklyWorkoutTarget || 4);
      setCalories(userProfile.dailyTargets.calories || 2000);
      setProtein(userProfile.dailyTargets.protein || 140);
      setCarbs(userProfile.dailyTargets.carbs || 200);
      setFat(userProfile.dailyTargets.fat || 65);
      setSteps(userProfile.dailyTargets.steps || 8500);
      setWaterMl(userProfile.dailyTargets.waterMl || 2800);
      setDietary((userProfile.dietaryPreferences || []).join(", "));
      setAvoided((userProfile.avoidedFoods || []).join(", "));
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      preferredUnits: units,
      primaryGoal: goal,
      weeklyWorkoutTarget: Number(workoutsPerWeek),
      dietaryPreferences: dietary.split(",").map((s) => s.trim()).filter(Boolean),
      avoidedFoods: avoided.split(",").map((s) => s.trim()).filter(Boolean),
    });

    updateDailyTargets({
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      steps: Number(steps),
      waterMl: Number(waterMl),
    });

    onClose();
  };

  const handleClearLogs = () => {
    clearAllData();
    onClose();
  };

  const handleLoadDemo = () => {
    resetToDemoData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-900">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Settings & Targets</h2>
              <p className="text-xs text-gray-500">Adjust macro splits, unit system, and coach constraints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {/* Cloud Sync & Cross-Device Account */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isCloudSynced ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    Firebase Cloud Sync (Active)
                  </h3>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  Linked Account: <span className="font-semibold text-gray-900">{syncAccountId || currentUser?.email || "rembertovalenzuela12@gmail.com"}</span>
                  {lastCloudSyncTime && <span className="text-indigo-700 ml-1.5 font-medium">• Last sync {lastCloudSyncTime}</span>}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={async () => {
                    try {
                      await forceSyncToCloud();
                      setSyncFeedback("Sync refreshed!");
                      setTimeout(() => setSyncFeedback(""), 3000);
                    } catch (err: any) {
                      setAuthError("Sync failed: " + err.message);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Now
                </button>

                {currentUser && !currentUser.isAnonymous && (
                  <button
                    type="button"
                    onClick={signOutUser}
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>

            {/* Sync ID / Device Pairing */}
            <div className="p-3 rounded-xl bg-white border border-indigo-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  Mobile & Desktop Sync Account ID
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const text = syncAccountId || customSyncInput || "rembertovalenzuela12@gmail.com";
                    navigator.clipboard.writeText(text);
                    setCopiedSyncCode(true);
                    setTimeout(() => setCopiedSyncCode(false), 2000);
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  {copiedSyncCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedSyncCode ? "Copied ID!" : "Copy Sync ID"}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter email or sync ID"
                  value={customSyncInput}
                  onChange={(e) => setCustomSyncInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <button
                  type="button"
                  disabled={authLoading || !customSyncInput.trim()}
                  onClick={async () => {
                    try {
                      setAuthLoading(true);
                      await connectSyncAccount(customSyncInput.trim());
                      setSyncFeedback("Account linked & synced!");
                      setTimeout(() => setSyncFeedback(""), 3500);
                    } catch (err: any) {
                      setAuthError(err.message || "Failed to link account");
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  {authLoading ? "Linking..." : "Link & Load"}
                </button>
              </div>

              {syncFeedback && <p className="text-[11px] text-emerald-600 font-semibold">{syncFeedback}</p>}
            </div>

            {/* Zero-Config Quick Cloud Options */}
            <div className="border-t border-indigo-100/70 pt-2.5 space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signInAnon();
                      setSyncFeedback("Instant Guest Sync Activated!");
                      setTimeout(() => setSyncFeedback(""), 3000);
                    } catch (err: any) {
                      console.error(err);
                      alert(`Guest cloud sync error: ${err.message || err.code}`);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50/60 text-indigo-900 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚡ 1-Click Guest Sync</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (err: any) {
                      console.error(err);
                      alert("Google popup restricted in this environment. Use the Sync Account ID or Email login.");
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Google Sign-In</span>
                </button>
              </div>

              {/* Email / Password fallback */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-gray-700 mb-1.5">Or Sign In with Password</p>
                {authError && <p className="text-[11px] text-red-600 mb-2 font-medium">{authError}</p>}
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSignUpMode(!isSignUpMode)}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      {isSignUpMode ? "Already have account? Sign In" : "Need account? Sign Up"}
                    </button>
                    <button
                      type="button"
                      disabled={authLoading || !authEmail || !authPassword}
                      onClick={async () => {
                        setAuthError("");
                        setAuthLoading(true);
                        try {
                          await signInWithEmail(authEmail, authPassword, isSignUpMode);
                          setAuthEmail("");
                          setAuthPassword("");
                          setSyncFeedback("Signed in with Email!");
                          setTimeout(() => setSyncFeedback(""), 3000);
                        } catch (err: any) {
                          setAuthError(err.message || "Authentication failed");
                        } finally {
                          setAuthLoading(false);
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      {authLoading ? "Processing..." : isSignUpMode ? "Create Account" : "Sign In"}
                    </button>
                  </div>
                  <div className="text-right pt-0.5">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!authEmail) {
                          setAuthError("Please enter your email address above first.");
                          return;
                        }
                        try {
                          await resetPassword(authEmail);
                          alert("Password reset/setup email sent! Check your inbox to set a password for your account.");
                        } catch (err: any) {
                          setAuthError(err.message || "Failed to send reset email");
                        }
                      }}
                      className="text-[10px] text-gray-500 hover:text-indigo-600 underline"
                    >
                      Forgot password / Set password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini AI API Key Configuration */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${hasServerKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  Gemini AI API Key Configuration
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-800">
                {hasServerKey ? "API Key Configured" : "Using Local Fallback"}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              FatBot uses Google Gemini AI for food photo vision recognition, AI coach conversations, and workout telemetry. You can update or supply your own Gemini API key below.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy... (Gemini API Key)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={!apiKeyInput.trim()}
                onClick={async () => {
                  try {
                    const res = await fetch("/api/ai/set-key", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setHasServerKey(true);
                      setApiKeyInput("");
                      setApiKeyStatus("API Key updated successfully!");
                      setTimeout(() => setApiKeyStatus(""), 3500);
                    } else {
                      throw new Error(data.error || "Failed to update API key");
                    }
                  } catch (err: any) {
                    setApiKeyStatus("Error: " + err.message);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Save Key
              </button>
            </div>
            {apiKeyStatus && <p className="text-[11px] font-semibold text-emerald-700">{apiKeyStatus}</p>}
          </div>

          {/* User Profile */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">User Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Preferred Units</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnits("lbs")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      units === "lbs"
                        ? "bg-white border-gray-200 text-gray-900 shadow-sm"
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Pounds (lbs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits("kg")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      units === "kg"
                        ? "bg-white border-gray-200 text-gray-900 shadow-sm"
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Strategy & Focus</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Primary Objective</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as PrimaryFitnessGoal)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-200"
                >
                  <option value="lose_fat">Fat Loss / Body Recomposition</option>
                  <option value="build_muscle">Muscle Growth / Hypertrophy</option>
                  <option value="increase_strength">Pure Strength Progression</option>
                  <option value="maintain">Maintenance & Athletic Performance</option>
                  <option value="improve_fitness">General Health & Longevity</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Weekly Workout Frequency</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={workoutsPerWeek}
                  onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Rate of Loss / Surplus & Deficit Interactive Adjuster */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Deficit Pace & Weekly Rate Forecast
              </h3>
            </div>

            <WeeklyRateSlider
              userProfile={{
                ...userProfile,
                primaryGoal: goal,
                weeklyWorkoutTarget: workoutsPerWeek,
                preferredUnits: units,
              }}
              currentCalories={calories}
              currentProtein={protein}
              currentCarbs={carbs}
              currentFat={fat}
              currentSteps={steps}
              currentWaterMl={waterMl}
              onTargetsChange={(targets) => {
                setCalories(targets.calories);
                setProtein(targets.protein);
                setCarbs(targets.carbs);
                setFat(targets.fat);
                if (targets.steps !== undefined) setSteps(targets.steps);
                if (targets.waterMl !== undefined) setWaterMl(targets.waterMl);
              }}
            />
          </div>

          {/* Macro Targets */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Daily Targets</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Steps Target</label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Water Target (ml)</label>
                <input
                  type="number"
                  value={waterMl}
                  onChange={(e) => setWaterMl(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Reset Utilities */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Data Management</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportData}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-xs font-semibold text-blue-700 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        importData(event.target.result as string);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />

              <button
                type="button"
                onClick={handleLoadDemo}
                className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-xs font-semibold text-gray-900 flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-600 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logs</span>
              </button>
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-sm shadow-[#FF6B4A]/25 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
