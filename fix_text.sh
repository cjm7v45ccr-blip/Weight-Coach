#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  sed -i 's/text-\[#ededed\]/text-gray-900/g' "$file"
  sed -i 's/text-\[#008DA0\]/text-amber-700/g' "$file"
  sed -i 's/text-\[#0097A7\]/text-amber-700/g' "$file"
  sed -i 's/hover:text-\[#E85B3B\]/hover:text-gray-600/g' "$file"
  sed -i 's/bg-amber-500\/10/bg-amber-100/g' "$file"
  sed -i 's/border-amber-500\/30\/20/border-amber-200/g' "$file"
done
