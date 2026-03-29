import { motion } from "framer-motion";

interface WellnessCircleProps {
  sleep: number;
  mood: number;
  activity: number;
  diet: number;
}

const WellnessCircle = ({ sleep, mood, activity, diet }: WellnessCircleProps) => {
  const size = 324;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { label: "Sleep", value: sleep, color: "hsl(262, 30%, 75%)", emoji: "🌙", offset: 0 },
    { label: "Mood", value: mood, color: "hsl(156, 44%, 43%)", emoji: "😊", offset: 0.25 },
    { label: "Activity", value: activity, color: "hsl(40, 87%, 62%)", emoji: "🚶", offset: 0.5 },
    { label: "Diet", value: diet, color: "hsl(15, 68%, 63%)", emoji: "🥗", offset: 0.75 },
  ];

  return (
    <div className="relative flex items-center justify-center pt-4 pb-12 sm:pt-5 sm:pb-14">
      {/* Glow effect */}
      <div
        className="absolute rounded-full animate-pulse-glow"
        style={{
          width: size + 40,
          height: size + 40,
          background: "radial-gradient(circle, hsl(156 44% 43% / 0.08), transparent 70%)",
        }}
      />

      {/* Glass container */}
      <div
        className="relative glass-card rounded-full flex items-center justify-center p-4"
        style={{ width: size + 30, height: size + 30 }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Gradient border */}
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(156, 44%, 43%)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="hsl(262, 30%, 75%)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(15, 68%, 63%)" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#circleGradient)"
            strokeWidth={strokeWidth + 4}
            opacity={0.3}
          />

          {/* Segments */}
          {segments.map((seg, i) => {
            const segLen = circumference * 0.22;
            const dashOffset = circumference * seg.offset;
            const filledLen = segLen * (seg.value / 100);
            const isLogged = seg.value > 0;
            return (
              <g key={i}>
                {/* Unlogged pulsing outline */}
                {!isLogged && (
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray={`${segLen} ${circumference - segLen}`}
                    strokeDashoffset={-dashOffset}
                    opacity={0.3}
                    animate={{ opacity: [0.15, 0.4, 0.15] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                )}
                {/* Filled segment with ripple */}
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${filledLen} ${circumference - filledLen}`}
                  strokeDashoffset={-dashOffset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${filledLen} ${circumference - filledLen}` }}
                  transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
                  filter={isLogged ? "drop-shadow(0 0 6px " + seg.color + ")" : "none"}
                />
              </g>
            );
          })}
        </svg>

        {/* Center mandala */}
        <div className="absolute flex flex-col items-center">
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, hsl(156 44% 43% / 0.1), transparent)",
            }}
          >
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              ✿
            </motion.span>
          </motion.div>
          <p className="text-xs text-muted-foreground font-body font-semibold mt-1">Today</p>
        </div>
      </div>

      {/* Top (Sleep) + bottom (Activity) sit closer to the ring so they don't overlap the banner / action cards */}
      {segments.map((seg, i) => {
        const angle = (seg.offset * 360 - 90) * (Math.PI / 180);
        const baseR = (size + 30) / 2;
        const isTopOrBottom = seg.offset === 0 || seg.offset === 0.5;
        const outward = isTopOrBottom ? 20 : 40;
        const labelR = baseR + outward;
        const x = (size + 30) / 2 + Math.cos(angle) * labelR;
        const y = (size + 30) / 2 + Math.sin(angle) * labelR;
        return (
          <motion.div
            key={i}
            className="absolute glass-card py-1.5 px-3 flex flex-col items-center z-10 shadow-sm"
            style={{
              left: x - 28,
              top: y - 20,
              minWidth: 56,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.15, type: "spring" }}
          >
            <span className="text-lg">{seg.emoji}</span>
            <p className="text-[9px] text-muted-foreground font-body font-semibold">{seg.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WellnessCircle;
