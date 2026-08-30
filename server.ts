import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Initialize Gemini Client safely with User-Agent header as required
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Configure API Key endpoint
app.post("/api/ai/set-key", (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string") {
    return res.status(400).json({ error: "Invalid API key" });
  }
  process.env.GEMINI_API_KEY = apiKey.trim();
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  res.json({ success: true, hasApiKey: true });
});

// Heuristic Fallback Food Parser when offline/no API key
function heuristicParseFood(text: string) {
  const parts = text.split(/[,;\n\+]|(?:\s+and\s+)/i).map(s => s.trim()).filter(Boolean);
  const items: any[] = [];

  const foodCatalog: { [key: string]: { cal: number; p: number; c: number; f: number; serving: string } } = {
    egg: { cal: 72, p: 6.3, c: 0.4, f: 4.8, serving: "1 large egg" },
    eggs: { cal: 72, p: 6.3, c: 0.4, f: 4.8, serving: "1 large egg" },
    eggwhite: { cal: 17, p: 3.6, c: 0.2, f: 0.1, serving: "1 large white" },
    chicken: { cal: 165, p: 31, c: 0, f: 3.6, serving: "100g breast" },
    chickenbreast: { cal: 165, p: 31, c: 0, f: 3.6, serving: "100g breast" },
    beef: { cal: 250, p: 26, c: 0, f: 15, serving: "100g ground beef (85/15)" },
    steak: { cal: 240, p: 25, c: 0, f: 15, serving: "100g sirloin" },
    salmon: { cal: 208, p: 20, c: 0, f: 13, serving: "100g fillet" },
    tuna: { cal: 132, p: 28, c: 0, f: 1, serving: "1 can drained (120g)" },
    rice: { cal: 130, p: 2.7, c: 28, f: 0.3, serving: "100g cooked (1/2 cup)" },
    oats: { cal: 150, p: 5, c: 27, f: 2.5, serving: "1/2 cup dry (40g)" },
    oatmeal: { cal: 150, p: 5, c: 27, f: 2.5, serving: "1/2 cup dry (40g)" },
    banana: { cal: 105, p: 1.3, c: 27, f: 0.3, serving: "1 medium" },
    apple: { cal: 95, p: 0.5, c: 25, f: 0.3, serving: "1 medium" },
    avocado: { cal: 160, p: 2, c: 9, f: 15, serving: "1/2 medium" },
    cheese: { cal: 110, p: 7, c: 1, f: 9, serving: "1 slice / 28g" },
    cheddar: { cal: 115, p: 7, c: 0.5, f: 9.5, serving: "28g" },
    longaniza: { cal: 150, p: 7, c: 2, f: 12, serving: "3 tbsp (45g)" },
    sausage: { cal: 160, p: 8, c: 1, f: 14, serving: "1 link (45g)" },
    bacon: { cal: 86, p: 6, c: 0.1, f: 7, serving: "2 slices cooked" },
    bread: { cal: 80, p: 3, c: 15, f: 1, serving: "1 slice" },
    toast: { cal: 80, p: 3, c: 15, f: 1, serving: "1 slice" },
    peanutbutter: { cal: 190, p: 8, c: 7, f: 16, serving: "2 tbsp (32g)" },
    whey: { cal: 120, p: 24, c: 2, f: 1.5, serving: "1 scoop (30g)" },
    proteinpowder: { cal: 120, p: 24, c: 2, f: 1.5, serving: "1 scoop (30g)" },
    milk: { cal: 120, p: 8, c: 12, f: 5, serving: "1 cup (240ml)" },
    almondmilk: { cal: 35, p: 1, c: 1.5, f: 2.5, serving: "1 cup (240ml)" },
    greekyogurt: { cal: 130, p: 17, c: 6, f: 4, serving: "3/4 cup (170g)" },
    yogurt: { cal: 100, p: 10, c: 12, f: 2, serving: "1 cup (150g)" },
    oliveoil: { cal: 120, p: 0, c: 0, f: 14, serving: "1 tbsp (15ml)" },
    butter: { cal: 102, p: 0.1, c: 0, f: 11.5, serving: "1 tbsp (14g)" },
    potato: { cal: 160, p: 4, c: 37, f: 0.2, serving: "1 medium baked" },
    sweetpotato: { cal: 112, p: 2, c: 26, f: 0.1, serving: "1 medium baked" },
    broccoli: { cal: 50, p: 4, c: 10, f: 0.5, serving: "1 cup cooked" },
    spinach: { cal: 20, p: 2, c: 3, f: 0.3, serving: "2 cups raw" },
  };

  for (const part of parts) {
    const matchQty = part.match(/^(\d+(?:\.\d+)?|\d+\/\d+)?\s*(tbsp|tsp|cup|cups|oz|g|grams|lbs|slices|slice|scoop|scoops|links|link|cans|can|can)?\s*(.*)$/i);
    let qty = 1;
    let name = part;
    if (matchQty && matchQty[3]) {
      if (matchQty[1]) {
        if (matchQty[1].includes("/")) {
          const [num, den] = matchQty[1].split("/").map(Number);
          qty = num / den;
        } else {
          qty = parseFloat(matchQty[1]) || 1;
        }
      }
      name = matchQty[3].trim();
    }

    const cleanKey = name.toLowerCase().replace(/[^a-z]/g, "");
    let matchedData = null;
    let foundKey = "";

    for (const [key, val] of Object.entries(foodCatalog)) {
      if (cleanKey.includes(key) || key.includes(cleanKey)) {
        matchedData = val;
        foundKey = key;
        break;
      }
    }

    if (matchedData) {
      items.push({
        name: part.charAt(0).toUpperCase() + part.slice(1),
        serving: matchedData.serving,
        calories: Math.round(matchedData.cal * qty),
        protein: Math.round(matchedData.p * qty * 10) / 10,
        carbs: Math.round(matchedData.c * qty * 10) / 10,
        fat: Math.round(matchedData.f * qty * 10) / 10,
      });
    } else {
      // General estimate for unknown food
      items.push({
        name: part.charAt(0).toUpperCase() + part.slice(1),
        serving: "1 standard serving",
        calories: 180,
        protein: 8,
        carbs: 18,
        fat: 8,
      });
    }
  }

  const totals = items.reduce(
    (acc, curr) => {
      acc.calories += curr.calories;
      acc.protein += curr.protein;
      acc.carbs += curr.carbs;
      acc.fat += curr.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    items,
    totals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
    },
  };
}

