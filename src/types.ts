export type GoalCategory = 'body' | 'strength' | 'fitness' | 'nutrition' | 'consistency' | 'weight' | 'habit';
export type GoalType = GoalCategory;

export interface UserGoal {
  id: string;
  category?: GoalCategory;
  type?: GoalCategory;
  title: string;
  targetValue: number;
  currentValue: number;
  startValue: number;
  unit: string;
  targetDate?: string;
  deadline?: string;
  history?: { date: string; value: number }[];
  completed?: boolean;
  status?: 'active' | 'completed' | 'paused';
  notes?: string;
}

export type PrimaryFitnessGoal = 'lose_fat' | 'build_muscle' | 'get_stronger' | 'increase_strength' | 'improve_fitness' | 'maintain';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';

export interface FoodItem {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  timestamp: string; // ISO string
  notes?: string;
}

export interface SetRecord {
  id: string;
  setNumber: number;
  weight: number; // in preferred unit (lbs or kg)
  reps: number;
  targetReps?: number;
  completed: boolean;
  isWarmup?: boolean;
  isPR?: boolean;
  rpe?: number;
}

export interface ExerciseRecord {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetRepsRange: string; // e.g. "8-10"
  targetRestSeconds: number;
  sets: SetRecord[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  category: 'Upper Body' | 'Lower Body' | 'Push' | 'Pull' | 'Legs' | 'Full Body' | 'Cardio' | 'Core';
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  completed: boolean;
  exercises: ExerciseRecord[];
  notes?: string;
  rpe?: number;
  totalVolume?: number; // weight * reps
  completedAt?: string;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  defaultRepsRange: string;
  defaultSets: number;
  defaultRestSeconds: number;
  instructions?: string;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  category: Workout['category'];
  description: string;
  estimatedDuration: number;
  exercises: {
    exerciseId: string;
    name: string;
    muscleGroup: string;
    targetSets: number;
    targetRepsRange: string;
    targetRestSeconds: number;
    defaultWeight: number;
  }[];
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  bodyFatPercentage?: number;
  notes?: string;
}

export interface ActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  distanceKm?: number;
}

export interface AIActionExecution {
  type:
    | 'update_profile'
    | 'update_targets'
    | 'log_weight'
    | 'delete_weight'
    | 'log_food'
    | 'delete_food'
    | 'clear_food_logs'
    | 'add_goal'
    | 'update_goal'
    | 'delete_goal'
    | 'delete_workout'
    | 'clear_all_data'
    | 'reset_demo_data';
  payload: any;
  description: string;
}

export interface AICoachMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: string[];
  actionsExecuted?: AIActionExecution[];
  actionPrompt?: {
    label: string;
    actionType: 'start_workout' | 'log_food' | 'view_progress' | 'view_weekly' | 'open_goals';
    data?: any;
  };
}

export interface DailyFocusItem {
  id: string;
  title: string;
  category: 'workout' | 'nutrition' | 'activity' | 'recovery';
  why: string;
  completed: boolean;
  actionLabel?: string;
  actionType?: 'workout' | 'nutrition' | 'water' | 'activity' | 'progress';
}

export interface NextBestAction {
  title: string;
  subtitle: string;
  reason: string;
  priority: 'high' | 'normal';
  actionLabel: string;
  actionType: 'start_workout' | 'log_protein' | 'log_meal' | 'drink_water' | 'active_walk' | 'weekly_review' | 'log_weight';
}

export interface WeeklyReview {
  id: string;
  weekRange: string;
  avgWeightChange: number; // e.g. -0.8
  completedWorkouts: number;
  targetWorkouts: number;
  proteinAdherencePercent: number;
  calorieAdherencePercent: number;
  activityAdherencePercent: number;
  whatWentWell: string[];
  whatCouldImprove: string[];
  nextWeekFocus: string[];
  generatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  currentWeight: number;
  goalWeight: number;
  primaryGoal: PrimaryFitnessGoal;
  activityLevel: ActivityLevel;
  weeklyWorkoutTarget: number;
  preferredUnits: 'lbs' | 'kg';
  dietaryPreferences: string[];
  avoidedFoods: string[];
  dailyTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    steps: number;
    waterMl: number;
  };
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface ProgressiveOverloadAdvice {
  exerciseId: string;
  exerciseName: string;
  recommendation: string; // e.g., "You hit 10 reps on all 3 sets for 2 consecutive sessions. Consider increasing weight to 65 lbs."
  type: 'increase_weight' | 'increase_reps' | 'maintain' | 'deload';
  suggestedWeight?: number;
  suggestedReps?: string;
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}
