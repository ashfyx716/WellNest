import { motion } from "framer-motion";

interface MoodAuraProps {
  mood: string;
  children: React.ReactNode;
}

const moodClasses: Record<string, string> = {
  calm: "aura-calm",
  okay: "aura-neutral",
  happy: "aura-happy",
  stressed: "aura-stressed",
  tired: "aura-tired",
};

const MoodAura = ({ mood, children }: MoodAuraProps) => {
  const auraClass = moodClasses[mood] || "aura-neutral";

  return (
    <motion.div
      className={`min-h-screen ${auraClass} transition-all duration-[3000ms] relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.div>
  );
};

export default MoodAura;
