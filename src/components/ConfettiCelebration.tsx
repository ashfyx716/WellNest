import { motion } from "framer-motion";

const pieces = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  color: ["hsl(156,44%,43%)", "hsl(40,87%,62%)", "hsl(15,68%,63%)", "hsl(262,30%,75%)", "hsl(43,85%,70%)"][i % 5],
  delay: Math.random() * 0.5,
  size: 6 + Math.random() * 8,
  rotation: Math.random() * 720,
}));

const ConfettiCelebration = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "100vh", opacity: 0, rotate: p.rotation }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiCelebration;
