#!/bin/bash
sed -i 's/<p className="text-xl font-bold text-white">94%<\/p>/<p className="text-xl font-bold text-gray-900">94%<\/p>/g' src/views/HomeView.tsx
sed -i 's/<Flame className="w-4 h-4 text-white" \/>/<Flame className="w-4 h-4 text-gray-900" \/>/g' src/views/HomeView.tsx
sed -i 's/<Footprints className="w-3 h-3 text-white" \/>/<Footprints className="w-3 h-3 text-gray-900" \/>/g' src/views/HomeView.tsx
sed -i 's/className="text-xs font-semibold text-white hover:underline"/className="text-xs font-semibold text-blue-600 hover:underline"/g' src/views/HomeView.tsx
