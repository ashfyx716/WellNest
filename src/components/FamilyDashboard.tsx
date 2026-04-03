import { motion } from "framer-motion";
import { getState, addCarePulse } from "@/lib/wellnest-store";
import { useEffect, useRef, useState } from "react";
import MoodCalendar from "./MoodCalendar";
import BottomNav from "./BottomNav";
import { ArrowLeft } from "lucide-react";
import CareRecommendations from "./CareRecommendations";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { DailyEntry } from "@/lib/wellnest-store";
import { apiMoodToLocal } from "@/utils/apiMoodToLocal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WellnessRiskAlert from "./WellnessRiskAlert";
import type { MomMlRiskApi } from "@/types/mlInsights";
import { useNotifications } from "@/context/NotificationContext";

interface Props {
  onLogout: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  useLiveApi?: boolean;
}

type MomSummary = {
  moodEmoji: string;
  moodLabel: string;
  statusMessage: string;
  statusTone: string;
  last7Scores: number[];
};

type CareRecommendation = {
  title: string;
  description: string;
  emoji: string;
  actionType: string;
};

type MomCareGuide = {
  moodEmoji: string;
  moodLabel: string;
  wellnessLevel: string;
  moodTrend: string;
  trendDescription: string;
  doDos: string[];
  dontDos: string[];
  suggestions: CareRecommendation[];
  personalCareTip: string;
};

