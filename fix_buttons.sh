#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  # Fix the "AI" badge
  sed -i 's/text-white bg-gray-100 px-1.5 py-0.5/text-blue-700 bg-blue-100 px-1.5 py-0.5/g' "$file"
  
  # Fix button texts on gray-100 backgrounds
  sed -i 's/bg-gray-100 hover:bg-gray-100 text-white/bg-gray-100 hover:bg-gray-200 text-gray-900/g' "$file"
  sed -i 's/bg-gray-100 hover:bg-gray-200 text-white/bg-gray-100 hover:bg-gray-200 text-gray-900/g' "$file"
  sed -i 's/bg-gray-100 text-white/bg-gray-100 text-gray-900/g' "$file"
  
  # Ensure icons inside gray-100 buttons are also gray-900 if they were explicitly white
  sed -i 's/text-white bg-gray-100/text-gray-900 bg-gray-100/g' "$file"
  
  # Secondary items on light bg shouldn't have text-white
  sed -i 's/text-white bg-white/text-gray-900 bg-white/g' "$file"
done
