import { motion } from "framer-motion";
import type { TopicInsightsPayload } from "@/types/mlInsights";

type Props = {
  topicInsights: TopicInsightsPayload | null | undefined;
  notesLoggedCount: number;
  minNotes?: number;
};

export default function TopicInsights({ topicInsights, notesLoggedCount, minNotes = 5 }: Props) {
  const topics = (topicInsights?.topics ?? []).filter(
    (t) => t.label && t.label !== "Not enough data yet" && (t.keywords?.length ?? 0) > 0
  );
  const insightMsg = topicInsights?.insight_message ?? "";

  if (notesLoggedCount < minNotes) return null;
  if (topics.length === 0) return null;

  return (
    <motion.div
      className="px-6 mt-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-display font-bold text-foreground text-lg mb-3">What&apos;s been on your mind lately? 💭</h3>
      <div className="glass-card-strong p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          {topics.slice(0, 5).map((t) => (
            <span
              key={`${t.topic_id ?? t.label}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-wellnest-lavender/15 border border-wellnest-lavender/25 px-3 py-1.5 text-xs font-display font-semibold text-foreground"
            >
              <span>{t.emoji ?? "🌿"}</span>
              {t.label}
            </span>
          ))}
        </div>
        {insightMsg && <p className="text-sm font-body text-foreground/90 leading-relaxed">{insightMsg}</p>}
      </div>
    </motion.div>
  );
}