// Helper for resilient Gemini content generation with multi-model fallback and graceful retries
async function callGeminiWithFallback(paramsGenerator: (model: string) => any) {
  const models = ["gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    try {
      if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      }
      if (!genAI) throw new Error("Gemini client not initialized");
      const params = paramsGenerator(model);
      const response = await genAI.models.generateContent(params);
      if (response && (response.text || response.candidates?.length)) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Call with model '${model}' failed: ${err?.message || err}. Attempting fallback...`);
    }
  }
  throw lastError || new Error("All Gemini models unavailable");
}

// 1. Natural Language Food Parser Endpoint
app.post("/api/ai/parse-food", async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid food text" });
  }

  if (!genAI) {
    // Fallback heuristic if no API key
    return res.json(heuristicParseFood(text));
  }

  try {
    const prompt = `Parse the following food description into individual food items with realistic estimated macronutrients, calories, and Cronometer-grade micronutrients (vitamins, minerals, fiber, sodium, etc.).
Input: "${text}"

Instructions:
- Decompose into individual ingredients/items (e.g., "2 eggs, 3 tbsp longaniza and cheddar cheese" -> Item 1: 2 Eggs, Item 2: Longaniza (3 tbsp), Item 3: Cheddar Cheese).
- Calculate calories (kcal), protein (g), carbs (g), fat (g) accurately based on standard USDA nutritional values.
- Estimate micronutrients: fiber (g), sugar (g), sodium (mg), potassium (mg), calcium (mg), iron (mg), vitaminA (mcg), vitaminC (mg), vitaminD (mcg), vitaminB12 (mcg), magnesium (mg), zinc (mg), saturatedFat (g), cholesterol (mg).
- Calculate the total calories and total macros sum.
- Use clean, user-friendly names.`;

    const response = await callGeminiWithFallback((model) => ({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Formatted item name with quantity if applicable" },
                  serving: { type: Type.STRING, description: "Serving description, e.g. 2 large eggs or 3 tbsp" },
                  calories: { type: Type.NUMBER, description: "Total calories for this item in kcal" },
                  protein: { type: Type.NUMBER, description: "Protein in grams" },
                  carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
                  fat: { type: Type.NUMBER, description: "Fat in grams" },
                  micros: {
                    type: Type.OBJECT,
                    properties: {
                      fiber: { type: Type.NUMBER },
                      sugar: { type: Type.NUMBER },
                      sodium: { type: Type.NUMBER },
                      potassium: { type: Type.NUMBER },
                      calcium: { type: Type.NUMBER },
                      iron: { type: Type.NUMBER },
                      vitaminA: { type: Type.NUMBER },
                      vitaminC: { type: Type.NUMBER },
                      vitaminD: { type: Type.NUMBER },
                      vitaminB12: { type: Type.NUMBER },
                      magnesium: { type: Type.NUMBER },
                      zinc: { type: Type.NUMBER },
                      saturatedFat: { type: Type.NUMBER },
                      cholesterol: { type: Type.NUMBER },
                    },
                  },
                },
                required: ["name", "serving", "calories", "protein", "carbs", "fat"],
              },
            },
            totals: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
          },
          required: ["items", "totals"],
        },
      },
    }));

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsedJson);
  } catch (error) {
    console.warn("Gemini Food Parsing Error (using fallback):", error);
    return res.json(heuristicParseFood(text));
  }
});

// 1B. Camera / Food Image AI Analyzer Endpoint
app.post("/api/ai/analyze-food-photo", async (req: Request, res: Response) => {
  const { imageBase64, mimeType = "image/jpeg", notes } = req.body;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return res.status(400).json({ error: "Missing image data" });
  }

  // Strip prefix data URL if present
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").trim();
  const cleanMimeType = mimeType || "image/jpeg";

  if (!genAI) {
    // Fallback if no API key configured
    return res.json({
      dishSummary: "Plate of food (AI Visual analysis requires GEMINI_API_KEY)",
      items: [
        {
          name: notes?.trim() || "Sample Mixed Meal",
          serving: "1 plate",
          calories: 520,
          protein: 38,
          carbs: 45,
          fat: 18,
          micros: {
            fiber: 5,
            sodium: 480,
            potassium: 520,
            iron: 2.4,
            calcium: 110,
          },
        },
      ],
      totals: {
        calories: 520,
        protein: 38,
        carbs: 45,
        fat: 18,
      },
    });
  }

  try {
    const promptText = `You are FatBot's computer vision nutrition expert. Analyze this food/meal photograph with high precision:
1. Identify all visible foods, proteins, carbohydrates, vegetables, sauces, toppings, and drinks on the plate or in the container.
2. Estimate the portion size/weight realistically based on visual perspective, plate dimensions, and common serving sizes.
3. Calculate accurate calories (kcal), protein (g), carbs (g), and fat (g) using USDA nutritional standards.
4. Estimate key micronutrients (fiber, sugar, sodium, potassium, calcium, iron, vitaminA, vitaminC, vitaminD, vitaminB12, magnesium, zinc, saturatedFat, cholesterol).
5. Provide a short, appetizing dish summary title.
${notes ? `User notes / context: "${notes}"` : ""}`;

    const response = await callGeminiWithFallback((model) => ({
      model,
      contents: [
        {
          inlineData: {
            mimeType: cleanMimeType,
            data: cleanBase64,
          },
        },
        {
          text: promptText,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishSummary: { type: Type.STRING, description: "Short descriptive name of the meal/dish" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Food item name with quantity/portion" },
                  serving: { type: Type.STRING, description: "Serving description, e.g. 6 oz grilled fillet or 1 cup" },
                  calories: { type: Type.NUMBER, description: "Calories for this component in kcal" },
                  protein: { type: Type.NUMBER, description: "Protein in grams" },
                  carbs: { type: Type.NUMBER, description: "Carbs in grams" },
                  fat: { type: Type.NUMBER, description: "Fat in grams" },
                  micros: {
                    type: Type.OBJECT,
                    properties: {
                      fiber: { type: Type.NUMBER },
                      sugar: { type: Type.NUMBER },
                      sodium: { type: Type.NUMBER },
                      potassium: { type: Type.NUMBER },
                      calcium: { type: Type.NUMBER },
                      iron: { type: Type.NUMBER },
                      vitaminA: { type: Type.NUMBER },
                      vitaminC: { type: Type.NUMBER },
                      vitaminD: { type: Type.NUMBER },
                      vitaminB12: { type: Type.NUMBER },
                      magnesium: { type: Type.NUMBER },
                      zinc: { type: Type.NUMBER },
                      saturatedFat: { type: Type.NUMBER },
                      cholesterol: { type: Type.NUMBER },
                    },
                  },
                },
                required: ["name", "serving", "calories", "protein", "carbs", "fat"],
              },
            },
            totals: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
          },
          required: ["items", "totals"],
        },
      },
    }));

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsedJson);
  } catch (error) {
    console.warn("Gemini Food Vision Error:", error);
    return res.status(500).json({
      error: "Failed to analyze food image with AI",
      details: String(error),
    });
  }
});

// Contextual fallback response generator for Coach
function generateContextualCoachReply(message: string, userContext: any): { content: string; actions?: any[]; suggestions: string[] } {
  const lower = (message || "").toLowerCase().trim();
  let reply = "";
  const actions: any[] = [];
  const defaultSuggestions = [
    "What should I eat for my next meal?",
    "How should I apply progressive overload?",
    "Update my daily calorie target to 2,100",
    "Log past weight: 173.5 lbs for yesterday",
  ];

  const remainingP = Math.max(0, Math.round(userContext?.remainingProtein ?? 30));
  const todayP = Math.round(userContext?.todayProtein ?? 0);
  const remainingCal = Math.round(userContext?.remainingCalories ?? 500);
  const goal = userContext?.primaryGoal?.replace("_", " ") || "building lean muscle";
  const workoutName = userContext?.todayWorkoutName || "Upper Body A";
  const isWorkoutDone = !!userContext?.todayWorkoutCompleted;

  // Heuristic action parsing for offline/fallback mode
  // 1. Weight Logging / Past Weight
  const weightMatch = lower.match(/(?:log|record|set|update|change)?\s*(?:my\s*)?weight\s*(?:to|as|is)?\s*(\d+(?:\.\d+)?)\s*(?:lbs?|kg)?(?:\s*(?:for|on|date)?\s*(yesterday|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}))?/i);
  if (weightMatch && weightMatch[1]) {
    const numWeight = parseFloat(weightMatch[1]);
    let dateStr = new Date().toISOString().split("T")[0];
    if (weightMatch[2]) {
      if (weightMatch[2].toLowerCase() === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        dateStr = d.toISOString().split("T")[0];
      } else if (weightMatch[2].includes("-")) {
        dateStr = weightMatch[2];
      }
    }

    actions.push({
      type: "log_weight",
      payload: { weight: numWeight, date: dateStr, notes: "Logged via FatBot AI" },
      description: `Logged weight: ${numWeight} ${userContext?.unit || "lbs"} for ${dateStr}`,
    });

    return {
      content: `I have recorded your scale weight of **${numWeight} ${userContext?.unit || "lbs"}** for **${dateStr}**.\n\nYour rolling trends and body composition forecasts have been automatically updated!`,
      actions,
      suggestions: defaultSuggestions,
    };
  }

  // 2. Calorie / Target Updates
  const calMatch = lower.match(/(?:set|change|update)?\s*(?:my\s*)?(?:daily\s*)?calories?\s*(?:target\s*)?(?:to|as|=)?\s*(\d{3,5})/i);
  const proteinMatch = lower.match(/(?:set|change|update)?\s*(?:my\s*)?(?:daily\s*)?protein\s*(?:target\s*)?(?:to|as|=)?\s*(\d{2,4})/i);
  if (calMatch || proteinMatch) {
    const newCal = calMatch ? parseInt(calMatch[1]) : undefined;
    const newProt = proteinMatch ? parseInt(proteinMatch[1]) : undefined;
    const updates: any = {};
    const descParts: string[] = [];

    if (newCal) {
      updates.calories = newCal;
      descParts.push(`Calories → ${newCal} kcal`);
    }
    if (newProt) {
      updates.protein = newProt;
      descParts.push(`Protein → ${newProt}g`);
    }

    actions.push({
      type: "update_targets",
      payload: updates,
      description: `Updated targets: ${descParts.join(", ")}`,
    });

    return {
      content: `I've updated your daily targets:\n${descParts.map(p => `- **${p}**`).join("\n")}\n\nYour dashboard and macro progress bars are now synced to these new numbers.`,
      actions,
      suggestions: defaultSuggestions,
    };
  }

  // 3. Name change
  const nameMatch = lower.match(/(?:change|update|set)\s*(?:my\s*)?name\s*(?:to|is)\s*([a-zA-Z\s]+)/i);
  if (nameMatch && nameMatch[1]) {
    const newName = nameMatch[1].trim();
    actions.push({
      type: "update_profile",
      payload: { name: newName },
      description: `Updated profile name to ${newName}`,
    });

    return {
      content: `Your profile name has been updated to **${newName}**.`,
      actions,
      suggestions: defaultSuggestions,
    };
  }

  // 4. Clear/Delete logs
  if (lower.includes("clear food") || lower.includes("delete food log") || lower.includes("remove food log")) {
    actions.push({
      type: "clear_food_logs",
      payload: {},
      description: "Cleared today's food logs",
    });

    return {
      content: "I have cleared your food logs for today. Your daily macro totals have been reset to zero.",
      actions,
      suggestions: defaultSuggestions,
    };
  }

  // Fallback conversational logic
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedToday = now.toLocaleDateString('en-US', dateOptions);

  if (lower.includes("name") || lower.includes("who are you") || lower.includes("what are you")) {
    reply = `I am **FatBot**, your intelligent fitness, nutrition, and body composition bot. I'm here to track your nutrition targets, analyze workout progressions, and help you achieve optimal physical performance.`;
  } else if (lower.includes("what day") || lower.includes("today's date") || lower.includes("what date") || lower.includes("what time")) {
    reply = `Today is **${formattedToday}**. Ready to crush today's goals?`;
  } else if (lower.startsWith("hi") || lower.startsWith("hello") || lower.startsWith("hey") || lower === "yo") {
    reply = `Hey ${userContext?.name || "there"}! How can I assist you with your fitness, nutrition, or workout plan today?`;
  } else if (lower.includes("how are you")) {
    reply = `I'm operating at 100% and ready to help you optimize your training and nutrition. What are we focusing on today?`;
  } else if (lower.includes("hungry") || lower.includes("eat") || lower.includes("meal") || lower.includes("food") || lower.includes("snack")) {
    if (remainingP > 20) {
      reply = `You currently have **${remainingP}g of protein** and **${remainingCal} kcal** remaining for today. To maximize muscle protein synthesis while staying in your target budget, consider a high-protein option like:\n\n- **Option 1**: 200g Greek yogurt with a scoop of berries (~25g protein, 170 kcal)\n- **Option 2**: 150g grilled chicken breast wrap with light greens (~35g protein, 240 kcal)\n- **Option 3**: Whey protein shake with 1 cup unsweetened almond milk (~25g protein, 140 kcal)\n\n**Next action**: Tell me what you ate or log it directly in the Nutrition tab!`;
    } else {
      reply = `You've already hit your primary protein goal for today (${todayP}g)! You have **${remainingCal} kcal** left. If you need energy, reach for a complex carb snack like an apple with a tablespoon of peanut butter or a bowl of oatmeal.`;
    }
  } else if (lower.includes("workout") || lower.includes("train") || lower.includes("lift") || lower.includes("exercise") || lower.includes("gym")) {
    if (isWorkoutDone) {
      reply = `You've already logged and crushed today's workout! Focus on recovery now: drink at least 500ml of water, ensure your protein intake is met, and target 7-8 hours of restful sleep for muscular adaptation.`;
    } else {
      reply = `Your scheduled session for today is **${workoutName}**.\n\nKey coaching keys for today:\n1. Warm up with 2 lighter ramp-up sets before working weight.\n2. Apply **progressive overload**: if you hit the top of your rep range last time, add 2.5–5 lbs or push for +1 extra clean rep.\n3. Keep rest periods between 90–120s on compound movements.\n\n**Next action**: Tap **Start Workout** in your dashboard to begin logging sets!`;
    }
  } else if (lower.includes("weight") || lower.includes("scale") || lower.includes("plateau") || lower.includes("fat")) {
    reply = `Daily scale weight fluctuates naturally due to water retention, glycogen storage, sodium, and muscle inflammation after lifting. Look at your **7-day rolling average trend** rather than day-to-day spikes. You can also tell me to log past or current weights anytime!`;
  } else if (lower.includes("recovery") || lower.includes("sleep") || lower.includes("sore")) {
    reply = `Optimal recovery comes down to three pillars:\n1. **Hydration**: Drink 2.5–3L throughout the day.\n2. **Protein Distribution**: Spread intake across 3-4 meals to maintain steady muscle protein synthesis.\n3. **Sleep**: Aim for 7–9 hours to maximize growth hormone release and nervous system recovery.`;
  } else {
    reply = `I'm here to help you with your training, nutrition, and body composition goals. Based on your current stats, you have **${remainingP}g protein** and **${remainingCal} kcal** remaining today for **${workoutName}**.\n\nFeel free to ask me anything about your routine, diet, or tell me to update your targets!`;
  }

  return {
    content: reply,
    actions,
    suggestions: defaultSuggestions,
  };
}

