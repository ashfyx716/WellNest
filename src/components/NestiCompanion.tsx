import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { getLatestMood } from "@/lib/wellnest-store";

const moodTips: Record<string, string[]> = {
  calm: [
    "You're doing wonderful today! Keep it up 💛",
    "Your calm energy is beautiful — hold onto it 🌿",
    "You've been strong all week 💪🌸",
  ],
  okay: [
    "A good day starts with a small smile 😊",
    "Want to take a little break? You deserve it 🌿",
    "Aaj kaisi feel kar rahi ho? Let me know 💛",
  ],
  tired: [
    "You seem tired today… rest is also wellness 🧘‍♀️",
    "A gentle walk might lift your spirits 🚶‍♀️",
    "Thodi der aaram kar lo — you deserve it 🌙",
  ],
  stressed: [
    "Take a deep breath… I'm here for you 💕",
    "Let's try a 5-minute breathing exercise? 🫁",
    "Sab theek ho jayega — one step at a time 🌿",
  ],
};

const affirmations = [
  "You are stronger than you think 💪",
  "Today is a new beginning 🌅",
  "Your family loves you deeply 💛",
  "Small steps lead to big changes 🌱",
  "You matter. Always. 🌸",
];

const NestiCompanion = () => {
  const [open, setOpen] = useState(false);
  const mood = getLatestMood();
  const tips = moodTips[mood] || moodTips.okay;
  const [tipIndex] = useState(() => Math.floor(Math.random() * tips.length));
  const [affirmIndex] = useState(() => Math.floor(Math.random() * affirmations.length));

  // Orb color based on mood
  const orbColors: Record<string, string> = {
    calm: "from-primary/60 to-primary/30",
    okay: "from-wellnest-honey/60 to-primary/30",
    tired: "from-wellnest-lavender/60 to-primary/30",
    stressed: "from-wellnest-coral/60 to-wellnest-lavender/30",
  };
  const orbGradient = orbColors[mood] || orbColors.okay;

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="glass-card-strong mb-4 max-w-[280px] p-5"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">🌿</span>
              <div>
                <p className="font-display font-bold text-sm text-foreground">Nesti</p>
                <p className="text-sm text-muted-foreground mt-1 font-body leading-relaxed" style={{ fontStyle: "italic" }}>
                  "{tips[tipIndex]}"
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-body">✨ Today's affirmation</p>
                  <p className="text-sm font-body font-semibold text-foreground mt-1">
                    {affirmations[affirmIndex]}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glowing orb */}
      <motion.button
        onClick={() => setOpen(!open)}
        className={`w-16 h-16 rounded-full bg-gradient-to-br ${orbGradient} shadow-lg flex items-center justify-center text-2xl relative overflow-hidden`}
        whileTap={{ scale: 0.9 }}
        style={{
          boxShadow: "0 0 30px hsl(156 44% 43% / 0.3)",
        }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, white/30, transparent 60%)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.span
          className="relative z-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🌿
        </motion.span>
      </motion.button>
    </div>
  );
};

export default NestiCompanion;
