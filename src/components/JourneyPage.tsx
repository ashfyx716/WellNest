import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getState, getStreakDays } from "@/lib/wellnest-store";
import BottomNav from "./BottomNav";
import BadgeShelf from "./BadgeShelf";
import TopicInsights from "./TopicInsights";
import { ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { MlInsightsApi } from "@/types/mlInsights";

type EmotionDayRow = {
  date: string;
  emotion: string;
  confidence: number | null;
  nestiMessage: string | null;
};

interface Props {
  onBack: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const JourneyPage = ({ onBack, activeTab, onTabChange }: Props) => {
  const { token, isGuest } = useAuth();
  const [mlPack, setMlPack] = useState<MlInsightsApi | null>(null);
  const [emotionDays, setEmotionDays] = useState<EmotionDayRow[]>([]);
  const state = getState();
  const streak = getStreakDays();
  const entries = state.entries;

  useEffect(() => {
    if (!token || isGuest) {
      setMlPack(null);
      setEmotionDays([]);
      return;
    }
    let cancel = false;
    void api
      .get<MlInsightsApi>("/api/dashboard/ml-insights")
      .then(({ data }) => {
        if (!cancel) setMlPack(data);
      })
      .catch(() => {
        if (!cancel) setMlPack(null);
      });
    void api
      .get<EmotionDayRow[]>("/api/checkin/emotion-history")
      .then(({ data }) => {
        if (!cancel) setEmotionDays(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancel) setEmotionDays([]);
      });
    return () => {
      cancel = true;
    };
  }, [token, isGuest]);
  const totalHealthy = entries.filter((e) => e.mood === "calm" && e.sleep !== "poor").length;
  const totalStress = entries.filter((e) => e.mood === "stressed").length;

  // Tree visual state
  const treeState = streak >= 14 ? "lush" : streak >= 7 ? "growing" : streak >= 3 ? "young" : "seed";
  const leafColor = totalStress > totalHealthy ? "text-wellnest-honey" : "text-primary";

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Your Journey</h1>
        </div>
      </div>

      {/* Living Wellness Tree */}
      <motion.div
        className="mx-6 glass-card-strong flex flex-col items-center py-12 mb-6 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Background foliage */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/20 to-transparent" />
        </div>

        {/* Tree SVG */}
        <div className="relative">
          {/* Falling petals for lush tree */}
          {treeState === "lush" && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-sm"
                  style={{ left: `${20 + i * 15}%`, top: 0 }}
                  animate={{ y: [0, 80], x: [0, (i % 2 === 0 ? 15 : -15)], opacity: [1, 0], rotate: [0, 180] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeIn" }}
                >
                  🌸
                </motion.span>
              ))}
            </>
          )}

          {/* Falling leaves for stressed */}
          {totalStress > totalHealthy && treeState !== "seed" && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-sm"
                  style={{ left: `${25 + i * 15}%`, top: 0 }}
                  animate={{ y: [0, 60], x: [0, (i % 2 === 0 ? 10 : -10)], opacity: [0.7, 0], rotate: [0, 120] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
                >
                  🍂
                </motion.span>
              ))}
            </>
          )}

          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
          >
            <span className="text-[100px] block">
              {treeState === "lush" ? "🌳" : treeState === "growing" ? "🌲" : treeState === "young" ? "🌱" : "🪴"}
            </span>
          </motion.div>
        </div>

        <p className="mt-4 font-display font-bold text-xl text-foreground">
          {streak > 0 ? `${streak} day streak` : "Plant your first seed!"}
        </p>
        <p className={`text-sm font-body mt-1 ${leafColor}`}>
          {treeState === "lush" ? "Your tree is flourishing! 🌸" :
           treeState === "growing" ? "Growing beautifully! Keep it up" :
           treeState === "young" ? "Your seedling is sprouting 🌱" :
           "Log daily to grow your wellness tree"}
        </p>

        {/* Growth rings */}
        {streak >= 7 && (
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: Math.floor(streak / 7) }, (_, i) => (
              <motion.div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-primary/40 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-3 h-3 rounded-full bg-primary/30" />
              </motion.div>
            ))}
            <span className="text-xs text-muted-foreground font-body ml-1">growth rings</span>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="px-6 grid grid-cols-3 gap-3 mb-6">
        {[
          { val: entries.length, label: "Entries", emoji: "📝" },
          { val: totalHealthy, label: "Good Days", emoji: "🌟" },
          { val: streak, label: "Streak", emoji: "🔥" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-card text-center py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <span className="text-lg">{stat.emoji}</span>
            <p className="text-2xl font-mono font-bold text-foreground">{stat.val}</p>
            <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badge Shelf */}
      <BadgeShelf entries={entries} carePulseCount={state.carePulses.length} streak={streak} />

      <TopicInsights
        topicInsights={mlPack?.topic_insights}
        notesLoggedCount={mlPack?.notes_logged_count ?? 0}
        minNotes={5}
      />

      {emotionDays.length > 0 && (
        <div className="px-6 mt-6">
          <h3 className="font-display font-bold text-foreground text-lg mb-3">🧠 What Nesti heard in your words</h3>
          <div className="glass-card-strong p-4 space-y-3">
            {emotionDays.map((row, i) => {
              const pct =
                row.confidence == null
                  ? 0
                  : row.confidence <= 1
                    ? Math.round(row.confidence * 100)
                    : Math.round(row.confidence);
              const w = Math.min(100, Math.max(0, pct));
              return (
                <div key={`${row.date}-${i}`} className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between text-xs text-muted-foreground font-body">
                    <span>{row.date}</span>
                    <span className="text-foreground font-medium">{row.emotion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${w}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="px-6 mt-6 space-y-2">
          <h3 className="font-display font-bold text-foreground text-lg">Recent Days</h3>
          {entries
            .slice(-5)
            .reverse()
            .map((e, i) => (
              <motion.div
                key={i}
                className="glass-card flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {e.mood === "calm" ? "😊" : e.mood === "stressed" ? "😣" : e.mood === "tired" ? "😔" : "😐"}
                  </span>
                  <div>
                    <p className="text-sm font-display font-semibold text-foreground">{e.date}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      Sleep: {e.sleep} · Diet: {e.diet}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default JourneyPage;
