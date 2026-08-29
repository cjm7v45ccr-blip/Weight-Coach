#!/bin/bash
find src -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
  sed -i 's/hover:bg-stone-50\/50/hover:bg-\[#262626\]\/50/g' "$file"
  sed -i 's/text-\[#006C75\]/text-white/g' "$file"
  sed -i 's/bg-\[#006C75\]/bg-white/g' "$file"
  sed -i 's/text-\[#9B51E0\]/text-amber-400/g' "$file"
  sed -i 's/bg-\[#9B51E0\]/bg-amber-400/g' "$file"
  sed -i 's/text-\[#222E3E\]/text-gray-300/g' "$file"
done
