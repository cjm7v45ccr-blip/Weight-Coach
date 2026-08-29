#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  sed -i 's/text-white border-gray-200 bg-white/text-gray-900 border-gray-200 bg-white/g' "$file"
  sed -i 's/bg-white border-gray-200 text-white/bg-white border-gray-200 text-gray-900/g' "$file"
  sed -i 's/border-gray-200 text-white/border-gray-200 text-gray-900/g' "$file"
  sed -i 's/hover:bg-gray-200 text-white/hover:bg-gray-200 text-gray-900/g' "$file"
  sed -i 's/hover:text-white/hover:text-gray-900/g' "$file"
  sed -i 's/bg-gray-100 flex items-center justify-center mx-auto text-white/bg-gray-100 flex items-center justify-center mx-auto text-gray-900/g' "$file"
done
