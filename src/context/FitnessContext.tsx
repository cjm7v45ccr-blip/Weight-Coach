import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  UserProfile,
  UserGoal,
  FoodItem,
  Workout,
  RoutineTemplate,
  WeightEntry,
  ActivityEntry,
  AICoachMessage,
  DailyFocusItem,
  NextBestAction,
  WeeklyReview,
  SetRecord,
  ExerciseRecord,
  ProgressiveOverloadAdvice,
  AIActionExecution,
} from "../types";
import {
  initialUserProfile,
  initialGoals,
  presetRoutines,
  initialFoodEntries,
  initialWorkouts,
  initialWeightEntries,
  initialActivityEntries,
  initialAIChat,
  initialWeeklyReview,
} from "../data/initialData";
import { aiService } from "../services/aiService";

interface FitnessContextType {
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateDailyTargets: (targets: Partial<UserProfile["dailyTargets"]>) => void;
  completeOnboarding: (profile: Partial<UserProfile>) => void;

  // Nutrition
  foodEntries: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, "id" | "timestamp"> & { timestamp?: string }) => void;
  addFoodItems: (items: Array<Omit<FoodItem, "id" | "timestamp"> & { timestamp?: string }>) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  deleteFoodItem: (id: string) => void;
  todayFoodEntries: FoodItem[];

  // Workouts
  workouts: Workout[];
  activeWorkout: Workout | null;
  routines: RoutineTemplate[];
  startWorkout: (routine?: RoutineTemplate | Workout) => void;
  startEmptyWorkout: (name?: string) => void;
  updateActiveSet: (exerciseIndex: number, setIndex: number, updates: Partial<SetRecord>) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  deleteSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToActiveWorkout: (exercise: { name: string; muscleGroup: string; targetRepsRange?: string; targetSets?: number; defaultWeight?: number }) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  finishActiveWorkout: (notes?: string, rpe?: number) => void;
  cancelActiveWorkout: () => void;
  deleteWorkout: (id: string) => void;
  addRoutine: (routine: RoutineTemplate) => void;

  // Rest Timer
  restTimer: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    exerciseName: string;
  };
  startRestTimer: (seconds: number, exerciseName?: string) => void;
  stopRestTimer: () => void;
  adjustRestTimer: (seconds: number) => void;

  // Weight & Activity
  weightEntries: WeightEntry[];
  addWeightEntry: (weight: number, date?: string, notes?: string) => void;
  deleteWeightEntry: (idOrDate: string) => void;
  activityEntries: ActivityEntry[];
  logWater: (amountMl: number) => void;
  todayWaterMl: number;
  logSteps: (steps: number) => void;

  // Goals
  goals: UserGoal[];
  addGoal: (goal: Omit<UserGoal, "id">) => void;
  updateGoal: (id: string, updates: Partial<UserGoal>) => void;
  deleteGoal: (id: string) => void;

  // AI & Recommendations
  aiMessages: AICoachMessage[];
  sendMessageToCoach: (text: string) => Promise<void>;
  isAiResponding: boolean;
  dailyFocus: DailyFocusItem[];
  toggleFocusItem: (id: string) => void;
  nextBestAction: NextBestAction;
  refreshDailyFocus: () => Promise<void>;

  // Weekly Reviews
  weeklyReviews: WeeklyReview[];
  latestWeeklyReview: WeeklyReview | null;
  generateWeeklyReview: () => Promise<void>;

  // Derived Calculations
  todayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    steps: number;
    activeMinutes: number;
  };
  remainingMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  todayWorkout: Workout | null;
  todayWorkoutScheduledName: string;
  isTodayWorkoutCompleted: boolean;
  progressiveOverloadAdvice: ProgressiveOverloadAdvice[];
  weightTrendStats: {
    current: number;
    starting: number;
    goal: number;
    sevenDayAvg: number;
    thirtyDayChange: number;
  };
  weeklyWorkoutConsistency: {
    completed: number;
    target: number;
    percent: number;
  };
  personalRecords: Record<string, { weight: number; reps: number; date: string }>;

  // App Utilities
  resetToDemoData: () => void;
  clearAllData: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: "kinetix_user_profile_v2",
  FOOD: "kinetix_food_entries_v2",
  WORKOUTS: "kinetix_workouts_v2",
  ROUTINES: "kinetix_routines_v2",
  WEIGHT: "kinetix_weight_v2",
  ACTIVITY: "kinetix_activity_v2",
  GOALS: "kinetix_goals_v2",
  AI_CHAT: "kinetix_ai_chat_v2",
  WEEKLY: "kinetix_weekly_v2",
  WATER: "kinetix_water_v2",
  FOCUS: "kinetix_focus_v2",
};

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core Persistent States with initial fallbacks
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  const [foodEntries, setFoodEntries] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOOD);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? initialFoodEntries : [];
    } catch {
      return [];
    }
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? initialWorkouts : [];
    } catch {
      return [];
    }
  });

  const [routines, setRoutines] = useState<RoutineTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      return saved ? JSON.parse(saved) : presetRoutines;
    } catch {
      return presetRoutines;
    }
  });

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEIGHT);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? initialWeightEntries : [];
    } catch {
      return [];
    }
  });

  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? initialActivityEntries : [];
    } catch {
      return [];
    }
  });

  const [goals, setGoals] = useState<UserGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? initialGoals : [];
    } catch {
      return [];
    }
  });

  const [aiMessages, setAiMessages] = useState<AICoachMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AI_CHAT);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? initialAIChat : [];
    } catch {
      return [];
    }
  });

  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? [initialWeeklyReview] : [];
    } catch {
      return [];
    }
  });

  const [todayWaterMl, setTodayWaterMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      if (saved !== null) return JSON.parse(saved);
      return initialUserProfile.onboardingCompleted ? 1800 : 0;
    } catch {
      return 0;
    }
  });

  // Active workout session in-progress
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<{
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    exerciseName: string;
  }>({
    isRunning: false,
    remainingSeconds: 0,
    totalSeconds: 0,
    exerciseName: "",
  });

  // Daily focus state
  const [dailyFocus, setDailyFocus] = useState<DailyFocusItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOCUS);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: "f-1",
        title: "Complete scheduled training session",
        category: "workout",
        why: "Consistency is your highest leverage driver for progressive strength.",
        completed: false,
        actionLabel: "Start Workout",
        actionType: "workout",
      },
      {
        id: "f-2",
        title: "Hit daily protein target",
        category: "nutrition",
        why: "Supports muscle protein synthesis and lean body recomposition.",
        completed: false,
        actionLabel: "Log Food",
        actionType: "nutrition",
      },
      {
        id: "f-3",
        title: "Reach daily activity step target",
        category: "activity",
        why: "Non-exercise activity maintains daily metabolic energy expenditure.",
        completed: false,
        actionLabel: "Log Walk",
        actionType: "activity",
      },
    ];
  });

  const [isAiResponding, setIsAiResponding] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("home");

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(foodEntries));
  }, [foodEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify(weightEntries));
  }, [weightEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activityEntries));
  }, [activityEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(aiMessages));
  }, [aiMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(weeklyReviews));
  }, [weeklyReviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(todayWaterMl));
  }, [todayWaterMl]);

  // Rest Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (restTimer.isRunning && restTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev.remainingSeconds <= 1) {
            // Play notification tone or trigger confetti
            return { ...prev, isRunning: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restTimer.isRunning, restTimer.remainingSeconds]);

  const startRestTimer = useCallback((seconds: number, exerciseName = "") => {
    setRestTimer({
      isRunning: true,
      remainingSeconds: seconds,
      totalSeconds: seconds,
      exerciseName,
    });
  }, []);

  const stopRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isRunning: false, remainingSeconds: 0 }));
  }, []);

  const adjustRestTimer = useCallback((seconds: number) => {
    setRestTimer((prev) => ({
      ...prev,
      remainingSeconds: Math.max(0, prev.remainingSeconds + seconds),
      totalSeconds: Math.max(prev.totalSeconds, prev.remainingSeconds + seconds),
    }));
  }, []);

  // Today's date string in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter today's food entries
  const todayFoodEntries = useMemo(() => {
    return foodEntries.filter((item) => item.timestamp.startsWith(todayStr));
  }, [foodEntries, todayStr]);

  // Calculate Today's Macro and Calorie Totals
  const todayTotals = useMemo(() => {
    const nutrition = todayFoodEntries.reduce(
      (acc, item) => ({
        calories: acc.calories + (Number(item.calories) || 0),
        protein: acc.protein + (Number(item.protein) || 0),
        carbs: acc.carbs + (Number(item.carbs) || 0),
        fat: acc.fat + (Number(item.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const todayAct = activityEntries.find((a) => a.date === todayStr);

    return {
      calories: Math.round(nutrition.calories),
      protein: Math.round(nutrition.protein * 10) / 10,
      carbs: Math.round(nutrition.carbs * 10) / 10,
      fat: Math.round(nutrition.fat * 10) / 10,
      steps: todayAct?.steps || 0,
      activeMinutes: todayAct?.activeMinutes || 0,
    };
  }, [todayFoodEntries, activityEntries, todayStr]);

  // Remaining Macros
  const remainingMacros = useMemo(() => {
    const targets = userProfile.dailyTargets;
    return {
      calories: Math.max(0, targets.calories - todayTotals.calories),
      protein: Math.max(0, Math.round((targets.protein - todayTotals.protein) * 10) / 10),
      carbs: Math.max(0, Math.round((targets.carbs - todayTotals.carbs) * 10) / 10),
      fat: Math.max(0, Math.round((targets.fat - todayTotals.fat) * 10) / 10),
    };
  }, [userProfile.dailyTargets, todayTotals]);

  // Today's Workout Status
  const todayWorkout = useMemo(() => {
    return workouts.find((w) => w.date === todayStr) || null;
  }, [workouts, todayStr]);

  const isTodayWorkoutCompleted = !!todayWorkout?.completed;
  const todayWorkoutScheduledName = todayWorkout
    ? todayWorkout.name
    : routines.length > 0
    ? routines[0].name
    : "Upper Body Training";

  // Dynamic Next Best Action
  const nextBestAction = useMemo<NextBestAction>(() => {
    if (activeWorkout) {
      return {
        title: `Workout In Progress: ${activeWorkout.name}`,
        subtitle: `Currently logging sets. Tap to return to session.`,
        reason: "Active tracking maximizes focus and progressive overload tracking.",
        priority: "high",
        actionLabel: "RESUME WORKOUT",
        actionType: "start_workout",
      };
    }

    if (!isTodayWorkoutCompleted) {
      return {
        title: `${todayWorkoutScheduledName} is scheduled for today.`,
        subtitle: "Target compound & accessory movements · ~45 min estimated",
        reason: "Follow your progressive overload routine to build lean tissue.",
        priority: "high",
        actionLabel: "START WORKOUT",
        actionType: "start_workout",
      };
    }

    if (remainingMacros.protein > 20) {
      return {
        title: `Prioritize ${Math.round(remainingMacros.protein)}g more protein today.`,
        subtitle: `You've consumed ${Math.round(todayTotals.protein)}g / ${userProfile.dailyTargets.protein}g target.`,
        reason: "Your workout is complete. Post-workout protein supports recovery.",
        priority: "high",
        actionLabel: "LOG FOOD",
        actionType: "log_protein",
      };
    }

    if (todayTotals.steps < userProfile.dailyTargets.steps - 2000) {
      return {
        title: `Take a 20-minute recovery walk.`,
        subtitle: `Currently at ${todayTotals.steps.toLocaleString()} / ${userProfile.dailyTargets.steps.toLocaleString()} steps.`,
        reason: "Light movement accelerates lactic clearance and aids digestion.",
        priority: "normal",
        actionLabel: "LOG ACTIVITY",
        actionType: "active_walk",
      };
    }

    return {
      title: "All key daily targets fulfilled.",
      subtitle: "Solid nutrition and training completed. Prioritize 7-8 hrs sleep tonight.",
      reason: "Rest is when muscle protein synthesis and nervous system recovery occur.",
      priority: "normal",
      actionLabel: "VIEW PROGRESS",
      actionType: "weekly_review",
    };
  }, [
    activeWorkout,
    isTodayWorkoutCompleted,
    todayWorkoutScheduledName,
    remainingMacros.protein,
    todayTotals.protein,
    todayTotals.steps,
    userProfile.dailyTargets,
  ]);

  // Progressive Overload Analysis based on actual historical workout sets
  const progressiveOverloadAdvice = useMemo<ProgressiveOverloadAdvice[]>(() => {
    const advice: ProgressiveOverloadAdvice[] = [];
    const completedWorkouts = workouts.filter((w) => w.completed);
    if (completedWorkouts.length === 0) {
      return advice;
    }

    const exerciseHistoryMap: Record<string, { exerciseName: string; setsByDate: Array<{ date: string; sets: SetRecord[] }> }> = {};

    completedWorkouts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((w) => {
        w.exercises.forEach((ex) => {
          if (!exerciseHistoryMap[ex.exerciseId]) {
            exerciseHistoryMap[ex.exerciseId] = { exerciseName: ex.name, setsByDate: [] };
          }
          exerciseHistoryMap[ex.exerciseId].setsByDate.push({ date: w.date, sets: ex.sets });
        });
      });

    // Check Barbell Bench Press
    const benchData = exerciseHistoryMap["ex-bench-press"];
    if (benchData && benchData.setsByDate.length > 0) {
      const recentSession = benchData.setsByDate[benchData.setsByDate.length - 1];
      const allHitMaxReps = recentSession.sets.every((s) => s.reps >= 10);
      if (allHitMaxReps) {
        const topWeight = Math.max(...recentSession.sets.map((s) => s.weight));
        advice.push({
          exerciseId: "ex-bench-press",
          exerciseName: "Barbell Bench Press",
          recommendation: `You reached 10 reps on all three sets (${topWeight} lbs). Consider increasing the weight to ${topWeight + 5} lbs next workout.`,
          type: "increase_weight",
          suggestedWeight: topWeight + 5,
          suggestedReps: "8–10",
        });
      }
    }

    // Check Barbell Squat
    const squatData = exerciseHistoryMap["ex-barbell-squat"];
    if (squatData && squatData.setsByDate.length > 0) {
      const recentSession = squatData.setsByDate[squatData.setsByDate.length - 1];
      const topWeight = Math.max(...recentSession.sets.map((s) => s.weight));
      advice.push({
        exerciseId: "ex-barbell-squat",
        exerciseName: "Barbell Back Squat",
        recommendation: `Completed ${recentSession.sets.length} sets at ${topWeight} lbs. Aim for 8 reps on your next session before progressing load.`,
        type: "increase_reps",
        suggestedWeight: topWeight,
        suggestedReps: "6–8",
      });
    }

    return advice;
  }, [workouts]);

  // Personal Records Calculation
  const personalRecords = useMemo(() => {
    const prs: Record<string, { weight: number; reps: number; date: string }> = {};

    workouts
      .filter((w) => w.completed)
      .forEach((w) => {
        w.exercises.forEach((ex) => {
          ex.sets
            .filter((s) => s.completed)
            .forEach((s) => {
              const current = prs[ex.name];
              if (!current || s.weight > current.weight || (s.weight === current.weight && s.reps > current.reps)) {
                prs[ex.name] = { weight: s.weight, reps: s.reps, date: w.date };
              }
            });
        });
      });

    return prs;
  }, [workouts]);

  // Weight Trends Stats
  const weightTrendStats = useMemo(() => {
    const sorted = [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const current = sorted.length > 0 ? sorted[sorted.length - 1].weight : userProfile.currentWeight;
    const starting = sorted.length > 0 ? sorted[0].weight : userProfile.currentWeight;
    const goal = userProfile.goalWeight;

    // 7-day average
    const last7Entries = sorted.slice(-7);
    const sevenDayAvg =
      last7Entries.length > 0
        ? Math.round((last7Entries.reduce((acc, curr) => acc + curr.weight, 0) / last7Entries.length) * 10) / 10
        : current;

    const thirtyDayChange = Math.round((current - starting) * 10) / 10;

    return {
      current,
      starting,
      goal,
      sevenDayAvg,
      thirtyDayChange,
    };
  }, [weightEntries, userProfile.currentWeight, userProfile.goalWeight]);

  // Weekly Workout Consistency
  const weeklyWorkoutConsistency = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const completedThisWeek = workouts.filter(
      (w) => w.completed && new Date(w.date) >= sevenDaysAgo
    ).length;

    const target = userProfile.weeklyWorkoutTarget || 4;
    return {
      completed: completedThisWeek,
      target,
      percent: Math.min(100, Math.round((completedThisWeek / target) * 100)),
    };
  }, [workouts, userProfile.weeklyWorkoutTarget]);

  // Actions
  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfileState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateDailyTargets = useCallback((targets: Partial<UserProfile["dailyTargets"]>) => {
    setUserProfileState((prev) => ({
      ...prev,
      dailyTargets: { ...prev.dailyTargets, ...targets },
    }));
  }, []);

  const completeOnboarding = useCallback((profileUpdates: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      const updatedProfile: UserProfile = {
        ...prev,
        ...profileUpdates,
        onboardingCompleted: true,
      };

      // Set initial weight entry if starting weight exists
      const startWeight = updatedProfile.currentWeight || 175;
      const today = new Date().toISOString().split("T")[0];
      const initialWeight: WeightEntry = {
        id: "weight-" + Date.now(),
        date: today,
        weight: startWeight,
        notes: "Starting weight logged during plan setup",
      };
      setWeightEntries([initialWeight]);

      // Set initial customized goals matching user selection
      const goalObj = updatedProfile.primaryGoal || "lose_fat";
      const unit = updatedProfile.preferredUnits || "lbs";
      const goalW = updatedProfile.goalWeight || (goalObj === "lose_fat" ? startWeight - 10 : goalObj === "build_muscle" ? startWeight + 10 : startWeight);
      const weeklySessions = updatedProfile.weeklyWorkoutTarget || 4;

      const newGoals: UserGoal[] = [
        {
          id: "goal-init-1",
          category: "body",
          title: goalObj === "lose_fat" ? "Target Body Weight Reduction" : goalObj === "build_muscle" ? "Lean Muscle Gain Goal" : "Body Weight Management",
          startValue: startWeight,
          currentValue: startWeight,
          targetValue: goalW,
          unit: unit,
          history: [{ date: today, value: startWeight }],
        },
        {
          id: "goal-init-2",
          category: "consistency",
          title: "Weekly Workout Consistency",
          startValue: 0,
          currentValue: 0,
          targetValue: weeklySessions,
          unit: "workouts/wk",
        },
        {
          id: "goal-init-3",
          category: "nutrition",
          title: "Daily Protein Target Adherence",
          startValue: 0,
          currentValue: 0,
          targetValue: updatedProfile.dailyTargets.protein,
          unit: "g/day",
        },
      ];
      setGoals(newGoals);

      // Set fresh customized daily focus items
      const focusItems: DailyFocusItem[] = [
        {
          id: "f-init-1",
          title: `Log Day 1 Workout (${weeklySessions}x/week target)`,
          category: "workout",
          why: "Establishing training consistency early cements motor patterns and workout adherence.",
          completed: false,
          actionLabel: "Start Workout",
          actionType: "workout",
        },
        {
          id: "f-init-2",
          title: `Reach ${updatedProfile.dailyTargets.protein}g Protein Target`,
          category: "nutrition",
          why: "Optimal protein distribution fuels muscle recovery and metabolic satiety.",
          completed: false,
          actionLabel: "Log Food",
          actionType: "nutrition",
        },
        {
          id: "f-init-3",
          title: `Hit ${updatedProfile.dailyTargets.steps.toLocaleString()} Daily Steps`,
          category: "activity",
          why: "Baseline daily activity sustains caloric expenditure and circulation.",
          completed: false,
          actionLabel: "Log Activity",
          actionType: "activity",
        },
      ];
      setDailyFocus(focusItems);

      // Clean slate for logs
      setFoodEntries([]);
      setWorkouts([]);
      setActivityEntries([]);
      setAiMessages([]);
      setWeeklyReviews([]);
      setTodayWaterMl(0);
      setActiveWorkout(null);

      // Persist directly
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
      localStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify([initialWeight]));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
      localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(focusItems));
      localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(0));

      return updatedProfile;
    });
  }, []);

  // Food Item Actions
  const addFoodItem = useCallback((item: Omit<FoodItem, "id" | "timestamp"> & { timestamp?: string }) => {
    const newItem: FoodItem = {
      ...item,
      id: "food-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      timestamp: item.timestamp || new Date().toISOString(),
    };
    setFoodEntries((prev) => [newItem, ...prev]);
  }, []);

  const addFoodItems = useCallback((items: Array<Omit<FoodItem, "id" | "timestamp"> & { timestamp?: string }>) => {
    const newItems: FoodItem[] = items.map((item, idx) => ({
      ...item,
      id: "food-" + Date.now() + "-" + idx + "-" + Math.random().toString(36).substr(2, 4),
      timestamp: item.timestamp || new Date().toISOString(),
    }));
    setFoodEntries((prev) => [...newItems, ...prev]);
  }, []);

  const updateFoodItem = useCallback((id: string, updates: Partial<FoodItem>) => {
    setFoodEntries((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const deleteFoodItem = useCallback((id: string) => {
    setFoodEntries((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Workout Actions
  const startWorkout = useCallback((routine?: RoutineTemplate | Workout) => {
    if (routine && "exercises" in routine) {
      const active: Workout = {
        id: "active-" + Date.now(),
        name: routine.name,
        category: (routine as any).category || "Upper Body",
        date: new Date().toISOString().split("T")[0],
        durationMinutes: (routine as any).estimatedDuration || 45,
        completed: false,
        exercises: routine.exercises.map((ex, exIdx) => ({
          id: "ex-" + Date.now() + "-" + exIdx,
          exerciseId: (ex as any).exerciseId || "ex-" + exIdx,
          name: ex.name,
          muscleGroup: (ex as any).muscleGroup || "Compound",
          targetSets: (ex as any).targetSets || 3,
          targetRepsRange: (ex as any).targetRepsRange || "8–10",
          targetRestSeconds: (ex as any).targetRestSeconds || 90,
          sets: Array.from({ length: (ex as any).targetSets || 3 }, (_, sIdx) => ({
            id: "set-" + Date.now() + "-" + exIdx + "-" + sIdx,
            setNumber: sIdx + 1,
            weight: (ex as any).defaultWeight || 135,
            reps: parseInt((ex as any).targetRepsRange?.split("–")[0]) || 8,
            completed: false,
          })),
        })),
      };
      setActiveWorkout(active);
    } else {
      startEmptyWorkout("Custom Training Session");
    }
  }, []);

  const startEmptyWorkout = useCallback((name = "Custom Session") => {
    const active: Workout = {
      id: "active-" + Date.now(),
      name,
      category: "Full Body",
      date: new Date().toISOString().split("T")[0],
      durationMinutes: 45,
      completed: false,
      exercises: [
        {
          id: "ex-init",
          exerciseId: "ex-bench-press",
          name: "Barbell Bench Press",
          muscleGroup: "Chest",
          targetSets: 3,
          targetRepsRange: "8–10",
          targetRestSeconds: 90,
          sets: [
            { id: "s1", setNumber: 1, weight: 135, reps: 10, completed: false },
            { id: "s2", setNumber: 2, weight: 135, reps: 10, completed: false },
            { id: "s3", setNumber: 3, weight: 135, reps: 10, completed: false },
          ],
        },
      ],
    };
    setActiveWorkout(active);
  }, []);

  const updateActiveSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<SetRecord>) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const exercises = [...prev.exercises];
      const targetExercise = { ...exercises[exerciseIndex] };
      const sets = [...targetExercise.sets];
      sets[setIndex] = { ...sets[setIndex], ...updates };
      targetExercise.sets = sets;
      exercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises };
    });
  }, []);

  const addSetToExercise = useCallback((exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const exercises = [...prev.exercises];
      const targetExercise = { ...exercises[exerciseIndex] };
      const prevSet = targetExercise.sets[targetExercise.sets.length - 1];
      const newSetNumber = targetExercise.sets.length + 1;
      const newSet: SetRecord = {
        id: "set-" + Date.now() + "-" + newSetNumber,
        setNumber: newSetNumber,
        weight: prevSet ? prevSet.weight : 135,
        reps: prevSet ? prevSet.reps : 10,
        completed: false,
      };
      targetExercise.sets = [...targetExercise.sets, newSet];
      exercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises };
    });
  }, []);

  const deleteSetFromExercise = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const exercises = [...prev.exercises];
      const targetExercise = { ...exercises[exerciseIndex] };
      targetExercise.sets = targetExercise.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
        ...s,
        setNumber: idx + 1,
      }));
      exercises[exerciseIndex] = targetExercise;
      return { ...prev, exercises };
    });
  }, []);

  const addExerciseToActiveWorkout = useCallback(
    (exercise: { name: string; muscleGroup: string; targetRepsRange?: string; targetSets?: number; defaultWeight?: number }) => {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        const numSets = exercise.targetSets || 3;
        const newEx: ExerciseRecord = {
          id: "ex-" + Date.now(),
          exerciseId: "ex-custom-" + Date.now(),
          name: exercise.name,
          muscleGroup: exercise.muscleGroup || "Full Body",
          targetSets: numSets,
          targetRepsRange: exercise.targetRepsRange || "8–12",
          targetRestSeconds: 75,
          sets: Array.from({ length: numSets }, (_, i) => ({
            id: "set-" + Date.now() + "-" + i,
            setNumber: i + 1,
            weight: exercise.defaultWeight || 100,
            reps: 10,
            completed: false,
          })),
        };
        return { ...prev, exercises: [...prev.exercises, newEx] };
      });
    },
    []
  );

  const removeExerciseFromActiveWorkout = useCallback((exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== exerciseIndex),
      };
    });
  }, []);

  const finishActiveWorkout = useCallback((notes?: string, rpe?: number) => {
    if (!activeWorkout) return;

    // Calculate total volume
    let totalVolume = 0;
    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVolume += s.weight * s.reps;
        }
      });
    });

    const finished: Workout = {
      ...activeWorkout,
      completed: true,
      completedAt: new Date().toISOString(),
      notes: notes || activeWorkout.notes,
      rpe: rpe || 8,
      totalVolume,
    };

    setWorkouts((prev) => [finished, ...prev.filter((w) => w.id !== finished.id)]);
    setActiveWorkout(null);

    // Trigger celebration effects
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"],
    });
  }, [activeWorkout]);

  const cancelActiveWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const addRoutine = useCallback((routine: RoutineTemplate) => {
    setRoutines((prev) => [routine, ...prev]);
  }, []);

  // Weight & Activity Actions
  const addWeightEntry = useCallback((weight: number, date = new Date().toISOString().split("T")[0], notes?: string) => {
    const newEntry: WeightEntry = {
      id: "w-" + Date.now(),
      date,
      weight: Number(weight),
      notes,
    };
    setWeightEntries((prev) => [newEntry, ...prev.filter((w) => w.date !== date)]);
    // Only update current scale weight if the entry is today's date or newer than existing
    const todayStr = new Date().toISOString().split("T")[0];
    if (date >= todayStr) {
      setUserProfileState((prev) => ({ ...prev, currentWeight: Number(weight) }));
    }
  }, []);

  const deleteWeightEntry = useCallback((idOrDate: string) => {
    setWeightEntries((prev) => prev.filter((w) => w.id !== idOrDate && w.date !== idOrDate));
  }, []);

  const clearTodayFoodLogs = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setFoodEntries((prev) => prev.filter((item) => !item.timestamp.startsWith(today)));
  }, []);

  const logWater = useCallback((amountMl: number) => {
    setTodayWaterMl((prev) => Math.max(0, prev + amountMl));
  }, []);

  const logSteps = useCallback((steps: number) => {
    const today = new Date().toISOString().split("T")[0];
    setActivityEntries((prev) => {
      const existing = prev.find((a) => a.date === today);
      if (existing) {
        return prev.map((a) => (a.date === today ? { ...a, steps: Math.max(a.steps, steps) } : a));
      } else {
        return [
          {
            id: "act-" + Date.now(),
            date: today,
            steps,
            activeMinutes: Math.round(steps / 100),
            caloriesBurned: Math.round(steps * 0.04),
          },
          ...prev,
        ];
      }
    });
  }, []);

  // Goals Actions
  const addGoal = useCallback((goal: Omit<UserGoal, "id">) => {
    const newGoal: UserGoal = {
      ...goal,
      id: "goal-" + Date.now(),
      history: [{ date: new Date().toISOString().split("T")[0], value: goal.currentValue }],
    };
    setGoals((prev) => [newGoal, ...prev]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<UserGoal>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newHist = updates.currentValue !== undefined && updates.currentValue !== g.currentValue
          ? [...(g.history || []), { date: new Date().toISOString().split("T")[0], value: updates.currentValue }]
          : g.history;
        return { ...g, ...updates, history: newHist };
      })
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const toggleFocusItem = useCallback((id: string) => {
    setDailyFocus((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  }, []);

  const refreshDailyFocus = useCallback(async () => {
    const userContext = {
      name: userProfile.name,
      todayCalories: todayTotals.calories,
      targetCalories: userProfile.dailyTargets.calories,
      remainingCalories: remainingMacros.calories,
      todayProtein: todayTotals.protein,
      targetProtein: userProfile.dailyTargets.protein,
      remainingProtein: remainingMacros.protein,
      todayWorkoutName: todayWorkoutScheduledName,
      todayWorkoutCompleted: isTodayWorkoutCompleted,
      steps: todayTotals.steps,
      waterMl: todayWaterMl,
      primaryGoal: userProfile.primaryGoal,
    };

    const res = await aiService.getDailyFocus(userContext);
    if (res.focusItems) {
      setDailyFocus(res.focusItems);
    }
  }, [
    userProfile,
    todayTotals,
    remainingMacros,
    todayWorkoutScheduledName,
    isTodayWorkoutCompleted,
    todayWaterMl,
  ]);

  // Weekly Review Actions
  const latestWeeklyReview = useMemo(() => {
    return weeklyReviews.length > 0 ? weeklyReviews[0] : null;
  }, [weeklyReviews]);

  const generateWeeklyReview = useCallback(async () => {
    const weekData = {
      weekRange: "Current Week",
      avgWeightChange: weightTrendStats.thirtyDayChange / 4,
      completedWorkouts: weeklyWorkoutConsistency.completed,
      targetWorkouts: userProfile.weeklyWorkoutTarget,
      proteinAdherence: Math.min(100, Math.round((todayTotals.protein / userProfile.dailyTargets.protein) * 100)),
      calorieAdherence: Math.min(100, Math.round((todayTotals.calories / userProfile.dailyTargets.calories) * 100)),
      activityAdherence: Math.min(100, Math.round((todayTotals.steps / userProfile.dailyTargets.steps) * 100)),
      primaryGoal: userProfile.primaryGoal,
    };

    const newRev = await aiService.generateWeeklyReview(weekData);
    setWeeklyReviews((prev) => [newRev, ...prev]);
  }, [
    weightTrendStats,
    weeklyWorkoutConsistency,
    userProfile,
    todayTotals,
  ]);

  // Reset to rich demo data
  const resetToDemoData = useCallback(() => {
    setUserProfileState(initialUserProfile);
    setFoodEntries(initialFoodEntries);
    setWorkouts(initialWorkouts);
    setRoutines(presetRoutines);
    setWeightEntries(initialWeightEntries);
    setActivityEntries(initialActivityEntries);
    setGoals(initialGoals);
    setAiMessages(initialAIChat);
    setWeeklyReviews([initialWeeklyReview]);
    setTodayWaterMl(1800);
    setActiveWorkout(null);
    setDailyFocus([
      {
        id: "f-1",
        title: "Complete Upper Body A workout",
        category: "workout",
        why: "Consistency is your highest leverage driver for progressive strength.",
        completed: false,
        actionLabel: "Start Workout",
        actionType: "workout",
      },
      {
        id: "f-2",
        title: "Get approximately 47g more protein",
        category: "nutrition",
        why: "Hit 145g target to maximize lean tissue retention.",
        completed: false,
        actionLabel: "Log Food",
        actionType: "nutrition",
      },
      {
        id: "f-3",
        title: "Hit daily activity target (9,000 steps)",
        category: "activity",
        why: "Non-exercise activity maintains metabolic rate.",
        completed: false,
        actionLabel: "Log Walk",
        actionType: "activity",
      },
      {
        id: "f-4",
        title: "Eat normally rather than unnecessarily restricting",
        category: "recovery",
        why: "Avoid under-fueling so performance and energy stay high.",
        completed: true,
      },
    ]);

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialUserProfile));
    localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(initialFoodEntries));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(initialWorkouts));
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(presetRoutines));
    localStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify(initialWeightEntries));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(initialActivityEntries));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(initialGoals));
    localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(initialAIChat));
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify([initialWeeklyReview]));
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(1800));
  }, []);

  const clearAllData = useCallback(() => {
    const emptyProfile: UserProfile = {
      id: "user-" + Date.now(),
      name: "",
      gender: "other",
      age: 25,
      heightCm: 175,
      currentWeight: 170,
      goalWeight: 165,
      primaryGoal: "lose_fat",
      activityLevel: "moderately_active",
      weeklyWorkoutTarget: 4,
      preferredUnits: "lbs",
      dietaryPreferences: [],
      avoidedFoods: [],
      dailyTargets: {
        calories: 2000,
        protein: 140,
        carbs: 200,
        fat: 65,
        steps: 8500,
        waterMl: 2800,
      },
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setUserProfileState(emptyProfile);
    setFoodEntries([]);
    setWorkouts([]);
    setWeightEntries([]);
    setActivityEntries([]);
    setGoals([]);
    setAiMessages([]);
    setWeeklyReviews([]);
    setTodayWaterMl(0);
    setActiveWorkout(null);
    setDailyFocus([]);

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(emptyProfile));
    localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(0));
    localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify([]));
  }, []);

  const executeAIActions = useCallback(
    (actions: AIActionExecution[]) => {
      if (!actions || !Array.isArray(actions)) return;
      for (const action of actions) {
        try {
          switch (action.type) {
            case "update_profile":
              updateUserProfile(action.payload);
              break;
            case "update_targets":
              updateDailyTargets(action.payload);
              break;
            case "log_weight":
              if (action.payload?.weight) {
                const dateStr = action.payload.date || new Date().toISOString().split("T")[0];
                addWeightEntry(Number(action.payload.weight), dateStr, action.payload.notes);
              }
              break;
            case "delete_weight":
              if (action.payload?.id || action.payload?.date) {
                deleteWeightEntry(action.payload.id || action.payload.date);
              }
              break;
            case "log_food":
              if (Array.isArray(action.payload?.items)) {
                addFoodItems(action.payload.items);
              } else if (action.payload?.name) {
                addFoodItem(action.payload);
              }
              break;
            case "delete_food":
              if (action.payload?.id) {
                deleteFoodItem(action.payload.id);
              }
              break;
            case "clear_food_logs":
              clearTodayFoodLogs();
              break;
            case "add_goal":
              if (action.payload?.title) {
                addGoal(action.payload);
              }
              break;
            case "update_goal":
              if (action.payload?.id && action.payload?.updates) {
                updateGoal(action.payload.id, action.payload.updates);
              }
              break;
            case "delete_goal":
              if (action.payload?.id) {
                deleteGoal(action.payload.id);
              }
              break;
            case "delete_workout":
              if (action.payload?.id) {
                deleteWorkout(action.payload.id);
              }
              break;
            case "clear_all_data":
              clearAllData();
              break;
            case "reset_demo_data":
              resetToDemoData();
              break;
          }
        } catch (err) {
          console.error("Failed executing AI action:", action, err);
        }
      }
    },
    [
      updateUserProfile,
      updateDailyTargets,
      addWeightEntry,
      deleteWeightEntry,
      clearTodayFoodLogs,
      addFoodItems,
      addFoodItem,
      deleteFoodItem,
      addGoal,
      updateGoal,
      deleteGoal,
      deleteWorkout,
      clearAllData,
      resetToDemoData,
    ]
  );

  // AI Chat & Coach
  const sendMessageToCoach = useCallback(
    async (text: string) => {
      const userMsg: AICoachMessage = {
        id: "msg-" + Date.now(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };

      setAiMessages((prev) => [...prev, userMsg]);
      setIsAiResponding(true);

      const userContext = {
        name: userProfile.name,
        age: userProfile.age,
        gender: userProfile.gender,
        heightCm: userProfile.heightCm,
        primaryGoal: userProfile.primaryGoal,
        activityLevel: userProfile.activityLevel,
        goalWeight: userProfile.goalWeight,
        targetCalories: userProfile.dailyTargets.calories,
        todayCalories: todayTotals.calories,
        remainingCalories: remainingMacros.calories,
        targetProtein: userProfile.dailyTargets.protein,
        todayProtein: todayTotals.protein,
        remainingProtein: remainingMacros.protein,
        targetCarbs: userProfile.dailyTargets.carbs,
        todayCarbs: todayTotals.carbs,
        targetFat: userProfile.dailyTargets.fat,
        todayFat: todayTotals.fat,
        steps: todayTotals.steps,
        targetSteps: userProfile.dailyTargets.steps,
        waterMl: todayWaterMl,
        targetWaterMl: userProfile.dailyTargets.waterMl,
        todayWorkoutName: todayWorkoutScheduledName,
        todayWorkoutCompleted: isTodayWorkoutCompleted,
        weeklyWorkoutsCompleted: weeklyWorkoutConsistency.completed,
        weeklyWorkoutTarget: userProfile.weeklyWorkoutTarget,
        currentWeight: userProfile.currentWeight,
        sevenDayAvgWeight: weightTrendStats.sevenDayAvg,
        unit: userProfile.preferredUnits,
        dietaryPreferences: userProfile.dietaryPreferences,
        avoidedFoods: userProfile.avoidedFoods,
        nextActionText: nextBestAction.title,
        recentWorkouts: workouts.slice(0, 5).map((w) => ({
          id: w.id,
          name: w.name,
          date: w.date,
          completed: w.completed,
          totalVolume: w.totalVolume,
        })),
        todayFoodItems: todayFoodEntries.map((f) => ({
          id: f.id,
          name: f.name,
          mealType: f.mealType,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
        })),
        weightEntries: weightEntries.slice(0, 14).map((w) => ({
          id: w.id,
          date: w.date,
          weight: w.weight,
          notes: w.notes,
        })),
        goals: goals.map((g) => ({
          id: g.id,
          title: g.title,
          currentValue: g.currentValue,
          targetValue: g.targetValue,
          unit: g.unit,
        })),
      };

      try {
        const response = await aiService.sendChatMessage(text, aiMessages, userContext);

        if (response.actions && response.actions.length > 0) {
          executeAIActions(response.actions);
        }

        const assistantMsg: AICoachMessage = {
          id: "msg-" + (Date.now() + 1),
          role: "assistant",
          content: response.content,
          timestamp: new Date().toISOString(),
          suggestions: response.suggestions,
          actionsExecuted: response.actions,
        };
        setAiMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error("Coach error:", err);
      } finally {
        setIsAiResponding(false);
      }
    },
    [
      userProfile,
      todayTotals,
      remainingMacros,
      todayWaterMl,
      todayWorkoutScheduledName,
      isTodayWorkoutCompleted,
      weeklyWorkoutConsistency,
      weightTrendStats,
      nextBestAction,
      workouts,
      todayFoodEntries,
      weightEntries,
      goals,
      aiMessages,
      executeAIActions,
    ]
  );

  return (
    <FitnessContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        updateDailyTargets,
        completeOnboarding,
        foodEntries,
        addFoodItem,
        addFoodItems,
        updateFoodItem,
        deleteFoodItem,
        todayFoodEntries,
        workouts,
        activeWorkout,
        routines,
        startWorkout,
        startEmptyWorkout,
        updateActiveSet,
        addSetToExercise,
        deleteSetFromExercise,
        addExerciseToActiveWorkout,
        removeExerciseFromActiveWorkout,
        finishActiveWorkout,
        cancelActiveWorkout,
        deleteWorkout,
        addRoutine,
        restTimer,
        startRestTimer,
        stopRestTimer,
        adjustRestTimer,
        weightEntries,
        addWeightEntry,
        deleteWeightEntry,
        activityEntries,
        logWater,
        todayWaterMl,
        logSteps,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        aiMessages,
        sendMessageToCoach,
        isAiResponding,
        dailyFocus,
        toggleFocusItem,
        nextBestAction,
        refreshDailyFocus,
        weeklyReviews,
        latestWeeklyReview,
        generateWeeklyReview,
        todayTotals,
        remainingMacros,
        todayWorkout,
        todayWorkoutScheduledName,
        isTodayWorkoutCompleted,
        progressiveOverloadAdvice,
        weightTrendStats,
        weeklyWorkoutConsistency,
        personalRecords,
        resetToDemoData,
        clearAllData,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = (): FitnessContextType => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error("useFitness must be used within a FitnessProvider");
  }
  return context;
};
