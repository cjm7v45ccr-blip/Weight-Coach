import React from "react";
import { Plus, Trash2, Edit3, ChevronRight, Utensils } from "lucide-react";
import { FoodItem, MealType } from "../../types";

interface MealCardProps {
  mealType: MealType;
  title: string;
  items: FoodItem[];
  onAddFood: (mealType: MealType) => void;
  onDeleteItem: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  title,
  items,
  onAddFood,
  onDeleteItem,
}) => {
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fat: acc.fat + (Number(item.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">{title}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40 border border-white/[0.06]">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#ededed]">{Math.round(totals.calories)} kcal</span>
            <span className="text-[10px] font-mono text-white/40 block">
              {Math.round(totals.protein)}g P · {Math.round(totals.carbs)}g C · {Math.round(totals.fat)}g F
            </span>
          </div>

          <button
            onClick={() => onAddFood(mealType)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-400 text-white/60 transition-all"
            title={`Add food to ${title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-1.5 divide-y divide-white/[0.04]">
          {items.map((item) => (
            <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between group">
              <div className="overflow-hidden pr-2">
                <p className="text-xs font-medium text-white/80 truncate">{item.name}</p>
                <p className="text-[10px] text-white/40 font-mono">
                  {item.servingSize || "1 serving"} · {item.calories} kcal ({item.protein}g P · {item.carbs}g C · {item.fat}g F)
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 text-white/30 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => onAddFood(mealType)}
          className="py-3 px-3 rounded-lg border border-dashed border-[#1f1f1f] hover:border-[#2e2e2e] hover:bg-white/[0.02] cursor-pointer text-center transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[11px] text-white/40">Log {title}</span>
        </div>
      )}
    </div>
  );
};
