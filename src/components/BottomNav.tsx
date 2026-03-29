import { motion } from "framer-motion";
import { Home, BookOpen, Users, TreePine, Heart } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "journal", icon: BookOpen, label: "Journal" },
  { id: "family", icon: Users, label: "Family" },
  { id: "journey", icon: TreePine, label: "Journey" },
  { id: "relax", icon: Heart, label: "Relax" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="glass-card-strong rounded-none rounded-t-2xl px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={isActive ? { y: -2 } : { y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </motion.div>
              <span className={`text-[10px] font-body ${isActive ? "font-bold" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  className="w-1 h-1 rounded-full bg-primary"
                  layoutId="nav-dot"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
