import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Settings,
  RotateCcw,
  Trash2,
  Check,
  User,
  Target,
  Utensils,
  Download,
  Upload,
  Cloud,
  RefreshCw,
  Smartphone,
  Copy,
  CheckCircle2,
  Zap,
  Sparkles,
  Database,
  Sliders,
  LogOut,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";
import { PrimaryFitnessGoal } from "../../types";
import { WeeklyRateSlider } from "../common/WeeklyRateSlider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "profile" | "targets" | "sync" | "ai" | "data";

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
    forceSyncToCloud,
    exportData,
    importData,
  } = useFitness();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Auth & Cloud Sync States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [customSyncInput, setCustomSyncInput] = useState(syncAccountId || "rembertovalenzuela12@gmail.com");
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState("");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // AI Key States
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState("");
  const [hasServerKey, setHasServerKey] = useState(true);
  const [syncApiKeyToggle, setSyncApiKeyToggle] = useState(userProfile.syncApiKey ?? false);

  // Profile Form States
  const [name, setName] = useState(userProfile.name);
  const [units, setUnits] = useState(userProfile.preferredUnits);
  const [goal, setGoal] = useState<PrimaryFitnessGoal>(userProfile.primaryGoal);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(userProfile.weeklyWorkoutTarget);

  // Daily Targets Form States
  const [calories, setCalories] = useState(userProfile.dailyTargets.calories);
  const [protein, setProtein] = useState(userProfile.dailyTargets.protein);
  const [carbs, setCarbs] = useState(userProfile.dailyTargets.carbs);
  const [fat, setFat] = useState(userProfile.dailyTargets.fat);
  const [steps, setSteps] = useState(userProfile.dailyTargets.steps);
  const [waterMl, setWaterMl] = useState(userProfile.dailyTargets.waterMl);

  // Preferences Form States
  const [dietary, setDietary] = useState(userProfile.dietaryPreferences?.join(", ") || "");
  const [avoided, setAvoided] = useState(userProfile.avoidedFoods?.join(", ") || "");

  useEffect(() => {
    if (userProfile.syncApiKey !== undefined) {
      setSyncApiKeyToggle(userProfile.syncApiKey);
    }
  }, [userProfile.syncApiKey]);

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
      setConfirmClearOpen(false);
      setAuthError("");
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
    setConfirmClearOpen(false);
    onClose();
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "targets", label: "Targets & Macros", icon: Target },
    { id: "sync", label: "Cloud Sync", icon: Cloud },
    { id: "ai", label: "AI Config", icon: Sparkles },
    { id: "data", label: "Data & Backup", icon: Database },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white border border-gray-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-900 border border-gray-200/60">
              <Settings className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Application Settings</h2>
              <p className="text-xs text-gray-500">Configure profile, target nutrition, cloud sync, and AI options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 border-b border-gray-100 bg-gray-50/70 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 py-2.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200/80 font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Container */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          {/* TAB 1: Profile & Strategy */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Unit System</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUnits("lbs")}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                          units === "lbs"
                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-xs"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Pounds (lbs)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnits("kg")}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                          units === "kg"
                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-xs"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Kilograms (kg)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">Strategy & Focus</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Primary Fitness Objective</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as PrimaryFitnessGoal)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="lose_fat">Fat Loss / Body Recomposition</option>
                      <option value="build_muscle">Muscle Growth / Hypertrophy</option>
                      <option value="increase_strength">Pure Strength Progression</option>
                      <option value="maintain">Maintenance & Athletic Performance</option>
                      <option value="improve_fitness">General Health & Longevity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Weekly Workout Target (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={workoutsPerWeek}
                      onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Dietary Preferences</label>
                    <input
                      type="text"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="e.g. High-protein, Low-carb"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Comma-separated list</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Avoided Foods / Allergies</label>
                    <input
                      type="text"
                      value={avoided}
                      onChange={(e) => setAvoided(e.target.value)}
                      placeholder="e.g. Dairy, Peanuts, Shellfish"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Comma-separated list</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Targets & Macros */}
          {activeTab === "targets" && (
            <div className="space-y-6 animate-fade-in">
              {/* Interactive Pace & Deficit Adjuster */}
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">Deficit Pace & Weekly Rate Forecast</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">Auto-adjusts calories & macros</span>
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

              {/* Exact Daily Target Inputs */}
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">Custom Target Numbers</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Fat (g)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Daily Steps</label>
                    <input
                      type="number"
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Water Goal (ml)</label>
                    <input
                      type="number"
                      value={waterMl}
                      onChange={(e) => setWaterMl(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Cloud Sync & Cross-Device Account */}
          {activeTab === "sync" && (
            <div className="space-y-6 animate-fade-in">
              {/* Cloud Sync Status Overview */}
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isCloudSynced ? "bg-emerald-500 ring-4 ring-emerald-100" : "bg-amber-400"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">Firestore Cloud Sync</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCloudSynced ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {isCloudSynced ? "Connected & Active" : "Connecting..."}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Account: <span className="font-semibold text-gray-800">{syncAccountId || currentUser?.email || "rembertovalenzuela12@gmail.com"}</span>
                        {lastCloudSyncTime && <span className="text-gray-400 ml-1.5">• Last sync {lastCloudSyncTime}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={async () => {
                        try {
                          await forceSyncToCloud();
                          setSyncFeedback("Synced with cloud!");
                          setTimeout(() => setSyncFeedback(""), 3000);
                        } catch (err: any) {
                          setAuthError("Sync failed: " + err.message);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
                      <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                    </button>

                    {currentUser && !currentUser.isAnonymous && (
                      <button
                        type="button"
                        onClick={signOutUser}
                        className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Device Pairing / Sync ID Box */}
                <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-gray-900">Cross-Device Pairing Key</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const text = syncAccountId || customSyncInput || "rembertovalenzuela12@gmail.com";
                        navigator.clipboard.writeText(text);
                        setCopiedSyncCode(true);
                        setTimeout(() => setCopiedSyncCode(false), 2000);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {copiedSyncCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSyncCode ? "Copied!" : "Copy Key"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Use your account email or pairing ID below to link your phone, tablet, and browser sessions.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter email or sync ID"
                      value={customSyncInput}
                      onChange={(e) => setCustomSyncInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={authLoading || !customSyncInput.trim()}
                      onClick={async () => {
                        try {
                          setAuthLoading(true);
                          await connectSyncAccount(customSyncInput.trim());
                          setSyncFeedback("Account linked & data synced!");
                          setTimeout(() => setSyncFeedback(""), 3500);
                        } catch (err: any) {
                          setAuthError(err.message || "Failed to link account");
                        } finally {
                          setAuthLoading(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors shrink-0"
                    >
                      {authLoading ? "Linking..." : "Link Account"}
                    </button>
                  </div>

                  {syncFeedback && <p className="text-xs text-emerald-600 font-semibold">{syncFeedback}</p>}
                </div>
              </div>

              {/* Authentication & Sign-in Methods */}
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">Sign-in & Account Authentication</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signInAnon();
                        setSyncFeedback("Guest session activated!");
                        setTimeout(() => setSyncFeedback(""), 3000);
                      } catch (err: any) {
                        alert(`Guest sync error: ${err.message || err.code}`);
                      }
                    }}
                    className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-all flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">1-Click Guest Sync</p>
                      <p className="text-[11px] text-gray-500">Quick instant cloud persistence without a password</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                      } catch (err: any) {
                        alert("Google Sign-In popup restricted. Please use Email or Sync Account ID.");
                      }
                    }}
                    className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-all flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Google Account</p>
                      <p className="text-[11px] text-gray-500">Sign in securely with your Google profile</p>
                    </div>
                  </button>
                </div>

                {/* Email / Password Accordion / Form */}
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-semibold text-gray-700">Email & Password</p>
                  {authError && <p className="text-xs text-rose-600 font-medium">{authError}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSignUpMode(!isSignUpMode)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      {isSignUpMode ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!authEmail) {
                            setAuthError("Please enter your email address in the field above first.");
                            return;
                          }
                          try {
                            await resetPassword(authEmail);
                            alert("Password reset email sent! Check your inbox.");
                          } catch (err: any) {
                            setAuthError(err.message || "Failed to send reset email");
                          }
                        }}
                        className="text-[11px] text-gray-500 hover:text-gray-900 underline"
                      >
                        Forgot password?
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
                            setSyncFeedback("Signed in successfully!");
                            setTimeout(() => setSyncFeedback(""), 3000);
                          } catch (err: any) {
                            setAuthError(err.message || "Authentication failed");
                          } finally {
                            setAuthLoading(false);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition-all"
                      >
                        {authLoading ? "Processing..." : isSignUpMode ? "Create Account" : "Sign In"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI Configuration & API Key */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-gray-900">Gemini AI Intelligence Engine</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    hasServerKey ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {hasServerKey ? "Service Active" : "Fallback Mode"}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  FatBot uses Gemini AI for AI food photo scanning, natural language meal parsing, conversational AI coaching, and progressive overload recommendations.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Custom Gemini API Key (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="AIzaSy... (leave blank to use default server key)"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      disabled={!apiKeyInput.trim()}
                      onClick={async () => {
                        try {
                          const keyVal = apiKeyInput.trim();
                          const res = await fetch("/api/ai/set-key", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ apiKey: keyVal }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setHasServerKey(true);
                            setApiKeyInput("");
                            setApiKeyStatus("API Key updated successfully!");
                            if (syncApiKeyToggle) {
                              updateUserProfile({ syncApiKey: true, geminiApiKey: keyVal });
                            }
                            setTimeout(() => setApiKeyStatus(""), 3500);
                          } else {
                            throw new Error(data.error || "Failed to update API key");
                          }
                        } catch (err: any) {
                          setApiKeyStatus("Error: " + err.message);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0"
                    >
                      Save Key
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={syncApiKeyToggle}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setSyncApiKeyToggle(val);
                          updateUserProfile({ syncApiKey: val, geminiApiKey: val ? userProfile.geminiApiKey : undefined });
                        }}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        Sync custom API key across my devices via Firebase Cloud Sync
                      </span>
                    </label>
                  </div>

                  {apiKeyStatus && <p className="text-xs font-semibold text-emerald-600">{apiKeyStatus}</p>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Data & Backup */}
          {activeTab === "data" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">Backup & Portability</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-2 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Export All Data</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Download your complete meal logs, workouts, history, and targets as a JSON file.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={exportData}
                      className="w-full mt-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-2 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Import Data File</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Restore or transfer your data from a previously exported JSON backup file.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full mt-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Restore from JSON File</span>
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
                  </div>
                </div>
              </div>

              {/* Sample Data & Reset */}
              <div className="border border-gray-200/70 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <RotateCcw className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">Data Reset & Sample Testing</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-2 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Load Sample Data</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Populate sample meals, workout logs, bodyweight progression, and weekly reviews.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetToDemoData}
                      className="w-full mt-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                      <span>Load Sample Demo</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-rose-900">Clear All Logs</p>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        Permanently wipe all food logs, workouts, routines, and custom weights.
                      </p>
                    </div>
                    {confirmClearOpen ? (
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setConfirmClearOpen(false)}
                          className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleClearLogs}
                          className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          Confirm Wipe
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmClearOpen(true)}
                        className="w-full mt-2 px-3 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-700 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Clear All Logs</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Changes apply instantly across your account
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