function formatConversationHistory(history: any[], currentMessage: string) {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history)) {
    // Filter out messages without text
    const valid = history.filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0);
    // Take recent messages
    const slice = valid.slice(-8);

    // Gemini API requires first turn to be 'user'
    const firstUserIdx = slice.findIndex((m) => m.role === "user");
    const usableSlice = firstUserIdx !== -1 ? slice.slice(firstUserIdx) : [];

    for (const msg of usableSlice) {
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += "\n\n" + msg.content;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }
  }

  // Append current user message
  if (contents.length > 0 && contents[contents.length - 1].role === "user") {
    contents[contents.length - 1].parts[0].text += "\n\n" + currentMessage;
  } else {
    contents.push({
      role: "user",
      parts: [{ text: currentMessage }],
    });
  }

  // Safety fallback
  if (contents.length === 0 || contents[0].role !== "user") {
    return [{ role: "user", parts: [{ text: currentMessage }] }];
  }

  return contents;
}

// 2. AI Coach Interactive Chat Endpoint
app.post("/api/ai/coach", async (req: Request, res: Response) => {
  const { message, conversationHistory = [], userContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const defaultSuggestions = [
    "What should I eat for my next meal?",
    "How should I apply progressive overload?",
    "Update my daily calorie target to 2,100",
    "Log past weight: 173.5 lbs for yesterday",
  ];

  if (!genAI && !process.env.GEMINI_API_KEY) {
    const fallback = generateContextualCoachReply(message, userContext);
    return res.json({
      role: "assistant",
      content: fallback.content,
      suggestions: fallback.suggestions,
      actions: fallback.actions,
    });
  }

  try {
    const systemPrompt = `You are FatBot, an intelligent, science-grounded AI Fitness & Nutrition Bot and Coach with FULL CONTROL to view, update, add, and remove the user's data and logs in the FatBot app.

BEHAVIOR AND CONVERSATION RULES:
1. ALWAYS directly and naturally answer what the user asks. If the user asks general, identity, or conversational questions (e.g. "What is your name?", "Who made you?", "How are you?"), answer warmly and directly as FatBot without ignoring their question.
2. If the user asks about fitness, nutrition, workout adjustments, form, or food recommendations, provide concise, evidence-based, actionable guidance.
3. NEVER repeat a generic canned template message when the user asks a specific question.
4. If the user commands an in-app action (e.g. "Change my calorie target to 2100", "Log 174 lbs for yesterday", "I ate 2 eggs and toast"), execute it via the "actions" array and confirm it in your message.
5. Tone: Sharp, encouraging, concise, athletic, scientific. No fluff.

FULL USER DATA & LOGS CONTEXT:
Profile:
- Name: ${userContext?.name || "Athlete"}
- Age: ${userContext?.age || 28}, Gender: ${userContext?.gender || "not specified"}, Height: ${userContext?.heightCm || 178} cm
- Primary Goal: ${userContext?.primaryGoal || "lose_fat"}
- Current Weight: ${userContext?.currentWeight || 175} ${userContext?.unit || "lbs"} (7-Day Avg: ${userContext?.sevenDayAvgWeight || 175} ${userContext?.unit || "lbs"}, Goal Weight: ${userContext?.goalWeight || 165} ${userContext?.unit || "lbs"})
- Activity Level: ${userContext?.activityLevel || "moderately_active"}
- Weekly Workout Target: ${userContext?.weeklyWorkoutTarget || 4} sessions/week (Completed this week: ${userContext?.weeklyWorkoutsCompleted || 0})
- Preferred Units: ${userContext?.unit || "lbs"}
- Dietary Preferences: ${userContext?.dietaryPreferences?.join(", ") || "None"}
- Avoided Foods: ${userContext?.avoidedFoods?.join(", ") || "None"}

Daily Targets & Today's Progress:
- Target Calories: ${userContext?.targetCalories || 2000} kcal (Consumed: ${userContext?.todayCalories || 0} kcal, Remaining: ${userContext?.remainingCalories || 2000} kcal)
- Target Protein: ${userContext?.targetProtein || 140}g (Consumed: ${userContext?.todayProtein || 0}g, Remaining: ${userContext?.remainingProtein || 140}g)
- Target Carbs: ${userContext?.targetCarbs || 220}g (Consumed: ${userContext?.todayCarbs || 0}g)
- Target Fat: ${userContext?.targetFat || 65}g (Consumed: ${userContext?.todayFat || 0}g)
- Steps: ${userContext?.steps || 0} / ${userContext?.targetSteps || 8500}
- Water: ${userContext?.waterMl || 0} / ${userContext?.targetWaterMl || 2800} ml

Training & Workout Logs:
- Scheduled Today: ${userContext?.todayWorkoutName || "Upper Body A"} (Completed: ${userContext?.todayWorkoutCompleted ? "YES" : "NO"})
- Recent Completed Workouts: ${JSON.stringify(userContext?.recentWorkouts || [])}

Nutrition Logs (Today):
- Today's Food Logs: ${JSON.stringify(userContext?.todayFoodItems || [])}

Weight Logs History:
- Logged Weigh-ins: ${JSON.stringify(userContext?.weightEntries || [])}

Active Goals:
- Active Goals: ${JSON.stringify(userContext?.goals || [])}

DIRECT APP CONTROL & ACTION SCHEMA:
Whenever the user asks you to change, update, log, remove, or modify their information, targets, weight (including PAST dates!), food, goals, or workouts, include an "actions" array in your JSON output:
1. "update_profile": payload: { name?, age?, currentWeight?, goalWeight?, primaryGoal?, activityLevel?, weeklyWorkoutTarget?, preferredUnits?, dietaryPreferences?: string[], avoidedFoods?: string[] }
2. "update_targets": payload: { calories?: number, protein?: number, carbs?: number, fat?: number, steps?: number, waterMl?: number }
3. "log_weight": payload: { weight: number, date?: string (YYYY-MM-DD), notes?: string } (Allows logging weight for past dates!)
4. "delete_weight": payload: { id?: string, date?: string }
5. "log_food": payload: { items: [{ name: string, mealType?: string, calories: number, protein: number, carbs: number, fat: number }] }
6. "delete_food": payload: { id?: string, name?: string }
7. "clear_food_logs": payload: {}
8. "add_goal": payload: { title: string, startValue: number, currentValue: number, targetValue: number, unit: string, category?: string }
9. "update_goal": payload: { id: string, updates: { currentValue?: number, targetValue?: number, title?: string } }
10. "delete_goal": payload: { id: string }
11. "delete_workout": payload: { id: string }
12. "clear_all_data": payload: {}
13. "reset_demo_data": payload: {}

Respond strictly in JSON format with this structure:
{
  "content": "Your markdown response directly answering the user with actionable coaching or action confirmations.",
  "suggestions": ["Follow up suggestion 1", "Follow up suggestion 2"],
  "actions": [
    {
      "type": "update_targets",
      "payload": { "calories": 2100, "protein": 160 },
      "description": "Updated daily targets: 2,100 kcal, 160g protein"
    }
  ]
}`;

    const formattedContents = formatConversationHistory(conversationHistory, message);

    const response = await callGeminiWithFallback((model) => ({
      model,
      contents: formattedContents as any,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    }));

    let resultJson: any = null;
    try {
      let rawText = response.text?.trim() || "";
      if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }
      resultJson = JSON.parse(rawText || "{}");
    } catch {
      // If direct parsing fails, try regex extraction
      const match = response.text?.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          resultJson = JSON.parse(match[0]);
        } catch {
          resultJson = null;
        }
      }
    }

    if (!resultJson || typeof resultJson !== "object") {
      resultJson = { content: response.text?.trim() || generateContextualCoachReply(message, userContext).content };
    }

    const finalContent = resultJson.content || response.text?.trim() || generateContextualCoachReply(message, userContext).content;

    return res.json({
      role: "assistant",
      content: finalContent,
      suggestions: Array.isArray(resultJson.suggestions) && resultJson.suggestions.length > 0 ? resultJson.suggestions : defaultSuggestions,
      actions: Array.isArray(resultJson.actions) ? resultJson.actions : [],
    });
  } catch (error) {
    console.warn("Gemini Coach Chat encountered temporary API issue, serving contextual response:", error);
    const fallback = generateContextualCoachReply(message, userContext);
    return res.json({
      role: "assistant",
      content: fallback.content,
      suggestions: fallback.suggestions,
      actions: fallback.actions,
    });
  }
});

