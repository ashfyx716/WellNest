import type { DailyEntry } from "@/lib/wellnest-store";

export function apiMoodToLocal(m: string): DailyEntry["mood"] {
  switch (m) {
    case "HAPPY":
    case "CALM":
      return "calm";
    case "NEUTRAL":
      return "okay";
    case "STRESSED":
      return "stressed";
    case "SAD":
    case "TIRED":
      return "tired";
    default:
      return "okay";
  }
}
