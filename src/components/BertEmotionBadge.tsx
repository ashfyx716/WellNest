import { motion } from "framer-motion";

type Props = {
  message: string | null;
  detectedLabel?: string | null;
};

export default function BertEmotionBadge({ message, detectedLabel }: Props) {
  if (!message?.trim()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl border border-wellnest-honey/25 bg-gradient-to-br from-wellnest-lavender/20 to-background p-4 text-left shadow-[0_8px_30px_rgba(139,92,246,0.08)]"
    >
        <p className="text-xs font-body text-muted-foreground">From your words 💛</p>
        <p className="font-display font-semibold text-foreground mt-1 leading-snug">{message}</p>
        {detectedLabel && (
          <p className="text-[11px] text-muted-foreground font-body mt-2">
            Nesti senses: <span className="text-foreground font-medium">{detectedLabel}</span>
          </p>
        )}
    </motion.div>
  );
}
