#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  # App Backgrounds
  sed -i 's/bg-\[#0A0A0A\]/bg-gray-50/g' "$file"
  sed -i 's/bg-\[#121212\]/bg-white/g' "$file"
  sed -i 's/bg-\[#171717\]/bg-gray-100/g' "$file"
  sed -i 's/bg-\[#262626\]/bg-gray-100/g' "$file"
  sed -i 's/bg-\[#404040\]/bg-gray-200/g' "$file"
  
  # Hover states
  sed -i 's/hover:bg-\[#262626\]/hover:bg-gray-200/g' "$file"
  sed -i 's/hover:bg-\[#404040\]/hover:bg-gray-300/g' "$file"
  sed -i 's/hover:bg-\[#0A0A0A\]/hover:bg-gray-100/g' "$file"

  # Borders (make lighter)
  sed -i 's/border-\[#262626\]/border-gray-100/g' "$file"
  sed -i 's/border-\[#404040\]/border-gray-200/g' "$file"
  sed -i 's/divide-\[#262626\]/divide-gray-100/g' "$file"

  # Text Colors
  sed -i 's/text-\[#FAFAFA\]/text-gray-900/g' "$file"
  sed -i 's/text-\[#A3A3A3\]/text-gray-500/g' "$file"
  sed -i 's/text-\[#737373\]/text-gray-400/g' "$file"
  sed -i 's/hover:text-\[#FAFAFA\]/hover:text-gray-900/g' "$file"
  
  # Selection
  sed -i 's/selection:bg-white\/20/selection:bg-blue-100/g' "$file"
  sed -i 's/selection:text-white/selection:text-blue-900/g' "$file"
  
  # Fix Buttons that were inverted to pure white/black
  sed -i 's/bg-white hover:bg-gray-200 disabled:opacity-40 text-black/bg-gray-900 hover:bg-black disabled:opacity-40 text-white/g' "$file"
  sed -i 's/bg-white hover:bg-gray-200 text-black/bg-gray-900 hover:bg-black text-white/g' "$file"
  sed -i 's/bg-white text-black/bg-gray-900 text-white/g' "$file"
  sed -i 's/bg-white flex items-center justify-center text-black/bg-gray-900 flex items-center justify-center text-white/g' "$file"
  sed -i 's/border-white\/30/border-gray-200/g' "$file"
  sed -i 's/text-white\/80/text-gray-600/g' "$file"
  sed -i 's/text-white\/60/text-gray-500/g' "$file"
  sed -i 's/bg-white\/10/bg-gray-100/g' "$file"
  sed -i 's/bg-white\/20/bg-gray-200/g' "$file"
done
