import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface LoveArchiveProps {
  pulses: { from: string; message: string; date: string }[];
  onBack: () => void;
}

const LoveArchive = ({ pulses, onBack }: LoveArchiveProps) => {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">Love Archive 💌</h1>
      </div>

      <p className="text-sm text-muted-foreground font-body mb-6">
        Every message of love, saved forever 💛
      </p>

      <div className="space-y-3">
        {pulses.slice().reverse().map((pulse, i) => (
          <motion.div
            key={i}
            className="glass-card p-4 border-l-4 border-wellnest-coral/40"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="font-display italic text-foreground">"{pulse.message}"</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground font-body">From {pulse.from}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {new Date(pulse.date).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {pulses.length === 0 && (
        <div className="text-center mt-20">
          <span className="text-5xl">💌</span>
          <p className="text-muted-foreground font-body mt-4">No messages yet</p>
        </div>
      )}
    </div>
  );
};

export default LoveArchive;
