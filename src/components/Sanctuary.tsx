import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import BottomNav from "./BottomNav";

interface Props {
  onBack: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  gentleGoals?: { id: number; goalText: string }[];
  onCompleteGoal?: (id: number) => void;
}

type Scene = "ocean" | "forest" | "clouds" | null;

const BreathingGuide = () => {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const phases = [
    { name: "inhale" as const, duration: 4, label: "Breathe in..." },
    { name: "hold" as const, duration: 4, label: "Hold..." },
    { name: "exhale" as const, duration: 4, label: "Breathe out..." },
    { name: "rest" as const, duration: 4, label: "Rest..." },
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % 4;
      setPhase(phases[current].name);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentPhase = phases.find((p) => p.name === phase)!;
  const isExpand = phase === "inhale";
  const isContract = phase === "exhale";

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="w-40 h-40 rounded-full border-2 border-primary/40 flex items-center justify-center"
        style={{ background: "radial-gradient(circle, hsl(156 44% 43% / 0.15), transparent)" }}
        animate={{
          scale: isExpand ? 1.4 : isContract ? 0.8 : 1,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-primary/20"
          animate={{
            scale: isExpand ? 1.5 : isContract ? 0.6 : 1,
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      </motion.div>
      <p className="font-display font-semibold text-xl text-foreground">{currentPhase.label}</p>
      <p className="text-sm text-muted-foreground font-body">4-4-4-4 Box Breathing</p>
    </div>
  );
};

const GroundingExercise = () => {
  const steps = [
    { count: 5, sense: "things you can SEE", emoji: "👀" },
    { count: 4, sense: "things you can TOUCH", emoji: "✋" },
    { count: 3, sense: "things you can HEAR", emoji: "👂" },
    { count: 2, sense: "things you can SMELL", emoji: "👃" },
    { count: 1, sense: "thing you can TASTE", emoji: "👅" },
  ];
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 max-w-sm">
      <h3 className="font-display font-bold text-lg text-foreground">5-4-3-2-1 Grounding</h3>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card-strong p-8 text-center"
        >
          <span className="text-5xl block mb-4">{steps[step].emoji}</span>
          <p className="font-mono text-4xl font-bold text-primary mb-2">{steps[step].count}</p>
          <p className="font-display font-semibold text-foreground">{steps[step].sense}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === step ? "bg-primary w-6" : "bg-border"}`}
          />
        ))}
      </div>
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="text-sm text-muted-foreground font-body hover:text-foreground">
            ← Previous
          </button>
        )}
        {step < 4 && (
          <button onClick={() => setStep(step + 1)} className="text-sm text-primary font-body font-semibold">
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

const OceanScene = () => (
  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-200/30 to-blue-400/20">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bottom-0 left-0 w-[200%] h-8 bg-gradient-to-r from-blue-300/20 via-blue-400/30 to-blue-300/20 rounded-full"
        style={{ bottom: i * 12 }}
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "linear" }}
      />
    ))}
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-4xl">🌊</span>
    </div>
  </div>
);

const ForestScene = () => (
  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-green-100/30 to-green-200/20">
    {[...Array(5)].map((_, i) => (
      <motion.span
        key={i}
        className="absolute text-2xl"
        style={{ left: `${15 + i * 16}%`, top: `${20 + (i % 3) * 20}%` }}
        animate={{ rotate: [-5, 5, -5], y: [-2, 2, -2] }}
        transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
      >
        🍃
      </motion.span>
    ))}
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-4xl">🌿</span>
    </div>
  </div>
);

const CloudScene = () => (
  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100/30 to-white/20">
    {[...Array(4)].map((_, i) => (
      <motion.span
        key={i}
        className="absolute text-3xl"
        style={{ top: `${15 + i * 15}%` }}
        animate={{ x: ["-10%", "110%"] }}
        transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear", delay: i * 3 }}
      >
        ☁️
      </motion.span>
    ))}
  </div>
);

const Sanctuary = ({ onBack, activeTab, onTabChange, gentleGoals = [], onCompleteGoal }: Props) => {
  const [view, setView] = useState<"main" | "breathe" | "ground">("main");
  const [scene, setScene] = useState<Scene>(null);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-6 pt-8 pb-4 flex items-center gap-3">
        <button onClick={view !== "main" ? () => setView("main") : onBack} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">Sanctuary 🧘</h1>
      </div>

      {view === "main" && (
        <div className="px-6 space-y-6">
          <p className="text-muted-foreground font-body">Find your calm. Choose an experience. 🌿</p>

          {/* Ambient scenes */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-3">Ambient Scenes</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "ocean" as Scene, emoji: "🌊", label: "Ocean" },
                { id: "forest" as Scene, emoji: "🌿", label: "Forest" },
                { id: "clouds" as Scene, emoji: "☁️", label: "Clouds" },
              ].map((s) => (
                <motion.button
                  key={s.id}
                  onClick={() => setScene(scene === s.id ? null : s.id)}
                  className={`glass-card flex flex-col items-center gap-2 py-5 ${scene === s.id ? "border-primary/40 shadow-md" : ""}`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-xs font-display font-semibold text-foreground">{s.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Active scene */}
          <AnimatePresence>
            {scene && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {scene === "ocean" && <OceanScene />}
                {scene === "forest" && <ForestScene />}
                {scene === "clouds" && <CloudScene />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activities */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-foreground">Activities</h3>
            <motion.button
              onClick={() => setView("breathe")}
              className="glass-card-strong w-full flex items-center gap-4 p-5"
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-3xl">🫁</span>
              <div className="text-left">
                <p className="font-display font-bold text-foreground">Box Breathing</p>
                <p className="text-xs text-muted-foreground font-body">4-4-4-4 guided breathing</p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setView("ground")}
              className="glass-card-strong w-full flex items-center gap-4 p-5"
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-3xl">🌍</span>
              <div className="text-left">
                <p className="font-display font-bold text-foreground">5-4-3-2-1 Grounding</p>
                <p className="text-xs text-muted-foreground font-body">Sensory awareness exercise</p>
              </div>
            </motion.button>
          </div>

          {gentleGoals.length > 0 && (
            <div className="glass-card p-4 border-primary/20">
              <p className="text-xs text-muted-foreground font-body mb-2">Gentle goal from your family</p>
              <p className="font-display font-semibold text-foreground">{gentleGoals[0].goalText}</p>
              {onCompleteGoal && (
                <button
                  type="button"
                  onClick={() => onCompleteGoal(gentleGoals[0].id)}
                  className="mt-3 text-sm font-body text-primary font-semibold"
                >
                  Mark as Done ✓
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {view === "breathe" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <BreathingGuide />
        </div>
      )}

      {view === "ground" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <GroundingExercise />
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default Sanctuary;
