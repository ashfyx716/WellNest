import { motion } from "framer-motion";
import type { UserRole } from "@/lib/wellnest-store";

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
}

const RoleSelection = ({ onSelect }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 overflow-hidden relative">
      {/* Subtle background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, hsl(40, 87%, 62%) 0%, hsl(15, 68%, 63%) 30%, hsl(262, 30%, 75%) 60%, hsl(156, 44%, 43%) 100%)",
        }}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.span
            className="text-5xl inline-block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            💛
          </motion.span>
          <h2 className="text-3xl font-display font-bold text-foreground mt-4 leading-snug">
            Who are we taking care of today?
          </h2>
          <p className="text-muted-foreground mt-2 font-body">Choose how you'd like to use WellNest</p>
        </div>

        <div className="flex flex-col gap-5 w-full">
          {/* For Myself */}
          <motion.button
            onClick={() => onSelect("mother")}
            className="group relative glass-card-strong overflow-hidden flex items-center gap-5 p-7 text-left"
            whileHover={{ scale: 1.02, rotateY: 2 }}
            whileTap={{ scale: 0.98 }}
            style={{ perspective: "1000px" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-wellnest-honey/10 to-wellnest-coral/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-wellnest-honey/30 to-wellnest-coral/20 flex items-center justify-center text-4xl shrink-0 relative z-10">
              👩
            </div>
            <div className="relative z-10">
              <p className="font-display font-bold text-xl text-foreground">For Myself</p>
              <p className="text-sm text-muted-foreground mt-1 font-body">
                Track your wellness journey
              </p>
              <motion.p
                className="text-xs text-primary mt-1 font-body opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Journal · Track · Grow 🌿
              </motion.p>
            </div>
          </motion.button>

          {/* For My Mother */}
          <motion.button
            onClick={() => onSelect("family")}
            className="group relative glass-card-strong overflow-hidden flex items-center gap-5 p-7 text-left"
            whileHover={{ scale: 1.02, rotateY: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ perspective: "1000px" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-wellnest-lavender/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-wellnest-lavender/30 to-primary/20 flex items-center justify-center text-4xl shrink-0 relative z-10">
              👨‍👩‍👧
            </div>
            <div className="relative z-10">
              <p className="font-display font-bold text-xl text-foreground">For My Mother</p>
              <p className="text-sm text-muted-foreground mt-1 font-body">
                Support someone you care about
              </p>
              <motion.p
                className="text-xs text-secondary mt-1 font-body opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Connect · Support · Love 💕
              </motion.p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
