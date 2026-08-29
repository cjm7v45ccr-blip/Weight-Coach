import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { FoodItem, MealType } from "../../types";

interface MealCardProps {
  mealType: MealType;
  title?: string;
  items: FoodItem[];
  onAddItem?: (mealType: MealType) => void;
  onAddFood?: (mealType: MealType) => void;
  onDeleteItem: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  title,
  items,
  onAddItem,
  onAddFood,
  onDeleteItem,
}) => {
  const handleAdd = () => {
    if (onAddItem) onAddItem(mealType);
    else if (onAddFood) onAddFood(mealType);
  };

  const mealTitle = title || mealType.charAt(0).toUpperCase() + mealType.slice(1);

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
    <div className="crono-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900">{mealTitle}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-xs font-bold text-gray-900">{Math.round(totals.calories)} kcal</span>
            <span className="text-[10px] text-gray-500 block">
              {Math.round(totals.protein)}g P · {Math.round(totals.carbs)}g C · {Math.round(totals.fat)}g F
            </span>
          </div>

          <button
            onClick={handleAdd}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-white hover:text-black text-gray-500 transition-all"
            title={`Add food to ${mealTitle}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-1.5 divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between group">
              <div className="overflow-hidden pr-2">
                <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                <p className="text-[11px] text-gray-500">
                  {item.servingSize || "1 serving"} · {item.calories} kcal ({item.protein}g P · {item.carbs}g C · {item.fat}g F)
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
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
          onClick={handleAdd}
          className="py-3 px-3 rounded-xl border border-dashed border-gray-200 hover:border-gray-200 hover:bg-gray-50 cursor-pointer text-center transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold text-gray-500">Log {mealTitle}</span>
        </div>
      )}
    </div>
  );
};
