#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  # Backgrounds
  sed -i 's/bg-\[#FAF8F5\]/bg-\[#0A0A0A\]/g' "$file"
  sed -i 's/bg-\[#F8F9FA\]/bg-\[#0A0A0A\]/g' "$file"
  sed -i 's/bg-white/bg-\[#121212\]/g' "$file"
  sed -i 's/bg-\[#EFECE6\]/bg-\[#262626\]/g' "$file"
  sed -i 's/bg-\[#222E3E\]/bg-\[#171717\]/g' "$file"
  sed -i 's/hover:bg-\[#E5E0D8\]/hover:bg-\[#404040\]/g' "$file"
  sed -i 's/hover:bg-\[#EFECE6\]/hover:bg-\[#262626\]/g' "$file"
  sed -i 's/hover:bg-\[#1A2330\]/hover:bg-\[#262626\]/g' "$file"
  sed -i 's/hover:bg-\[#1E293B\]/hover:bg-\[#262626\]/g' "$file"

  # Borders
  sed -i 's/border-\[#EFECE6\]/border-\[#262626\]/g' "$file"
  sed -i 's/border-\[#E2E8F0\]/border-\[#262626\]/g' "$file"
  sed -i 's/border-\[#CBD5E1\]/border-\[#404040\]/g' "$file"

  # Text colors
  sed -i 's/text-\[#1E293B\]/text-\[#FAFAFA\]/g' "$file"
  sed -i 's/text-\[#64748B\]/text-\[#A3A3A3\]/g' "$file"
  sed -i 's/text-\[#475569\]/text-\[#A3A3A3\]/g' "$file"
  sed -i 's/text-\[#94A3B8\]/text-\[#737373\]/g' "$file"
  sed -i 's/text-slate-800/text-\[#FAFAFA\]/g' "$file"
  sed -i 's/text-slate-600/text-\[#A3A3A3\]/g' "$file"
  sed -i 's/text-slate-500/text-\[#737373\]/g' "$file"

  # Macro Colors (Protein = Emerald, Carbs = Blue, Fat = Amber - let's make them premium)
  # Instead of the playful #00C1D4 etc., let's use:
  # Protein: Blue (#3B82F6)
  # Carbs: Amber (#F59E0B)
  # Fat: Rose (#F43F5E)
  sed -i 's/bg-\[#2EC47D\]/bg-blue-500/g' "$file"
  sed -i 's/text-\[#2EC47D\]/text-blue-500/g' "$file"
  sed -i 's/border-\[#2EC47D\]/border-blue-500\/30/g' "$file"

  sed -i 's/bg-\[#00C1D4\]/bg-amber-500/g' "$file"
  sed -i 's/text-\[#00C1D4\]/text-amber-500/g' "$file"
  sed -i 's/border-\[#00C1D4\]/border-amber-500\/30/g' "$file"

  sed -i 's/bg-\[#FF9F1C\]/bg-rose-500/g' "$file"
  sed -i 's/text-\[#FF9F1C\]/text-rose-500/g' "$file"
  sed -i 's/border-\[#FF9F1C\]/border-rose-500\/30/g' "$file"

  # Primary Brand (was #FF6B4A). Let's make it White (for buttons) or Emerald (for active stats).
  # For buttons, we want bg-white text-black.
  # Let's change bg-[#FF6B4A] text-white to bg-white text-black
  sed -i 's/bg-\[#FF6B4A\] text-white/bg-white text-black/g' "$file"
  sed -i 's/bg-\[#FF6B4A\] hover:bg-\[#E85B3B\] text-white/bg-white hover:bg-gray-200 text-black/g' "$file"
  sed -i 's/bg-\[#FF6B4A\]/bg-white/g' "$file"
  sed -i 's/text-\[#FF6B4A\]/text-white/g' "$file"
  sed -i 's/border-\[#FF6B4A\]/border-white\/30/g' "$file"
  sed -i 's/hover:bg-\[#E85B3B\]/hover:bg-gray-200/g' "$file"

done
