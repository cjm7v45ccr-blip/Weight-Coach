#!/bin/bash
sed -i 's/Bot,/Dumbbell,/g' src/components/common/BottomNav.tsx
sed -i 's/id="mobile-nav-coach"/id="mobile-nav-workout"/g' src/components/common/BottomNav.tsx
sed -i 's/setActiveTab("coach")/setActiveTab("workout")/g' src/components/common/BottomNav.tsx
sed -i 's/activeTab === "coach"/activeTab === "workout"/g' src/components/common/BottomNav.tsx
sed -i 's/<Bot className="w-5 h-5" \/>/<Dumbbell className="w-5 h-5" \/>/g' src/components/common/BottomNav.tsx
sed -i 's/Coach/Workouts/g' src/components/common/BottomNav.tsx
