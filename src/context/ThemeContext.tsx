import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MoodAura = "happy" | "neutral" | "stressed" | "tired" | "calm";

type ThemeCtx = {
  moodAura: MoodAura;
  setMoodAura: (m: MoodAura) => void;
  isNightMode: boolean;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [moodAura, setMoodAura] = useState<MoodAura>("neutral");
  /** Kept for future user toggle; we no longer auto-switch the whole app dark by time of day. */
  const [isNightMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("night-mode");
  }, []);

  const v = useMemo(() => ({ moodAura, setMoodAura, isNightMode }), [moodAura, isNightMode]);
  return <ThemeContext.Provider value={v}>{children}</ThemeContext.Provider>;
}

export function useThemeCtx() {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("ThemeProvider missing");
  return c;
}
