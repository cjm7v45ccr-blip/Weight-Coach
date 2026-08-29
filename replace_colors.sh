#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  # App Backgrounds
  sed -i 's/bg-\[#fcfbf9\]/bg-transparent/g' "$file"
  sed -i 's/text-stone-900/text-\[#FAFAFA\]/g' "$file"
  sed -i 's/selection:bg-orange-500\/20/selection:bg-white\/20/g' "$file"
  sed -i 's/selection:text-stone-900/selection:text-white/g' "$file"
  
  # Ensure bg-white is cleanly replaced with the dark surface card color (#121212)
  sed -i 's/bg-white/bg-\[#121212\]/g' "$file"
  sed -i 's/bg-slate-50/bg-\[#171717\]/g' "$file"
  sed -i 's/bg-slate-100/bg-\[#262626\]/g' "$file"
  
  # Text
  sed -i 's/text-white/text-\[#0A0A0A\]/g' "$file"
  sed -i 's/text-slate-900/text-\[#FAFAFA\]/g' "$file"
  sed -i 's/text-black\/60/text-white\/60/g' "$file"
  sed -i 's/text-black\/80/text-white\/80/g' "$file"
  sed -i 's/text-black/text-\[#FAFAFA\]/g' "$file"
  
  # Wait, if I replace `text-white` with `text-[#0A0A0A]`, I invert all the buttons.
  # Let's manually review Header.tsx
done
