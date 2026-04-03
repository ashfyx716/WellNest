import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignup: () => void;
  onGuest: () => void;
}

const AnimatedTagline = ({ text }: { text: string }) => {
  // Array.from preserves Unicode code points so emoji are not split into invalid halves.
  const chars = Array.from(text);

  return (
    <span className="inline-flex flex-nowrap whitespace-nowrap justify-center">
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.04, duration: 0.3 }}
          className={char === " " ? "w-[0.3em]" : ""}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const FloatingBlob = ({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full blur-3xl opacity-30"
    style={{
      background: color,
      width: size,
      height: size,
      left: x,
      top: y,
    }}
    animate={{
      x: [0, 30, -20, 0],
      y: [0, -20, 15, 0],
      scale: [1, 1.1, 0.95, 1],
    }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const BokehCircle = ({ size, x, y, delay }: { size: number; x: string; y: string; delay: number }) => (
  <motion.div
    className="absolute rounded-full border border-primary/10"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: "radial-gradient(circle, hsl(156 44% 43% / 0.05), transparent)",
    }}
    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const WelcomeScreen = ({ onLogin, onSignup, onGuest }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Watercolor blobs */}
      <FloatingBlob color="hsl(156, 44%, 43%)" size={400} x="10%" y="20%" delay={0} />
      <FloatingBlob color="hsl(15, 68%, 63%)" size={350} x="60%" y="10%" delay={2} />
      <FloatingBlob color="hsl(262, 30%, 75%)" size={300} x="30%" y="60%" delay={4} />
      <FloatingBlob color="hsl(40, 87%, 62%)" size={250} x="70%" y="55%" delay={1} />

      {/* Bokeh circles */}
      <BokehCircle size={80} x="15%" y="30%" delay={0} />
      <BokehCircle size={50} x="75%" y="20%" delay={1.5} />
      <BokehCircle size={60} x="50%" y="70%" delay={3} />
      <BokehCircle size={40} x="85%" y="60%" delay={2} />
      <BokehCircle size={70} x="25%" y="80%" delay={0.5} />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <motion.span
                className="text-4xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🌿
              </motion.span>
            </div>
          </div>

          <h1 className="text-5xl font-display font-bold text-foreground tracking-tight">
            WellNest
          </h1>
        </motion.div>

        {/* Animated tagline */}
        <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed whitespace-nowrap">
          <AnimatedTagline text="Your family's wellness, woven together 🌿" />
        </p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col gap-4 w-full max-w-xs mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.button
            type="button"
            onClick={onLogin}
            className="wellnest-btn-large bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Login
          </motion.button>
          <motion.button
            type="button"
            onClick={onSignup}
            className="wellnest-btn-large glass-card-strong text-foreground hover:bg-card/80 transition-all border border-border"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up
          </motion.button>
          <motion.button
            type="button"
            onClick={onGuest}
            className="wellnest-btn-large glass-card text-foreground hover:bg-card/80 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue as Guest 🌸
          </motion.button>
        </motion.div>

        {/* 3 promises */}
        <motion.div
          className="flex items-center gap-8 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {[
            { emoji: "📊", label: "Track" },
            { emoji: "💛", label: "Connect" },
            { emoji: "🌱", label: "Grow" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs text-muted-foreground font-body">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
