import { motion } from "framer-motion";
import WellnessCircle from "./WellnessCircle";
import MoodAura from "./MoodAura";
import BottomNav from "./BottomNav";
import MLInsightCard from "./MLInsightCard";
import type { MlInsightsApi } from "@/types/mlInsights";
import { getState, getLatestMood, getStreakDays } from "@/lib/wellnest-store";
import { apiMoodToAura, entryToCircleScores } from "@/utils/moodMap";
import { Bell } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export type DashboardSummaryApi = {
  streak: number;
  moodAura: string;
  sleepLogged: boolean;
  moodLogged: boolean;
  activityLogged: boolean;
  dietLogged: boolean;
  todayMood: string | null;
  nestiStatus: string;
  todayEntry: {
    sleepQuality?: string;
    mood?: string;
    activity?: string;
    diet?: string;
  } | null;
};

export type MomInboxItemApi = {
  kind: "NOTE" | "VOICE" | "PULSE";
  id: number;
  senderName: string;
  content: string;
  date: string;
  audioUrl?: string | null;
};

interface Props {
  onCheckIn: () => void;
  onJourney: () => void;
  onFamily: () => void;
  onRelax: () => void;
  onLogout: () => void;
  onNotifications?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  apiSummary?: DashboardSummaryApi | null;
  smartSuggestion?: string | null;
  carePulse?: { message: string } | null;
  mlInsights?: MlInsightsApi | null;
  familyInbox?: MomInboxItemApi[];
}

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h >= 9 && h < 21) {
    if (h < 12) return { text: "Good morning!", emoji: "☀️", sub: "Ready to bloom today?" };
    if (h < 17) return { text: "Good afternoon!", emoji: "🌿", sub: "Hope your day is going well 🌿" };
    return { text: "Good evening!", emoji: "🌙", sub: "Time to wind down, you deserve it 🌙" };
  }
  return { text: "Evening wind-down", emoji: "🌙", sub: "The day can rest; so can you 🌙" };
};

