#!/bin/bash
sed -i '/import { CoachView } from ".\/views\/CoachView";/d' src/App.tsx
sed -i '/{activeTab === "coach" && <CoachView \/>}/d' src/App.tsx
