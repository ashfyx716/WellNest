import { motion } from "framer-motion";
import type { MlInsightsApi } from "@/types/mlInsights";

type Props = {
  insights: MlInsightsApi | null;
  loading?: boolean;
};

const riskStyles: Record<string, string> = {
  LOW: "from-emerald-500/10 to-emerald-600/5 border-emerald-400/25",
  MEDIUM: "from-amber-400/15 to-amber-500/5 border-amber-400/30",
  HIGH: "from-rose-400/20 to-rose-500/10 border-rose-300/35",
};

export default function MLInsightCard({ insights, loading }: Props) {
  if (loading) {
    return (
      <div className="mx-6 mt-4 glass-card p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
        <div className="h-16 bg-muted/70 rounded" />
      </div>
    );
  }

  if (!insights) return null;

  const risk = insights.risk_prediction ?? {};
  const level = (risk.risk_level ?? "LOW").toUpperCase();
  const topicPayload = insights.topic_insights ?? {};
  const topics = (topicPayload.topics ?? []).filter(
    (t) => t.label && t.label !== "Not enough data yet"
  );
  const insightMsg = topicPayload.insight_message ?? "";

  const riskBg = riskStyles[level] ?? riskStyles.LOW;

  return (
    <div className="mx-6 mt-4 space-y-4">
      <motion.div
        className={`rounded-2xl border p-5 bg-gradient-to-br ${riskBg} shadow-sm`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Nesti pattern check</p>
        <p className="font-display font-bold text-lg text-foreground mt-1">{risk.risk_label ?? "🌿 Looking at your rhythm"}</p>
        <p className="text-sm font-body text-foreground/90 mt-2 leading-relaxed">{risk.prediction_message}</p>
        {risk.top_risk_factors && risk.top_risk_factors.length > 0 && (
          <ul className="mt-3 text-xs font-body text-muted-foreground space-y-1">
            {risk.top_risk_factors.slice(0, 4).map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        )}
      </motion.div>

      {topics.length > 0 && (
        <motion.div
          className="glass-card p-5 border border-primary/15"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-xs text-muted-foreground font-body">What&apos;s been on your mind lately? 💭</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {topics.slice(0, 3).map((t) => (
              <span
                key={`${t.topic_id ?? t.label}-${t.label}`}
                className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1.5 text-xs font-display font-semibold text-foreground"
              >
                <span>{t.emoji ?? "🌿"}</span>
                {t.label}
              </span>
            ))}
          </div>
          {insightMsg && <p className="text-sm font-body text-foreground/85 mt-3 leading-relaxed">{insightMsg}</p>}
        </motion.div>
      )}
    </div>
  );
}
