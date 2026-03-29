import { motion } from "framer-motion";

const EMOTION_STYLES: Record<string, { bg: string; border: string; bar: string }> = {
  HAPPY: { bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200", bar: "bg-yellow-400" },
  CALM: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200", bar: "bg-emerald-400" },
  NEUTRAL: { bg: "bg-muted/40", border: "border-border", bar: "bg-muted-foreground/50" },
  SAD: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200", bar: "bg-blue-400" },
  STRESSED: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200", bar: "bg-purple-400" },
};

export type BertResultCard = {
  emotion?: string | null;
  confidence?: number | null;
  message?: string | null;
};

export default function BertEmotionCard({ bertResult }: { bertResult: BertResultCard | null }) {
  if (!bertResult?.emotion) return null;

  const emotion = String(bertResult.emotion).toUpperCase();
  const styles = EMOTION_STYLES[emotion] ?? EMOTION_STYLES.NEUTRAL;
  const conf = typeof bertResult.confidence === "number" ? bertResult.confidence : 0;
  const percent = Math.min(100, Math.round(conf <= 1 ? conf * 100 : conf));

  return (
    <motion.div
      className={`rounded-2xl p-4 border ${styles.bg} ${styles.border} mt-2 w-full text-left`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🌿</span>
        <p className="font-display font-semibold text-foreground text-sm">Nesti heard you...</p>
      </div>
      {bertResult.message && (
        <p className="text-foreground font-body text-sm leading-relaxed mb-3">{bertResult.message}</p>
      )}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-body w-20 shrink-0">{emotion}</span>
        <div className="flex-1 bg-background/60 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${styles.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ delay: 0.5, duration: 0.55, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-body w-10 text-right">{percent}%</span>
      </div>
    </motion.div>
  );
}
