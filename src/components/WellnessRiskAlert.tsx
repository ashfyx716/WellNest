import { motion } from "framer-motion";
import { Heart } from "lucide-react";

type Props = {
  show: boolean;
  message: string;
  onSendCarePulse?: () => void;
};

export default function WellnessRiskAlert({ show, message, onSendCarePulse }: Props) {
  if (!show || !message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mb-4 rounded-2xl border border-rose-200/40 bg-gradient-to-r from-rose-50/90 to-wellnest-coral/10 dark:from-rose-950/40 dark:to-wellnest-coral/5 p-4 shadow-sm"
    >
      <div className="flex gap-3 items-start">
        <span className="text-2xl shrink-0">💕</span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-foreground text-sm">A gentle heads-up</p>
          <p className="text-sm font-body text-foreground/85 mt-1 leading-relaxed">{message}</p>
          {onSendCarePulse && (
            <button
              type="button"
              onClick={onSendCarePulse}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-wellnest-coral/90 text-white text-xs font-display font-bold px-4 py-2 hover:opacity-95 transition-opacity"
            >
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
              Send Care Pulse
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