// 3. AI Dynamic Focus & Next Best Action
app.post("/api/ai/daily-focus", async (req: Request, res: Response) => {
  const { userContext } = req.body;

  if (!genAI) {
    const focusItems = [];
    if (!userContext?.todayWorkoutCompleted) {
      focusItems.push({
        id: "focus-1",
        title: `Complete today's ${userContext?.todayWorkoutName || "Upper Body A"} workout`,
        category: "workout",
        why: "Consistency is your highest leverage driver for muscle retention.",
        completed: false,
        actionLabel: "Start Workout",
        actionType: "workout",
      });
    } else {
      focusItems.push({
        id: "focus-1",
        title: "Workout completed — prioritize muscular recovery",
        category: "recovery",
        why: "Great work completing your sets today. Give your nervous system time to recover.",
        completed: true,
      });
    }

    if (userContext?.remainingProtein > 20) {
      focusItems.push({
        id: "focus-2",
        title: `Target approximately ${Math.round(userContext.remainingProtein)}g more protein`,
        category: "nutrition",
        why: "Adequate protein distribution maximizes muscle protein synthesis.",
        completed: false,
        actionLabel: "Log Protein",
        actionType: "nutrition",
      });
    } else {
      focusItems.push({
        id: "focus-2",
        title: "Daily protein target reached",
        category: "nutrition",
        why: "You've met your structural amino acid threshold for the day.",
        completed: true,
      });
    }

    focusItems.push({
      id: "focus-3",
      title: "Hit daily activity target (8,000+ steps)",
      category: "activity",
      why: "Non-exercise activity maintains metabolic rate and active recovery.",
      completed: (userContext?.steps || 0) >= 8000,
      actionLabel: "Log Walk",
      actionType: "activity",
    });

    focusItems.push({
      id: "focus-4",
      title: "Hydrate: Drink at least 2.5L water",
      category: "recovery",
      why: "Hydration directly influences cellular volume and cognitive energy.",
      completed: (userContext?.waterMl || 0) >= 2500,
      actionLabel: "Log Water",
      actionType: "water",
    });

    let nextBestAction: any = {
      title: !userContext?.todayWorkoutCompleted
        ? `${userContext?.todayWorkoutName || "Upper Body A"} is scheduled for today.`
        : userContext?.remainingProtein > 25
        ? "Your workout is complete. Prioritize getting enough protein today."
        : "You're on track across nutrition and workouts. Focus on quality sleep tonight.",
      subtitle: !userContext?.todayWorkoutCompleted
        ? "3 compound movements · ~45 min estimated"
        : userContext?.remainingProtein > 25
        ? `${Math.round(userContext.remainingProtein)}g protein remaining to hit daily target.`
        : "All primary daily targets are fulfilled.",
      reason: !userContext?.todayWorkoutCompleted
        ? "Hitting scheduled volume drives progressive overload."
        : "Post-workout nutrient timing aids repair.",
      priority: "high",
      actionLabel: !userContext?.todayWorkoutCompleted ? "START WORKOUT" : "LOG NUTRITION",
      actionType: !userContext?.todayWorkoutCompleted ? "start_workout" : "log_protein",
    };

    return res.json({ focusItems, nextBestAction });
  }

  try {
    const prompt = `Analyze the current user state and generate:
1. "focusItems": 3-4 concise daily focus checklist items.
2. "nextBestAction": The single most impactful NEXT ACTION the user should take right now.

User state:
- Name: ${userContext?.name}
- Calories: ${userContext?.todayCalories}/${userContext?.targetCalories} kcal (Remaining: ${userContext?.remainingCalories})
- Protein: ${userContext?.todayProtein}/${userContext?.targetProtein}g (Remaining: ${userContext?.remainingProtein}g)
- Workout today: ${userContext?.todayWorkoutName} (Completed: ${userContext?.todayWorkoutCompleted})
- Steps: ${userContext?.steps || 4200}
- Goal: ${userContext?.primaryGoal}

Rule: "Don't just show data. Tell them what to do next." Neutral language, no crash dieting, crisp formatting.`;

    const response = await callGeminiWithFallback((model) => ({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focusItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  why: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                  actionLabel: { type: Type.STRING },
                  actionType: { type: Type.STRING },
                },
                required: ["id", "title", "category", "why", "completed"],
              },
            },
            nextBestAction: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                reason: { type: Type.STRING },
                priority: { type: Type.STRING },
                actionLabel: { type: Type.STRING },
                actionType: { type: Type.STRING },
              },
              required: ["title", "subtitle", "reason", "priority", "actionLabel", "actionType"],
            },
          },
          required: ["focusItems", "nextBestAction"],
        },
      },
    }));

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error) {
    console.warn("Gemini Focus Error (using fallback):", error);
    // Fallback response
    return res.json({
      focusItems: [
        {
          id: "f1",
          title: "Complete scheduled workout session",
          category: "workout",
          why: "Stimulate muscle growth with progressive overload.",
          completed: !!userContext?.todayWorkoutCompleted,
          actionLabel: "Start Workout",
          actionType: "workout",
        },
        {
          id: "f2",
          title: "Prioritize protein intake in next meal",
          category: "nutrition",
          why: "Maintain net positive protein balance.",
          completed: (userContext?.remainingProtein || 0) <= 10,
          actionLabel: "Log Food",
          actionType: "nutrition",
        },
      ],
      nextBestAction: {
        title: !userContext?.todayWorkoutCompleted ? `${userContext?.todayWorkoutName || "Upper Body A"} is scheduled for today.` : "Log your post-workout meal.",
        subtitle: !userContext?.todayWorkoutCompleted ? "Tap below to begin your tracking session." : "Prioritize a lean protein source.",
        reason: "Follow your progressive program.",
        priority: "high",
        actionLabel: !userContext?.todayWorkoutCompleted ? "START WORKOUT" : "LOG MEAL",
        actionType: !userContext?.todayWorkoutCompleted ? "start_workout" : "log_protein",
      },
    });
  }
});

