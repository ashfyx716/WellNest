import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface CareRecommendation {
  title: string;
  description: string;
  emoji: string;
  actionType: string;
}

interface CareGuideData {
  moodEmoji: string;
  moodLabel: string;
  wellnessLevel: string;
  moodTrend: string;
  trendDescription: string;
  doDos: string[];
  dontDos: string[];
  suggestions: CareRecommendation[];
  personalCareTip: string;
}

interface Props {
  data: CareGuideData | null;
  onAction?: (actionType: string) => void;
}

const CareRecommendations = ({ data, onAction }: Props) => {
  if (!data) return null;

  const wellnessColors: Record<string, string> = {
    critical: "bg-wellnest-coral/15 border-wellnest-coral/40",
    low: "bg-wellnest-coral/10 border-wellnest-coral/30",
    okay: "bg-wellnest-honey/10 border-wellnest-honey/30",
    good: "bg-primary/10 border-primary/30",
    unknown: "bg-muted/10 border-muted/30",
  };

  const wellnessIcons: Record<string, string> = {
    critical: "🚨",
    low: "⚠️",
    okay: "🤔",
    good: "✨",
    unknown: "🌿",
  };

  const topDos = data.doDos.slice(0, 2);
  const topDonts = data.dontDos.slice(0, 2);
  const topSuggestions = data.suggestions.slice(0, 2);

  return (
    <motion.div
      className="px-6 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Wellness Level & Trend */}
      <div className={`glass-card ${wellnessColors[data.wellnessLevel || "unknown"]} p-4 rounded-lg border`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{wellnessIcons[data.wellnessLevel || "unknown"]}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-foreground capitalize">
                Mom's Wellness: {data.wellnessLevel || "Unknown"}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground capitalize">
                {data.moodTrend}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-body mb-2">{data.trendDescription}</p>
            {data.wellnessLevel === "critical" && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-wellnest-coral/20 rounded border border-wellnest-coral/30">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-wellnest-coral" />
                <p className="text-xs text-foreground font-body">
                  Mom may need extra support right now. Consider reaching out.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Care Tip */}
      <motion.div
        className="glass-card p-4 rounded-lg border border-primary/20 bg-primary/5"
        whileHover={{ scale: 1.01 }}
      >
        <p className="text-sm text-foreground font-body leading-relaxed">
          <span className="font-display font-bold block mb-2">💡 Today's Care Reminder:</span>
          {data.personalCareTip}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="glass-card-strong p-3 rounded-lg">
          <h3 className="font-display font-bold text-foreground text-sm mb-2">✅ Do</h3>
          <div className="space-y-1.5">
            {topDos.map((tip, i) => (
              <p key={i} className="text-sm text-foreground font-body">• {tip}</p>
            ))}
          </div>
        </div>

        <div className="glass-card-strong p-3 rounded-lg">
          <h3 className="font-display font-bold text-foreground text-sm mb-2">❌ Avoid</h3>
          <div className="space-y-1.5">
            {topDonts.map((tip, i) => (
              <p key={i} className="text-sm text-foreground font-body opacity-85">• {tip}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Actions */}
      {topSuggestions.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-foreground text-sm mb-2 flex items-center gap-2">
            💬 Suggested Actions
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {topSuggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => onAction?.(suggestion.actionType)}
                className="glass-card-strong p-3 rounded-lg hover:shadow-md transition-all text-left"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">{suggestion.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-foreground">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CareRecommendations;
