// Simple state management for WellNest using localStorage
export type UserRole = "mother" | "family" | null;

export interface DailyEntry {
  id: string;
  date: string;
  sleep: "poor" | "okay" | "great";
  activity: "walked" | "sitting";
  diet: "healthy" | "normal" | "not-great";
  mood: "calm" | "okay" | "tired" | "stressed";
  note?: string;
}

export interface WellnestState {
  role: UserRole;
  userName: string;
  entries: DailyEntry[];
  carePulses: { from: string; message: string; date: string }[];
}

const STORAGE_KEY = "wellnest-state";

export function getState(): WellnestState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return { role: null, userName: "", entries: [], carePulses: [] };
}

export function setState(state: Partial<WellnestState>) {
  const current = getState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
}

export function addEntry(entry: DailyEntry) {
  const state = getState();
  state.entries.push(entry);
  setState({ entries: state.entries });
}

export function addCarePulse(pulse: { from: string; message: string; date: string }) {
  const state = getState();
  state.carePulses.push(pulse);
  setState({ carePulses: state.carePulses });
}

export function getLatestMood(): string {
  const state = getState();
  if (state.entries.length === 0) return "calm";
  return state.entries[state.entries.length - 1].mood;
}

export function getStreakDays(): number {
  const state = getState();
  if (state.entries.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (state.entries.some((e) => e.date === dateStr)) {
      streak++;
    } else break;
  }
  return streak;
}