const MotherDashboard = ({
  onCheckIn,
  onJourney,
  onFamily,
  onRelax,
  onLogout,
  onNotifications,
  activeTab,
  onTabChange,
  apiSummary,
  smartSuggestion,
  carePulse,
  mlInsights,
  familyInbox = [],
}: Props) => {
  const state = getState();
  const localMood = getLatestMood();
  const localStreak = getStreakDays();
  const latest = state.entries[state.entries.length - 1];
  const greeting = getTimeGreeting();

  const auraKey = apiSummary
    ? apiMoodToAura(apiSummary.moodAura || apiSummary.todayMood)
    : localMood;

  const streak = apiSummary?.streak ?? localStreak;

  let sleepVal = 0;
  let moodVal = 0;
  let actVal = 0;
  let dietVal = 0;
  if (apiSummary?.todayEntry) {
    const s = entryToCircleScores(apiSummary.todayEntry);
    sleepVal = s.sleep;
    moodVal = s.mood;
    actVal = s.activity;
    dietVal = s.diet;
  } else if (latest) {
    sleepVal = latest.sleep === "great" ? 100 : latest.sleep === "okay" ? 60 : 30;
    moodVal = latest.mood === "calm" ? 100 : latest.mood === "okay" ? 60 : 30;
    actVal = latest.activity === "walked" ? 100 : 40;
    dietVal = latest.diet === "healthy" ? 100 : latest.diet === "normal" ? 60 : 30;
  }

  const pulseMsg = carePulse?.message ?? state.carePulses[state.carePulses.length - 1]?.message;

  const moodEmoji: Record<string, string> = {
    calm: "😊",
    okay: "😐",
    tired: "😔",
    stressed: "😣",
    happy: "😊",
  };

  const bannerMood = auraKey;
  const notif = useNotifications();
  const [showDrop, setShowDrop] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8081";
  const [voiceBlobUrls, setVoiceBlobUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    let isActive = true;
    const createdUrls: string[] = [];

    const voiceItems = familyInbox.filter((item) => item.kind === "VOICE");
    if (voiceItems.length === 0) return;

    const loadVoiceBlobs = async () => {
      for (const item of voiceItems) {
        if (voiceBlobUrls[item.id]) continue;
        try {
          const res = await api.get<Blob>(`/api/voice-hug/${item.id}/download`, {
            responseType: "blob",
          });
          const blobUrl = URL.createObjectURL(res.data);
          createdUrls.push(blobUrl);
          if (isActive) {
            setVoiceBlobUrls((prev) => ({ ...prev, [item.id]: blobUrl }));
          }
        } catch {
          // fallback to static URL if blob fetch fails
        }
      }
    };

    void loadVoiceBlobs();

    return () => {
      isActive = false;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [familyInbox]);

  return (
    <MoodAura mood={bannerMood}>
      <div className="pb-28">
        <div className="px-6 pt-8 pb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground font-body">
              {greeting.emoji} {greeting.sub}
            </p>
            <h1 className="text-3xl font-display font-bold text-foreground">{greeting.text}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                className="p-2 rounded-full hover:bg-muted/50 relative"
                onClick={() => {
                  setShowDrop((v) => !v);
                  onNotifications?.();
                }}
              >
                <Bell className="w-5 h-5" />
                {notif.unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-wellnest-coral rounded-full" />
                )}
              </button>
              {showDrop && (
                <div className="absolute right-0 top-full mt-1 w-72 max-h-64 overflow-y-auto glass-card-strong z-50 text-left text-sm p-2 space-y-1">
                  {notif.items.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-3">All caught up 🌿</p>
                  ) : (
                    notif.items.slice(0, 12).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 block"
                        onClick={() => void notif.markRead(n.id)}
                      >
                        <span className="font-semibold block">{n.title}</span>
                        <span className="text-muted-foreground text-xs">{n.message}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-muted-foreground hover:text-foreground font-body whitespace-nowrap"
            >
              See you soon 🌸
            </button>
          </div>
        </div>

        <motion.div
          className="mx-6 mt-4 glass-card-strong flex items-center gap-4 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-3xl">{moodEmoji[bannerMood] || "🌿"}</span>
          <div className="flex-1">
            <p className="font-display font-bold text-foreground">
              {apiSummary?.nestiStatus ??
                (bannerMood === "calm"
                  ? "Feeling peaceful today"
                  : bannerMood === "stressed"
                    ? "A little stressed — that's okay 💕"
                    : bannerMood === "tired"
                      ? "Rest is also wellness 🧘‍♀️"
                      : "Doing okay today")}
            </p>
            {streak > 0 && (
              <p
                className="text-sm text-muted-foreground font-body flex items-center gap-1"
                title="Keep showing up for yourself"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  🔥
                </motion.span>
                <span className="font-mono">{streak}</span> day streak
              </p>
            )}
          </div>
        </motion.div>

        {pulseMsg && (
          <motion.div
            className="mx-6 mt-4 glass-card p-4 border-wellnest-coral/40 shadow-[0_0_20px_rgba(232,115,90,0.15)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-sm font-body text-foreground flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex"
              >
                💕
              </motion.span>
              <span className="font-display italic">{pulseMsg}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 animate-heartbeat inline-block">
              Care pulse from your circle
            </p>
          </motion.div>
        )}

        <motion.div
          className="flex justify-center mt-10 sm:mt-12 mb-14 sm:mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <WellnessCircle sleep={sleepVal} mood={moodVal} activity={actVal} diet={dietVal} />
        </motion.div>

        {familyInbox.length > 0 && (
          <motion.div
            className="mx-6 mt-3 glass-card p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-display font-bold text-foreground mb-2">From your family 💌</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {familyInbox.slice(0, 8).map((item) => (
                <div key={`${item.kind}-${item.id}`} className="rounded-lg border border-border/50 p-3 bg-background/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-display font-semibold text-foreground">
                      {item.kind === "NOTE" ? "Love Letter" : item.kind === "VOICE" ? "Voice Hug" : "Care Pulse"} • {item.senderName}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>

                  {item.kind === "NOTE" && (
                    <details className="mt-2">
                      <summary className="text-sm text-primary cursor-pointer">Open letter</summary>
                      <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{item.content}</p>
                    </details>
                  )}

                  {item.kind === "PULSE" && (
                    <p className="mt-2 text-sm text-foreground">{item.content}</p>
                  )}

                  {item.kind === "VOICE" && item.audioUrl && (
                    <audio
                      controls
                      className="w-full mt-2"
                      src={voiceBlobUrls[item.id] ?? `${apiBase}${item.audioUrl}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="px-6 grid grid-cols-2 gap-4 pt-2">
          <motion.button
            onClick={onCheckIn}
            className="glass-card-strong flex flex-col items-center gap-3 py-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">💬</span>
            <span className="font-display font-bold text-sm text-foreground">How are you today?</span>
          </motion.button>

          <motion.button
            onClick={onJourney}
            className="glass-card-strong flex flex-col items-center gap-3 py-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">🌳</span>
            <span className="font-display font-bold text-sm text-foreground">Your Journey</span>
          </motion.button>

          <motion.button
            onClick={onFamily}
            className="glass-card-strong flex flex-col items-center gap-3 py-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">👨‍👩‍👧</span>
            <span className="font-display font-bold text-sm text-foreground">Family</span>
          </motion.button>

          <motion.button
            onClick={onRelax}
            className="glass-card-strong flex flex-col items-center gap-3 py-6 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">🧘</span>
            <span className="font-display font-bold text-sm text-foreground">Relax</span>
          </motion.button>
        </div>

        <div className="mx-6 mt-6">
          <div className="glass-card p-5">
            <p className="text-xs text-muted-foreground font-body">💡 Smart suggestion</p>
            <p className="font-display font-semibold text-foreground mt-1">
              {smartSuggestion ??
                (bannerMood === "stressed"
                  ? "Take a 10-minute rest — you've earned it 🌿"
                  : bannerMood === "tired"
                    ? "A gentle walk might brighten your day 🚶‍♀️"
                    : "You're doing beautifully! Keep it up 🌸")}
            </p>
          </div>
        </div>

        <MLInsightCard insights={mlInsights ?? null} />

        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </MoodAura>
  );
};

export default MotherDashboard;
