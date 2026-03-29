import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NestiChatDrawer from "./NestiChatDrawer";

export default function NestiOrb() {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[#2D8A6A] flex items-center justify-center shadow-lg shadow-primary/35"
        style={{ bottom: "1.5rem", right: "1.5rem" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: open
            ? "0 0 0 0 rgba(61,158,122,0)"
            : [
                "0 0 0 0 rgba(61,158,122,0.35)",
                "0 0 0 14px rgba(61,158,122,0)",
                "0 0 0 0 rgba(61,158,122,0)",
              ],
        }}
        transition={{ duration: 2.5, repeat: open ? 0 : Infinity }}
        onClick={() => {
          setOpen((o) => {
            if (o) return false;
            setHasUnread(false);
            return true;
          });
        }}
        title="Talk to Nesti 💛"
        aria-label={open ? "Close Nesti chat" : "Open Nesti chat"}
      >
        {hasUnread && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-400 rounded-full border-2 border-white" />
        )}
        <span className="text-2xl select-none leading-none">{open ? "✕" : "🤖"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <NestiChatDrawer
            onClose={() => setOpen(false)}
            onUnread={() => setHasUnread(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
