import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Search,
  Plus,
  Utensils,
  Check,
  Loader2,
  Camera,
  Upload,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  SwitchCamera,
  Info,
} from "lucide-react";
import { MealType } from "../../types";
import { useFitness } from "../../context/FitnessContext";
import { commonFoodDatabase } from "../../data/initialData";
import { aiService, ParsedFoodResult, AnalyzedPhotoFoodResult } from "../../services/aiService";

interface FoodLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMealType?: MealType;
  initialTab?: "camera" | "ai_parser" | "search" | "manual";
}

export const FoodLoggerModal: React.FC<FoodLoggerModalProps> = ({
  isOpen,
  onClose,
  initialMealType = "lunch",
  initialTab = "camera",
}) => {
  const { addFoodItem, addFoodItems } = useFitness();
  const [activeTab, setActiveTab] = useState<"camera" | "ai_parser" | "search" | "manual">(initialTab);
  const [mealType, setMealType] = useState<MealType>(initialMealType);

  // -------------------------------------------------------------
  // Camera & Image Vision State
  // -------------------------------------------------------------
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoNotes, setPhotoNotes] = useState<string>("");
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<AnalyzedPhotoFoodResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to downscale and compress images to max 1280px to guarantee fast upload and mobile stability
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // -------------------------------------------------------------
  // Natural Language AI Parser State
  // -------------------------------------------------------------
  const [nlpInput, setNlpInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedFoodResult | null>(null);

  // -------------------------------------------------------------
  // Search Database State
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // -------------------------------------------------------------
  // Manual Entry State
  // -------------------------------------------------------------
  const [manualName, setManualName] = useState("");
  const [manualServing, setManualServing] = useState("1 serving");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");

  // Sync initial tab & meal type on open
  useEffect(() => {
    if (isOpen) {
      setMealType(initialMealType);
      setActiveTab(initialTab);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, initialMealType, initialTab]);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    if (activeTab !== "camera") {
      stopCamera();
    }
  }, [activeTab]);

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera access is not supported by your browser or environment. You can still upload meal photos directly below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access or upload an image file.");
      } else {
        setCameraError("Unable to access camera. Please choose an image file from your device below.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextMode);
    if (cameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Capture frame from video stream to base64
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    handleAnalyzeImage(dataUrl, photoNotes);
  };

  // Handle photo file selection / drag-and-drop with auto compression
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzingPhoto(true);
      const compressedDataUrl = await compressImageFile(file);
      setCapturedImage(compressedDataUrl);
      stopCamera();
      handleAnalyzeImage(compressedDataUrl, photoNotes);
    } catch (err) {
      console.error("Failed to process image:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        stopCamera();
        handleAnalyzeImage(dataUrl, photoNotes);
      };
      reader.readAsDataURL(file);
    } finally {
      // Reset input value so user can re-select the same image or snap again
      e.target.value = "";
    }
  };

  // Trigger Gemini AI image analysis
  const handleAnalyzeImage = async (imageSrc: string, notes?: string) => {
    setIsAnalyzingPhoto(true);
    setPhotoAnalysisResult(null);

    try {
      const result = await aiService.analyzeFoodPhoto(imageSrc, "image/jpeg", notes);
      setPhotoAnalysisResult(result);
    } catch (err) {
      console.error("AI Photo analysis error:", err);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Remove individual item from photo parsed items
  const handleRemovePhotoItem = (index: number) => {
    if (!photoAnalysisResult) return;
    const updatedItems = photoAnalysisResult.items.filter((_, i) => i !== index);
    const updatedTotals = updatedItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: Math.round((acc.protein + item.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + item.carbs) * 10) / 10,
        fat: Math.round((acc.fat + item.fat) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setPhotoAnalysisResult({
      ...photoAnalysisResult,
      items: updatedItems,
      totals: updatedTotals,
    });
  };

  // Commit Photo Items to Food Diary
  const handleCommitPhotoItems = () => {
    if (!photoAnalysisResult || photoAnalysisResult.items.length === 0) return;
    const itemsToAdd = photoAnalysisResult.items.map((item) => ({
      name: item.name,
      mealType,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingSize: item.serving || "1 serving",
      timestamp: new Date().toISOString(),
      micros: item.micros,
    }));

    addFoodItems(itemsToAdd);
    onClose();
    resetPhotoState();
  };

  const resetPhotoState = () => {
    setCapturedImage(null);
    setPhotoAnalysisResult(null);
    setPhotoNotes("");
    setIsAnalyzingPhoto(false);
    stopCamera();
  };

  // -------------------------------------------------------------
  // NLP Parser Handlers
  // -------------------------------------------------------------
  const handleParseNlp = async () => {
    if (!nlpInput.trim()) return;
    setIsParsing(true);
    try {
      const result = await aiService.parseFood(nlpInput);
      setParsedResult(result);
    } catch (err) {
      console.error("Parse error:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitParsed = () => {
    if (!parsedResult || parsedResult.items.length === 0) return;
    const itemsToAdd = parsedResult.items.map((item) => ({
      name: item.name,
      mealType,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingSize: item.serving || "1 serving",
      timestamp: new Date().toISOString(),
      micros: item.micros,
    }));

    addFoodItems(itemsToAdd);
    onClose();
    setNlpInput("");
    setParsedResult(null);
  };

  // -------------------------------------------------------------
  // DB & Manual Handlers
  // -------------------------------------------------------------
  const filteredDbFoods = commonFoodDatabase.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCommitDbItem = (item: any) => {
    const qty = Number(servingMultiplier) || 1;
    addFoodItem({
      name: item.name,
      mealType,
      calories: Math.round(item.calories * qty),
      protein: Math.round(item.protein * qty * 10) / 10,
      carbs: Math.round(item.carbs * qty * 10) / 10,
      fat: Math.round(item.fat * qty * 10) / 10,
      servingSize: `${qty}x (${item.servingSize})`,
      timestamp: new Date().toISOString(),
    });
    onClose();
    setSearchQuery("");
  };

  const handleCommitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    addFoodItem({
      name: manualName.trim(),
      mealType,
      calories: Number(manualCalories) || 0,
      protein: Number(manualProtein) || 0,
      carbs: Number(manualCarbs) || 0,
      fat: Number(manualFat) || 0,
      servingSize: manualServing.trim() || "1 serving",
      timestamp: new Date().toISOString(),
    });

    onClose();
    setManualName("");
    setManualCalories("");
    setManualProtein("");
    setManualCarbs("");
    setManualFat("");
  };

  const mealOptions: { id: MealType; label: string }[] = [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "snack", label: "Snack" },
    { id: "drink", label: "Drink" },
  ];

  const examplePrompts = [
    "2 eggs, 3 tbsp longaniza and cheese",
    "200g grilled chicken breast, 1.5 cup jasmine rice and steamed broccoli",
    "1 scoop whey protein, 1 banana and 2 tbsp peanut butter",
    "8 oz ribeye steak with baked sweet potato and asparagus",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-gray-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Log Food & Macros</h2>
              <p className="text-[11px] text-gray-500 hidden sm:block">Scan photos with AI, describe meals, or search database</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Category Selector */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-white">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Log To Meal</label>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100/80 overflow-x-auto scrollbar-none">
            {mealOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMealType(opt.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all capitalize whitespace-nowrap text-center ${
                  mealType === opt.id
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 px-4 sm:px-6 gap-2 sm:gap-4 text-xs font-bold bg-white overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`py-2.5 sm:py-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "camera"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai_parser")}
            className={`py-2.5 sm:py-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "ai_parser"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast AI Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`py-2.5 sm:py-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "search"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Database</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`py-2.5 sm:py-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "manual"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-white">
          {/* ========================================================= */}
          {/* TAB 0: AI Camera & Vision Photo Scanner                   */}
          {/* ========================================================= */}
          {activeTab === "camera" && (
            <div className="space-y-4">
              {/* If no image captured yet and not analyzing */}
              {!capturedImage && !photoAnalysisResult && (
                <div className="space-y-4">
                  {/* Camera Viewfinder Box */}
                  <div className="relative rounded-2xl bg-gray-900 overflow-hidden border border-gray-100 aspect-4/3 flex flex-col items-center justify-center text-white">
                    {cameraActive ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Target Reticle Overlay */}
                        <div className="absolute inset-6 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                          <div className="flex justify-between">
                            <div className="w-4 h-4 border-t-2 border-l-2 border-gray-200" />
                            <div className="w-4 h-4 border-t-2 border-r-2 border-gray-200" />
                          </div>
                          <div className="text-center">
                            <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white/90">
                              Center your plate in frame
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-4 h-4 border-b-2 border-l-2 border-gray-200" />
                            <div className="w-4 h-4 border-b-2 border-r-2 border-gray-200" />
                          </div>
                        </div>

                        {/* Top-Right Camera Switch */}
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 transition-all shadow-md"
                          title="Switch camera"
                        >
                          <SwitchCamera className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center space-y-4 max-w-sm">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-white">AI Meal Photo Scanner</p>
                          <p className="text-xs text-slate-300 mt-1">
                            Snap your dish or ingredients. FatBot's computer vision AI will identify portions & macros.
                          </p>
                        </div>

                        {/* Primary Quick Snap Action */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => nativeCameraInputRef.current?.click()}
                            id="btn-snap-phone-camera"
                            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
                          >
                            <Camera className="w-6 h-6" />
                            <span>Take Photo</span>
                          </button>

                          {!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && (
                            <button
                              type="button"
                              onClick={startCamera}
                              id="btn-open-live-cam"
                              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold border border-gray-700 transition-all flex items-center justify-center gap-2"
                            >
                              <span>Live Stream WebCam</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hidden Native Mobile Camera Input */}
                  <input
                    ref={nativeCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Hidden Standard File Gallery Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Camera Shutter Bar if Active */}
                  {cameraActive && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold text-gray-500 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap & Analyze Photo</span>
                      </button>
                    </div>
                  )}

                  {/* Camera Error / Fallback Notice */}
                  {cameraError && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold">Live Stream Note</p>
                        <p className="text-[11px] leading-relaxed text-amber-800">{cameraError}</p>
                        <p className="text-[11px] font-semibold text-blue-700 pt-1">
                          Tip: Tap "Take Photo (Camera)" above to snap directly with your phone's native camera.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Secondary Action: Upload from Gallery / Files */}
                  <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-left w-full sm:w-auto">
                      <p className="text-xs font-bold text-gray-900">Or upload a photo from device</p>
                      <p className="text-[11px] text-gray-500">Accepts JPG, PNG, WEBP, or HEIC</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-900 transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-gray-900" />
                      <span>Choose from Gallery</span>
                    </button>
                  </div>

                  {/* Sample Test Meal Presets */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-900 mb-2">Or test with a sample meal:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const sampleImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                          setCapturedImage(sampleImage);
                          handleAnalyzeImage(sampleImage, "Healthy salmon bowl with avocado and quinoa");
                        }}
                        className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/60 hover:bg-gray-100 text-left text-xs transition-all"
                      >
                        <p className="font-bold text-gray-900">🥗 Salmon & Quinoa Bowl</p>
                        <p className="text-[10px] text-gray-500">Avocado, greens & salmon</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sampleImage = "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80";
                          setCapturedImage(sampleImage);
                          handleAnalyzeImage(sampleImage, "Grilled steak with roasted sweet potato");
                        }}
                        className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/60 hover:bg-gray-100 text-left text-xs transition-all"
                      >
                        <p className="font-bold text-gray-900">🥩 Steak & Sweet Potato</p>
                        <p className="text-[10px] text-gray-500">8oz sirloin with roasted yam</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* When an image is captured or selected */}
              {capturedImage && (
                <div className="space-y-4">
                  {/* Photo Preview Card */}
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-black/5 aspect-16/10 flex items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Captured meal"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={resetPhotoState}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-all shadow-md"
                      title="Retake or choose different photo"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    {isAnalyzingPhoto && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2.5">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                        <p className="text-sm font-bold">FatBot AI Vision Scanning...</p>
                        <p className="text-xs text-gray-600">Identifying foods, portions & micronutrient density</p>
                      </div>
                    )}
                  </div>

                  {/* Optional user notes */}
                  {!photoAnalysisResult && !isAnalyzingPhoto && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-900 block">
                        Add optional notes for AI (e.g. "half portion", "sauce on the side", "olive oil used"):
                      </label>
                      <input
                        type="text"
                        value={photoNotes}
                        onChange={(e) => setPhotoNotes(e.target.value)}
                        placeholder='e.g. "Dressing on the side, ate 3/4 of the bowl"'
                        className="w-full rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-200"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={resetPhotoState}
                          className="flex-1 py-2.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold text-gray-500 hover:text-gray-900"
                        >
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnalyzeImage(capturedImage, photoNotes)}
                          className="flex-2 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Analyze with Gemini AI</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Photo Analysis Result Card */}
                  {photoAnalysisResult && (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-blue-500/30/50 space-y-3 animate-fade-in">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs uppercase font-extrabold text-blue-500 tracking-wide">
                              AI Vision Breakdown
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                            {photoAnalysisResult.dishSummary || "Identified Meal Components"}
                          </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500">
                          {photoAnalysisResult.items.length} detected items
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 divide-y divide-[#EFECE6]">
                        {photoAnalysisResult.items.map((item, idx) => (
                          <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-[11px] text-gray-500">
                                <span className="font-semibold text-gray-900">{item.calories} kcal</span> ·{" "}
                                <span className="text-blue-500 font-semibold">{item.protein}g P</span> ·{" "}
                                <span className="text-amber-500 font-semibold">{item.carbs}g C</span> ·{" "}
                                <span className="text-rose-500 font-semibold">{item.fat}g F</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-100 text-gray-500 font-semibold">
                                {item.serving || "1 serving"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemovePhotoItem(idx)}
                                className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary Total */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase text-gray-500 font-bold">Total Meal Energy</p>
                          <p className="text-base font-extrabold text-gray-900">
                            {photoAnalysisResult.totals.calories} kcal
                          </p>
                        </div>
                        <div className="text-right text-xs font-bold text-gray-900 space-x-1.5">
                          <span className="text-blue-500">{photoAnalysisResult.totals.protein}g P</span>
                          <span>·</span>
                          <span className="text-amber-500">{photoAnalysisResult.totals.carbs}g C</span>
                          <span>·</span>
                          <span className="text-rose-500">{photoAnalysisResult.totals.fat}g F</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={resetPhotoState}
                          className="px-4 py-2.5 rounded-full bg-white border border-gray-100 text-xs font-bold text-gray-500 hover:text-gray-900"
                        >
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={handleCommitPhotoItems}
                          className="flex-1 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Log All to {mealType}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: Fast AI Parser (Natural Language Text)             */}
          {/* ========================================================= */}
          {activeTab === "ai_parser" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-900 mb-1.5 block">
                  Describe what you ate in natural language:
                </label>
                <div className="relative">
                  <textarea
                    value={nlpInput}
                    onChange={(e) => setNlpInput(e.target.value)}
                    placeholder='e.g., "2 eggs, 3 tbsp longaniza and cheese"'
                    rows={3}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-200 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Example Chips */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Try an example:</p>
                <div className="flex flex-wrap gap-1.5">
                  {examplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNlpInput(prompt)}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 text-left transition-all truncate max-w-full"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleParseNlp}
                disabled={isParsing || !nlpInput.trim()}
                className="w-full py-3 rounded-full bg-white hover:bg-gray-200 disabled:opacity-50 text-gray-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Decomposing & Calculating Micros...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze & Decompose Meal</span>
                  </>
                )}
              </button>

              {/* Parsed Result Preview */}
              {parsedResult && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-blue-500/30/40 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-blue-500 font-bold">
                      Parsed Items ({parsedResult.items.length})
                    </span>
                    <span className="text-xs text-gray-500">Ready to save</span>
                  </div>

                  <div className="space-y-2 divide-y divide-[#EFECE6]">
                    {parsedResult.items.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-[11px] text-gray-500">
                            {item.calories} kcal · {item.protein}g P · {item.carbs}g C · {item.fat}g F
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                          {item.serving || "1 serving"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Total */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 font-semibold">Total Energy</p>
                      <p className="text-sm font-bold text-gray-900">
                        {parsedResult.totals.calories} kcal
                      </p>
                    </div>
                    <div className="text-right text-xs font-semibold text-gray-900">
                      <span>{parsedResult.totals.protein}g P</span> ·{" "}
                      <span>{parsedResult.totals.carbs}g C</span> ·{" "}
                      <span>{parsedResult.totals.fat}g F</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCommitParsed}
                    className="w-full py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Log All to {mealType}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: Search Food Database                               */}
          {/* ========================================================= */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chicken breast, oats, salmon, eggs..."
                  className="w-full rounded-2xl bg-gray-50 border border-gray-100 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-200"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredDbFoods.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleCommitDbItem(item)}
                    className="p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-gray-900 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {item.servingSize} · {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{item.calories} kcal</p>
                      <p className="text-[10px] text-gray-500">
                        {item.protein}g P · {item.carbs}g C · {item.fat}g F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: Manual Food Entry                                  */}
          {/* ========================================================= */}
          {activeTab === "manual" && (
            <form onSubmit={handleCommitManual} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-900 block mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Ribeye Steak"
                  className="w-full rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900 block mb-1">Serving Description</label>
                <input
                  type="text"
                  value={manualServing}
                  onChange={(e) => setManualServing(e.target.value)}
                  placeholder="e.g. 1 fillet (200g)"
                  className="w-full rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="350"
                    className="w-full rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    placeholder="30"
                    className="w-full rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    placeholder="25"
                    className="w-full rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    placeholder="12"
                    className="w-full rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save to {mealType}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