const FamilyDashboard = ({ onLogout, activeTab = "family", onTabChange, useLiveApi }: Props) => {
  const state = getState();
  const latest = state.entries[state.entries.length - 1];
  const { user } = useAuth();
  const notif = useNotifications();
  const [sent, setSent] = useState<string | null>(null);
  const [mom, setMom] = useState<MomSummary | null>(null);
  const [calEntries, setCalEntries] = useState<DailyEntry[]>(state.entries);
  const [linkOpen, setLinkOpen] = useState(false);
  const [momEmail, setMomEmail] = useState("");
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalText, setGoalText] = useState("");
  const [togetherOpen, setTogetherOpen] = useState(false);
  const [togetherMsg, setTogetherMsg] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [loveNote, setLoveNote] = useState("");
  const [momMlRisk, setMomMlRisk] = useState<MomMlRiskApi | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
    const [careGuide, setCareGuide] = useState<MomCareGuide | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!useLiveApi) return;

    // Fetch mother's data
    const fetchMomData = async () => {
      try {
        const [summary, calendar, risk] = await Promise.all([
          api.get<MomSummary>("/api/family/mom-summary"),
          api.get<{ days: { date: string; moodKey: string; hasEntry: boolean }[] }>("/api/family/mom-calendar"),
          api.get<MomMlRiskApi>("/api/family/mom-ml-risk"),
        ]);

        setMom(summary.data);
        setLastUpdated(Date.now());

        const mapped: DailyEntry[] = calendar.data.days
          .filter((d) => d.hasEntry && d.moodKey && d.moodKey !== "NONE")
          .map((d) => ({
            id: d.date,
            date: d.date,
            sleep: "okay",
            activity: "walked",
            diet: "normal",
            mood: apiMoodToLocal(d.moodKey),
          }));
        setCalEntries(mapped);
        setMomMlRisk(risk.data || null);
        
              // Fetch care guide recommendations
              try {
                const guideRes = await api.get<MomCareGuide>("/api/family/mom-care-guide");
                setCareGuide(guideRes.data);
              } catch {
                // Care guide is optional, continue without it
              }
      } catch (error) {
        console.error("Error fetching mom data:", error);
      }
    };

    // Fetch immediately
    void fetchMomData();

    // Poll every 5 seconds for real-time updates (aggressive polling for live demo)
    intervalRef.current = window.setInterval(() => {
      void fetchMomData();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [useLiveApi]);

  const refreshNow = async () => {
    try {
      const [summary, calendar, risk] = await Promise.all([
        api.get<MomSummary>("/api/family/mom-summary"),
        api.get<{ days: { date: string; moodKey: string; hasEntry: boolean }[] }>("/api/family/mom-calendar"),
        api.get<MomMlRiskApi>("/api/family/mom-ml-risk"),
      ]);

      setMom(summary.data);
      setLastUpdated(Date.now());

      const mapped: DailyEntry[] = calendar.data.days
        .filter((d) => d.hasEntry && d.moodKey && d.moodKey !== "NONE")
        .map((d) => ({
          id: d.date,
          date: d.date,
          sleep: "okay",
          activity: "walked",
          diet: "normal",
          mood: apiMoodToLocal(d.moodKey),
        }));
      setCalEntries(mapped);
      setMomMlRisk(risk.data || null);
      toast.success("Updated ✨");
      
          // Fetch care guide recommendations
          try {
            const guideRes = await api.get<MomCareGuide>("/api/family/mom-care-guide");
            setCareGuide(guideRes.data);
          } catch {
            // Care guide is optional
          }
    } catch {
      toast.error("Couldn't refresh — try again");
    }
  };

  const sendPulse = async (msg: string) => {
    if (useLiveApi) {
      try {
        await api.post("/api/care-pulse/send", { message: msg });
        toast.success("Your love has been sent! 💕");
      } catch (e: unknown) {
        toast.error("Link to mom first, or try again 🌿");
      }
    } else {
      addCarePulse({ from: "Family", message: msg, date: new Date().toISOString() });
    }
    setSent(msg);
    setTimeout(() => setSent(null), 3000);
  };

  const linkMother = async () => {
    try {
      await api.post("/api/family/link", { motherEmail: momEmail });
      toast.success("Linked — you're connected 💛");
      setLinkOpen(false);
      window.location.reload();
    } catch {
      toast.error("Couldn't find that mom account yet.");
    }
  };

  const moodLabel =
    mom?.statusMessage ??
    (latest?.mood === "calm"
      ? "Mom is flourishing! 🌸"
      : latest?.mood === "stressed"
        ? "Mom might need some love today 💕"
        : latest?.mood === "tired"
          ? "Mom seems a bit tired today"
          : latest
            ? "Mom is doing okay"
            : "Nothing logged yet — that's okay 🌿");

  const moodEmoji =
    mom?.moodEmoji ??
    (latest?.mood === "calm" ? "🌸" : latest?.mood === "stressed" ? "💜" : latest?.mood === "tired" ? "😴" : "🌿");

  const isStressed = mom?.statusTone === "alert" || latest?.mood === "stressed";
  const isGood = mom?.statusTone === "good" || latest?.mood === "calm";
  const urgentMomNotification = notif.items.find((n) => {
    const type = (n.type || "").toLowerCase();
    const text = `${n.title || ""} ${n.message || ""}`.toLowerCase();
    return (
      !n.read &&
      (type.includes("stress") || type.includes("risk") || text.includes("stressed") || text.includes("stress")) &&
      (text.includes("mom") || text.includes("mother"))
    );
  });

  const actions = [
    { emoji: "❤️", label: "Care Pulse", desc: "Thinking about you 💛", msg: "Thinking about you 💛" },
    { emoji: "🎤", label: "Voice Hug", desc: "Record up to 30s", msg: "voice" },
    { emoji: "🌼", label: "Gentle Goal", desc: "Nudge kindly", msg: "goal" },
    { emoji: "🧘", label: "Together", desc: "Shared moment", msg: "together" },
  ];

  const onAction = async (msg: string, label: string) => {
    if (msg === "voice") {
      setVoiceOpen(true);
      return;
    }
    if (msg === "goal") {
      setGoalOpen(true);
      return;
    }
    if (msg === "together") {
      setTogetherOpen(true);
      return;
    }
    await sendPulse(msg);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-body">Family Connect 🧡</p>
          <h1 className="text-2xl font-display font-bold text-foreground">Mom's Wellness</h1>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated > 0 && (
            <button
              type="button"
              onClick={() => void refreshNow()}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh mom's data"
            >
              🔄
            </button>
          )}
          <button type="button" onClick={onLogout} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {useLiveApi && user?.linkedMotherId == null && (
        <div className="px-6 mb-4">
          <button
            type="button"
            onClick={() => setLinkOpen(true)}
            className="w-full glass-card-strong py-3 text-sm font-display font-bold text-primary"
          >
            Link to Mom by email
          </button>
        </div>
      )}

      <WellnessRiskAlert
        show={useLiveApi && (momMlRisk?.showAlert ?? false)}
        message={momMlRisk?.message ?? ""}
        onSendCarePulse={() => void sendPulse("Thinking about you 💛")}
      />

      {urgentMomNotification && (
        <div className="mx-6 mb-4 glass-card-strong border-wellnest-coral/30 bg-wellnest-coral/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-display font-bold text-foreground">{urgentMomNotification.title}</p>
              <p className="mt-1 text-sm text-muted-foreground font-body">{urgentMomNotification.message}</p>
            </div>
            <button
              type="button"
              onClick={() => void notif.markRead(urgentMomNotification.id)}
              className="text-xs font-body px-2 py-1 rounded-md hover:bg-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <motion.div
        className={`mx-6 glass-card-strong mb-6 p-5 ${isStressed ? "border-wellnest-coral/30" : isGood ? "border-primary/30" : ""}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.span
            className="text-4xl"
            animate={isStressed ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {moodEmoji}
          </motion.span>
          <div className="flex-1">
            <p className="font-display font-bold text-lg text-foreground">{moodLabel}</p>
            {mom?.last7Scores && mom.last7Scores.length > 0 && (
              <div className="flex gap-0.5 mt-2 h-8 items-end">
                {mom.last7Scores.map((s, i) => (
                  <div key={i} className="w-2 rounded-sm bg-primary/40" style={{ height: `${20 + s * 10}%` }} />
                ))}
              </div>
            )}
            {latest && !useLiveApi && (
              <div className="flex gap-3 mt-2 text-sm text-muted-foreground font-body">
                <span>😴 {latest.sleep}</span>
                <span>🚶 {latest.activity}</span>
                <span>🥗 {latest.diet}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {sent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-6 mb-4 glass-card bg-primary/10 border-primary/20"
        >
          <div className="flex items-center gap-2 p-3">
            <motion.span className="text-xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: 3 }}>
              💕
            </motion.span>
            <p className="text-sm text-foreground font-body">Sent: "{sent}"</p>
          </div>
        </motion.div>
      )}

      <div className="px-6 mb-6">
        <h3 className="font-display font-bold text-foreground text-lg mb-3">Send Support</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, i) => (
            <motion.button
              key={action.label}
              type="button"
              onClick={() => void onAction(action.msg, action.label)}
              className="glass-card-strong flex flex-col items-center gap-2 py-5 px-3 hover:shadow-lg transition-all cursor-pointer"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, rotate: i % 2 === 0 ? 1 : -1 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-3xl">{action.emoji}</span>
              <span className="font-display font-bold text-sm text-foreground">{action.label}</span>
              <span className="text-[10px] text-muted-foreground font-body text-center">{action.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-6 mb-6">
        <h3 className="font-display font-bold text-foreground text-lg mb-2">Weekly Love Note 💌 Last sent: — </h3>
        <Button variant="outline" className="w-full mb-2" onClick={() => setNoteOpen(true)}>
          Write a love letter
        </Button>
      </div>

      {useLiveApi && careGuide && (
        <div className="mb-6">
          <CareRecommendations
            data={careGuide}
            onAction={(actionType) => {
              if (actionType === "care_pulse") {
                void sendPulse("Thinking about you 💛");
              } else if (actionType === "visit") {
                toast("🤗 Plan a short visit if possible");
              } else if (actionType === "checkin") {
                void sendPulse("Hey mom, how are you feeling today? 💚");
              }
            }}
          />
        </div>
      )}

      <MoodCalendar entries={useLiveApi ? calEntries : state.entries} />

      <div className="px-6 mt-6">
        <motion.button
          type="button"
          onClick={() => (useLiveApi ? nav("/family/archive") : nav("/family"))}
          className="glass-card w-full flex items-center justify-between p-4 hover:shadow-lg transition-all"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💌</span>
            <div className="text-left">
              <p className="font-display font-bold text-foreground">Love Archive</p>
              <p className="text-xs text-muted-foreground font-body">View all past love</p>
            </div>
          </div>
          <span className="text-muted-foreground">→</span>
        </motion.button>
      </div>

      {onTabChange && <BottomNav activeTab={activeTab} onTabChange={onTabChange} />}

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mom's email</DialogTitle>
          </DialogHeader>
          <Input placeholder="mother@email.com" value={momEmail} onChange={(e) => setMomEmail(e.target.value)} />
          <DialogFooter>
            <Button onClick={() => void linkMother()}>Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gentle goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[
              "Let's take a walk today 🚶‍♀️",
              "Try some light stretching 🧘‍♀️",
              "Drink more water today 💧",
              "Cook something you love 🍳",
            ].map((g) => (
              <Button key={g} variant="outline" className="w-full" onClick={() => setGoalText(g)}>
                {g}
              </Button>
            ))}
            <Input placeholder="Custom..." value={goalText} onChange={(e) => setGoalText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await api.post("/api/gentle-goal/assign", { goalText });
                  toast.success("Goal sent 🌼");
                  setGoalOpen(false);
                } catch {
                  toast.error("Could not assign goal.");
                }
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={togetherOpen} onOpenChange={setTogetherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wellness together</DialogTitle>
          </DialogHeader>
          <Input value={togetherMsg} onChange={(e) => setTogetherMsg(e.target.value)} placeholder="Let's both meditate at 7 PM 🧘" />
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await api.post("/api/wellness-together/invite", { message: togetherMsg || "Let's connect today 🌿" });
                  toast.success("Invite sent!");
                  setTogetherOpen(false);
                } catch {
                  toast.error("Try again?");
                }
              }}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Love note</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full min-h-[120px] rounded-md border border-input p-2 font-body"
            value={loveNote}
            onChange={(e) => setLoveNote(e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  await api.post("/api/love-note/send", { content: loveNote });
                  toast.success("Letter sent 💌");
                  setNoteOpen(false);
                } catch {
                  toast.error("Couldn't send note.");
                }
              }}
            >
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice hug</DialogTitle>
          </DialogHeader>
          <VoiceRecorder
            onSend={async (blob) => {
              const fd = new FormData();
              fd.append("file", blob, "hug.webm");
              fd.append("durationSeconds", "15");
              await api.post("/api/voice-hug/send", fd, { headers: { "Content-Type": "multipart/form-data" } });
              toast.success("Voice hug delivered 🎤");
              setVoiceOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function VoiceRecorder({ onSend }: { onSend: (b: Blob) => Promise<void> }) {
  const [phase, setPhase] = useState<"idle" | "recording" | "ready">("idle");
  const chunksRef = useRef<Blob[]>([]);
  const mrRef = useRef<MediaRecorder | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      setPhase("ready");
    };
    mr.start();
    mrRef.current = mr;
    setBlob(null);
    setPhase("recording");
    setTimeout(() => {
      if (mr.state === "recording") mr.stop();
    }, 29_000);
  };

  const stop = () => {
    mrRef.current?.stop();
  };

  return (
    <div className="space-y-3">
      {phase === "idle" && <Button onClick={() => void start()}>Start recording</Button>}
      {phase === "recording" && <Button onClick={stop}>Stop</Button>}
      {phase === "ready" && blob && blob.size > 0 && (
        <Button
          onClick={() =>
            void onSend(blob).then(() => {
              setPhase("idle");
              setBlob(null);
            })
          }
        >
          Send Voice Hug
        </Button>
      )}
    </div>
  );
}

export default FamilyDashboard;
