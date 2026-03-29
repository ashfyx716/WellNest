import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ConfettiCelebration from "./ConfettiCelebration";
import { addEntry, type DailyEntry } from "@/lib/wellnest-store";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import BertEmotionBadge from "./BertEmotionBadge";
import BertEmotionCard from "./checkin/BertEmotionCard";
import SpeechInput from "./nesti/SpeechInput";
import type { BertResultPayload, SaveCheckinApiResponse } from "@/types/mlInsights";

interface Props {
  onComplete: () => void;
  initialSection?: string;
}

type Step = "sleep" | "activity" | "diet" | "mood" | "note" | "done";

type EntryApi = {
  sleepQuality: string;
  activity: string;
  diet: string;
  mood: string;
  notes?: string;
};

const stepBackgrounds: Record<string, string> = {
  sleep: "from-wellnest-lavender/25 to-background",
  activity: "from-wellnest-honey/25 to-background",
  diet: "from-wellnest-coral/15 to-background",
  mood: "from-primary/15 to-background",
  note: "from-wellnest-lavender/15 to-background",
  done: "from-primary/20 to-background",
};

const ConversationalEntry = ({ onComplete, initialSection }: Props) => {
  const nav = useNavigate();
  const { token, isGuest } = useAuth();
  const [step, setStep] = useState<Step>((initialSection as Step) || "sleep");
  const [entry, setEntry] = useState<Partial<EntryApi>>({});
  const [note, setNote] = useState("");
  const [insight, setInsight] = useState<string | null>(null);
  const [bertMessage, setBertMessage] = useState<string | null>(null);
  const [bertLabel, setBertLabel] = useState<string | null>(null);
  const [bertCard, setBertCard] = useState<BertResultPayload | null>(null);

  const steps: Step[] = ["sleep", "activity", "diet", "mood", "note"];
  const currentIndex = steps.indexOf(step === "done" ? "mood" : step);

  const advance = useCallback((next: Step) => {
    setTimeout(() => setStep(next), 500);
  }, []);

  const handleSelect = (field: keyof EntryApi, value: string, next: Step) => {
    setEntry((prev) => ({ ...prev, [field]: value }));
    advance(next);
  };

  const goBack = () => {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
    else nav(-1);
  };

  const skip = () => {
    const i = steps.indexOf(step);
    if (i >= 0 && i < steps.length - 1) setStep(steps[i + 1]);
  };

  const toLocalEntry = (): DailyEntry => ({
    id: Date.now().toString(),
    date: new Date().toISOString().split("T")[0],
    sleep:
      entry.sleepQuality === "POOR" ? "poor" : entry.sleepQuality === "OKAY" ? "okay" : "great",
    activity:
      entry.activity === "WALKED" || entry.activity === "YOGA" ? "walked" : "sitting",
    diet:
      entry.diet === "HEALTHY"
        ? "healthy"
        : entry.diet === "NORMAL"
          ? "normal"
          : "not-great",
    mood:
      entry.mood === "HAPPY" || entry.mood === "CALM"
        ? "calm"
        : entry.mood === "NEUTRAL"
          ? "okay"
          : entry.mood === "STRESSED"
            ? "stressed"
            : entry.mood === "TIRED" || entry.mood === "SAD"
              ? "tired"
              : "okay",
    note,
  });

  const handleSave = async () => {
    const full: EntryApi = {
      sleepQuality: entry.sleepQuality ?? "OKAY",
      activity: entry.activity ?? "RESTED",
      diet: entry.diet ?? "NORMAL",
      mood: entry.mood ?? "NEUTRAL",
      notes: note || undefined,
    };

    addEntry(toLocalEntry());

    setBertMessage(null);
    setBertLabel(null);
    setBertCard(null);

    if (token && !isGuest) {
      try {
        const { data: saved } = await api.post<SaveCheckinApiResponse>("/api/checkin/save", full);
        const br = saved.bert_result;
        if (br?.emotion) {
          setBertCard({
            emotion: br.emotion,
            confidence: br.confidence ?? null,
            message: br.message ?? null,
          });
        }
        const entry = saved.entry;
        if (entry.bertConflictsWithManual && entry.bertNestiMessage) {
          setBertMessage(entry.bertNestiMessage);
          setBertLabel(entry.bertDetectedEmotion ?? null);
        }
        const { data } = await api.get<{ insight: string }>("/api/checkin/insight");
        setInsight(data.insight);
      } catch {
        toast.error("Saved locally — cloud sync missed a beat.");
        setInsight("Thank you for checking in! You're doing something kind for yourself today 💛");
      }
    } else {
      setInsight("Thank you for checking in! You're doing something kind for yourself today 💛");
    }

    setStep("done");
  };

  const sleepQ = {
    question: "How did you sleep last night?",
    field: "sleepQuality" as const,
    next: "activity" as Step,
    options: [
      { value: "POOR", emoji: "😴", label: "Poor", glow: "shadow-red-200/40" },
      { value: "OKAY", emoji: "😐", label: "Okay", glow: "shadow-amber-200/40" },
      { value: "GOOD", emoji: "😊", label: "Good", glow: "shadow-emerald-200/40" },
    ],
  };

  const activityQ = {
    question: "Were you physically active today?",
    field: "activity" as const,
    next: "diet" as Step,
    options: [
      { value: "WALKED", emoji: "🚶‍♀️", label: "Took a walk" },
      { value: "YOGA", emoji: "🧘‍♀️", label: "Yoga / exercise" },
      { value: "RESTED", emoji: "🛋️", label: "Rested today" },
      { value: "NOT_ACTIVE", emoji: "🚫", label: "Not active" },
    ],
  };

  const dietQ = {
    question: "How did you eat today?",
    field: "diet" as const,
    next: "mood" as Step,
    options: [
      { value: "HEALTHY", emoji: "🥗", label: "Healthy" },
      { value: "NORMAL", emoji: "🍽️", label: "Normal / mixed" },
      { value: "JUNK", emoji: "🍕", label: "More treats" },
      { value: "SKIPPED", emoji: "⏭️", label: "Skipped meals" },
    ],
  };

  const moodQ = {
    question: "How are you feeling right now?",
    field: "mood" as const,
    next: "note" as Step,
    options: [
      { value: "HAPPY", emoji: "😊", label: "Happy" },
      { value: "CALM", emoji: "😌", label: "Calm" },
      { value: "NEUTRAL", emoji: "😐", label: "Neutral" },
      { value: "SAD", emoji: "😔", label: "Sad" },
      { value: "STRESSED", emoji: "😰", label: "Stressed" },
      { value: "TIRED", emoji: "😴", label: "Tired" },
    ],
  };

  const questionMap = { sleep: sleepQ, activity: activityQ, diet: dietQ, mood: moodQ };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-b ${stepBackgrounds[step]} px-6 py-10 transition-all duration-700`}
    >
      {step !== "done" && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 w-full max-w-md px-4">
          <div className="flex items-center gap-2 w-full justify-between">
            <button type="button" onClick={goBack} className="text-sm text-muted-foreground font-body">
              ← Back
            </button>
            <button type="button" onClick={skip} className="text-sm text-primary font-body">
              Skip
            </button>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <motion.div
                key={s}
                className={`rounded-full transition-all h-3 ${
                  i < currentIndex ? "bg-primary w-3" : i === currentIndex ? "bg-primary w-8" : "bg-border w-3"
                }`}
                layout
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step !== "done" && step !== "note" && questionMap[step as keyof typeof questionMap] && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="max-w-lg w-full flex flex-col items-center gap-8 mt-12"
          >
            <h2 className="text-2xl font-display font-bold text-foreground text-center leading-snug">
              {questionMap[step as keyof typeof questionMap].question}
            </h2>
            <div
              className={`grid gap-4 w-full ${
                step === "mood" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
              }`}
            >
              {questionMap[step as keyof typeof questionMap].options.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    handleSelect(
                      questionMap[step as keyof typeof questionMap].field,
                      opt.value,
                      questionMap[step as keyof typeof questionMap].next
                    )
                  }
                  className={`glass-card-strong flex flex-col items-center gap-2 py-6 hover:shadow-lg border border-transparent hover:border-primary/30 ${"glow" in opt ? opt.glow : ""}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="font-display font-semibold text-sm text-foreground text-center px-1">
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "note" && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="max-w-lg w-full flex flex-col items-center gap-6 mt-12"
          >
            <h2 className="text-2xl font-display font-bold text-foreground text-center">
              Anything you want to share? (optional)
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A thought, a win, a worry — all welcome 🌿"
              className="w-full h-36 rounded-2xl glass-card-strong p-4 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 font-body"
            />
            <div className="flex justify-center w-full">
              <SpeechInput
                variant="pill"
                onResult={(text) => setNote((prev) => (prev ? `${prev} ${text}` : text).trim())}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleSave()}
              className="wellnest-btn-large bg-gradient-to-r from-primary to-primary/85 text-primary-foreground w-full hover:shadow-lg"
            >
              Save My Day 💛
            </button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center max-w-md"
          >
            <ConfettiCelebration />
            <motion.span className="text-7xl" animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 2, repeat: 1 }}>
              🙏
            </motion.span>
            <h2 className="text-3xl font-display font-bold text-foreground">Your ritual is complete 🙏</h2>
            <p className="text-muted-foreground font-body">{insight}</p>
            <BertEmotionCard bertResult={bertCard} />
            <BertEmotionBadge message={bertMessage} detectedLabel={bertLabel} />
            <button
              type="button"
              onClick={onComplete}
              className="wellnest-btn-large bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationalEntry;
