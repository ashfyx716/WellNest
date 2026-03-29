import { motion } from "framer-motion";
import type { DailyEntry } from "@/lib/wellnest-store";

interface MoodCalendarProps {
  entries: DailyEntry[];
}

const moodColors: Record<string, string> = {
  calm: "bg-primary/60",
  okay: "bg-wellnest-honey/50",
  tired: "bg-wellnest-lavender/60",
  stressed: "bg-wellnest-coral/60",
};

const MoodCalendar = ({ entries }: MoodCalendarProps) => {
  const today = new Date();
  const daysToShow = 14;
  const days: { date: string; mood?: string; day: number }[] = [];

  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = entries.find((e) => e.date === dateStr);
    days.push({ date: dateStr, mood: entry?.mood, day: d.getDate() });
  }

  return (
    <div className="px-6">
      <h3 className="font-display font-bold text-foreground text-lg mb-2">Mom's Mood Calendar</h3>
      <div className="glass-card p-3">
        <div className="grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-body font-semibold pb-0.5">
              {d}
            </div>
          ))}
          {/* Padding for first day alignment */}
          {(() => {
            const firstDay = new Date(today);
            firstDay.setDate(firstDay.getDate() - (daysToShow - 1));
            const padding = firstDay.getDay();
            return Array.from({ length: padding }, (_, i) => (
              <div key={`pad-${i}`} />
            ));
          })()}
          {days.map((day, i) => (
            <motion.div
              key={day.date}
              className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-mono font-semibold ${
                day.mood
                  ? `${moodColors[day.mood] || "bg-muted"} text-foreground`
                  : "bg-muted/30 text-muted-foreground"
              }`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              title={`${day.date}: ${day.mood || "no data"}`}
            >
              {day.day}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 justify-center flex-wrap">
          {[
            { label: "Calm", color: "bg-primary/60" },
            { label: "Okay", color: "bg-wellnest-honey/50" },
            { label: "Tired", color: "bg-wellnest-lavender/60" },
            { label: "Stressed", color: "bg-wellnest-coral/60" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm ${item.color}`} />
              <span className="text-[9px] text-muted-foreground font-body">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodCalendar;
