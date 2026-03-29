import { motion } from "framer-motion";
import type { DailyEntry } from "@/lib/wellnest-store";

interface BadgeShelfProps {
  entries: DailyEntry[];
  carePulseCount: number;
  streak: number;
}

interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
}

const BadgeShelf = ({ entries, carePulseCount, streak }: BadgeShelfProps) => {
  const goodSleepDays = entries.filter((e) => e.sleep === "great").length;
  const healthyDietDays = entries.filter((e) => e.diet === "healthy").length;
  const activeDays = entries.filter((e) => e.activity === "walked").length;
  const calmDays = entries.filter((e) => e.mood === "calm").length;

  const badges: Badge[] = [
    { id: "early-riser", emoji: "🌅", name: "Early Riser", description: "5 nights of great sleep", earned: goodSleepDays >= 5 },
    { id: "nourished", emoji: "🥗", name: "Nourished", description: "7 days healthy eating", earned: healthyDietDays >= 7 },
    { id: "step-queen", emoji: "🚶‍♀️", name: "Step Queen", description: "10 active days", earned: activeDays >= 10 },
    { id: "inner-peace", emoji: "🧘‍♀️", name: "Inner Peace", description: "Calm for a week", earned: calmDays >= 7 },
    { id: "loved", emoji: "💌", name: "Loved", description: "10 care pulses received", earned: carePulseCount >= 10 },
    { id: "consistent", emoji: "🔥", name: "Dedicated", description: "14 day streak", earned: streak >= 14 },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-foreground text-lg">Wellness Badges</h3>
        <span className="text-xs text-muted-foreground font-body">{earnedCount}/{badges.length} earned</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            className={`glass-card flex flex-col items-center py-4 px-2 text-center ${
              badge.earned ? "" : "opacity-40 grayscale"
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: badge.earned ? 1 : 0.4, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={badge.earned ? { scale: 1.05 } : {}}
          >
            <motion.span
              className="text-3xl"
              animate={badge.earned ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              {badge.emoji}
            </motion.span>
            <p className="text-xs font-display font-bold text-foreground mt-2">{badge.name}</p>
            <p className="text-[9px] text-muted-foreground font-body mt-0.5">{badge.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BadgeShelf;
