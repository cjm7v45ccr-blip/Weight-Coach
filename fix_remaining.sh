#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  sed -i 's/bg-\[#0a0a0a\]/bg-white/g' "$file"
  sed -i 's/bg-\[#0f0f0f\]/bg-gray-50/g' "$file"
  sed -i 's/bg-\[#161616\]/bg-gray-100/g' "$file"
  sed -i 's/border-\[#1a1a1a\]/border-gray-200/g' "$file"
  sed -i 's/border-\[#2a2a2a\]/border-gray-300/g' "$file"
  sed -i 's/border-\[#1f1f1f\]/border-gray-200/g' "$file"
  sed -i 's/bg-\[#1E293B\]/bg-gray-900/g' "$file"
  sed -i 's/bg-\[#F1EFEA\]/bg-gray-100/g' "$file"
  sed -i 's/bg-\[#28ad6e\]/bg-blue-600/g' "$file"
  sed -i 's/bg-\[#E2E8F0\]/bg-gray-200/g' "$file"
  sed -i 's/bg-\[#00ADC0\]/bg-amber-600/g' "$file"
done
