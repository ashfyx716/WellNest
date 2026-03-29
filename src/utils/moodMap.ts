/** Map backend MoodType to MoodAura / local keys */
export function apiMoodToAura(m?: string | null): "calm" | "okay" | "tired" | "stressed" | "happy" {
  switch (m) {
    case "HAPPY":
      return "happy";
    case "CALM":
      return "calm";
    case "NEUTRAL":
      return "okay";
    case "SAD":
    case "TIRED":
      return "tired";
    case "STRESSED":
      return "stressed";
    default:
      return "okay";
  }
}

export function entryToCircleScores(entry: {
  sleepQuality?: string;
  mood?: string;
  activity?: string;
  diet?: string;
} | null): { sleep: number; mood: number; activity: number; diet: number } {
  if (!entry) return { sleep: 0, mood: 0, activity: 0, diet: 0 };
  const sleep =
    entry.sleepQuality === "GOOD" ? 100 : entry.sleepQuality === "OKAY" ? 60 : entry.sleepQuality === "POOR" ? 30 : 0;
  const mood =
    entry.mood === "HAPPY" || entry.mood === "CALM"
      ? 100
      : entry.mood === "NEUTRAL"
        ? 60
        : entry.mood
          ? 35
          : 0;
  const activity =
    entry.activity === "WALKED" || entry.activity === "YOGA"
      ? 100
      : entry.activity === "RESTED"
        ? 50
        : entry.activity === "NOT_ACTIVE"
          ? 25
          : 0;
  const diet =
    entry.diet === "HEALTHY"
      ? 100
      : entry.diet === "NORMAL"
        ? 60
        : entry.diet === "JUNK"
          ? 35
          : entry.diet === "SKIPPED"
            ? 30
            : 0;
  return { sleep, mood, activity, diet };
}