// 4. AI Weekly Review Generator
app.post("/api/ai/weekly-review", async (req: Request, res: Response) => {
  const { weekData } = req.body;

  if (!genAI) {
    return res.json({
      id: "review-" + Date.now(),
      weekRange: weekData?.weekRange || "Aug 21 — Aug 27",
      avgWeightChange: weekData?.avgWeightChange || -0.8,
      completedWorkouts: weekData?.completedWorkouts || 3,
      targetWorkouts: weekData?.targetWorkouts || 3,
      proteinAdherencePercent: weekData?.proteinAdherence || 92,
      calorieAdherencePercent: weekData?.calorieAdherence || 95,
      activityAdherencePercent: weekData?.activityAdherence || 84,
      whatWentWell: [
        "Completed 100% of planned resistance training sessions.",
        "Met your daily protein target on 6 out of 7 days.",
        "Increased working weight on Barbell Bench Press by 5 lbs.",
      ],
      whatCouldImprove: [
        "Weekend step count dipped below 5,000 steps on Saturday.",
        "Water intake was lower on non-training recovery days.",
      ],
      nextWeekFocus: [
        "Maintain current 3-day workout split with progressive overload on main lifts.",
        "Aim for a morning 15-minute walk on weekends to stabilize step consistency.",
        "Front-load 30g protein at breakfast.",
      ],
      generatedAt: new Date().toISOString(),
    });
  }

  try {
    const prompt = `Generate a data-driven, constructive, motivating Weekly Review for a fitness app user based on their weekly logs.
Data:
- Completed Workouts: ${weekData?.completedWorkouts}/${weekData?.targetWorkouts}
- Weight Delta: ${weekData?.avgWeightChange} lbs
- Protein Adherence: ${weekData?.proteinAdherence}%
- Calorie Adherence: ${weekData?.calorieAdherence}%
- Activity Adherence: ${weekData?.activityAdherence}%
- Goal: ${weekData?.primaryGoal || "Build muscle and drop fat"}

Requirements:
- List 2-3 genuine achievements ("whatWentWell").
- List 1-2 constructive, non-shaming adjustment points ("whatCouldImprove").
- List 2-3 specific action items for next week ("nextWeekFocus").`;

    const response = await callGeminiWithFallback((model) => ({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatWentWell: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            whatCouldImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            nextWeekFocus: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["whatWentWell", "whatCouldImprove", "nextWeekFocus"],
        },
      },
    }));

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      id: "review-" + Date.now(),
      weekRange: weekData?.weekRange || "Current Week",
      avgWeightChange: weekData?.avgWeightChange || -0.5,
      completedWorkouts: weekData?.completedWorkouts || 3,
      targetWorkouts: weekData?.targetWorkouts || 3,
      proteinAdherencePercent: weekData?.proteinAdherence || 90,
      calorieAdherencePercent: weekData?.calorieAdherence || 94,
      activityAdherencePercent: weekData?.activityAdherence || 85,
      whatWentWell: parsed.whatWentWell,
      whatCouldImprove: parsed.whatCouldImprove,
      nextWeekFocus: parsed.nextWeekFocus,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Gemini Weekly Review Error (using fallback):", error);
    return res.json({
      id: "review-" + Date.now(),
      weekRange: weekData?.weekRange || "Past 7 Days",
      avgWeightChange: -0.6,
      completedWorkouts: 3,
      targetWorkouts: 3,
      proteinAdherencePercent: 91,
      calorieAdherencePercent: 94,
      activityAdherencePercent: 88,
      whatWentWell: ["Consistently hit scheduled training sessions.", "Protein target met on majority of days."],
      whatCouldImprove: ["Weekend step count dropped slightly."],
      nextWeekFocus: ["Keep current progression on compound movements."],
      generatedAt: new Date().toISOString(),
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kinetix Fitness Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
