import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import SpeechInput from "./SpeechInput";

type Msg = { role: "USER" | "ASSISTANT"; content: string };

type ApiMsg = { role: string; content: string; timestamp?: string };

type Props = {
  onClose: () => void;
  onUnread?: () => void;
};

const WELCOME =
  "Hello! I'm Nesti, your wellness companion 💛 How are you feeling today?";

export default function NestiChatDrawer({ onClose, onUnread }: Props) {
  const { token, isGuest } = useAuth();
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [typingWords, setTypingWords] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const drawerOpenRef = useRef(true);

  useEffect(() => {
    drawerOpenRef.current = true;
    return () => {
      drawerOpenRef.current = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typingWords, pending, minimized]);

  const loadHistory = useCallback(async () => {
    if (!token || isGuest) {
      setMsgs([]);
      return;
    }
    try {
      const { data } = await api.get<ApiMsg[]>("/api/nesti/history");
      const list = Array.isArray(data) ? data : [];
      if (list.length === 0) {
        setMsgs([{ role: "ASSISTANT", content: WELCOME }]);
        return;
      }
      setMsgs(
        list.map((m) => ({
          role: m.role === "USER" ? "USER" : "ASSISTANT",
          content: m.content,
        }))
      );
    } catch {
      setMsgs([{ role: "ASSISTANT", content: WELCOME }]);
    }
  }, [token, isGuest]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const typeIntervalRef = useRef<number | null>(null);

  const runTypewriter = useCallback(
    (fullText: string) => {
      if (typeIntervalRef.current != null) {
        window.clearInterval(typeIntervalRef.current);
        typeIntervalRef.current = null;
      }
      const trimmed = fullText?.trim() ?? "";
      if (!trimmed) {
        setMsgs((prev) => [...prev, { role: "ASSISTANT", content: "I'm here for you 💛" }]);
        return;
      }
      const words = trimmed.split(/\s+/).filter(Boolean);
      setTypingWords([]);
      let i = 0;
      typeIntervalRef.current = window.setInterval(() => {
        i += 1;
        setTypingWords(words.slice(0, i));
        if (i >= words.length && typeIntervalRef.current != null) {
          window.clearInterval(typeIntervalRef.current);
          typeIntervalRef.current = null;
          setMsgs((prev) => [...prev, { role: "ASSISTANT", content: fullText }]);
          setTypingWords([]);
          if (!drawerOpenRef.current && onUnread) onUnread();
        }
      }, 55);
    },
    [onUnread]
  );

  useEffect(() => {
    return () => {
      if (typeIntervalRef.current != null) window.clearInterval(typeIntervalRef.current);
    };
  }, []);

  const sendWithText = async (text: string) => {
    const t = text.trim();
    if (!t || pending) return;
    if (!token || isGuest) {
      toast("Sign in to chat with Nesti 💛", { icon: "🌿" });
      return;
    }
    setMsgs((m) => {
      const stripWelcome =
        m.length === 1 && m[0].role === "ASSISTANT" && m[0].content === WELCOME ? [] : m;
      return [...stripWelcome, { role: "USER", content: t }];
    });
    setInput(""); // Clear input after sending
    setPending(true);
    try {
      const { data } = await api.post<{ reply: string }>("/api/nesti/chat", { message: t });
      runTypewriter(data.reply);
    } catch {
      toast.error("Could not reach Nesti — try again.");
      setMsgs((m) => [
        ...m,
        { role: "ASSISTANT", content: "I'm here for you 💛 Please try again." },
      ]);
    } finally {
      setPending(false);
    }
  };

  const clearChat = async () => {
    try {
      await api.delete("/api/nesti/clear");
      setMsgs([{ role: "ASSISTANT", content: WELCOME }]);
    } catch {
      toast.error("Could not clear chat.");
    }
  };

  const quick = [
    "I'm feeling stressed 😔",
    "Help me breathe 🌿",
    "I can't sleep 🌙",
    "I feel good today! 🌸",
  ];

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/25 z-[60] md:bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed right-0 top-0 h-full w-full max-w-[380px] z-[70] flex flex-col bg-[hsl(var(--wellnest-cream))] shadow-2xl border-l border-border"
        style={{ boxShadow: "-8px 0 40px rgba(44,40,37,0.12)" }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        <div className="bg-gradient-to-r from-primary to-[#2D8A6A] px-4 py-4 flex items-center gap-3 shrink-0">
          <motion.div
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl border-2 border-white/40"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            🤖
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-display font-semibold text-base leading-tight">Nesti</p>
            <p className="text-white/80 text-xs font-body">Your wellness companion 💛</p>
          </div>
          <button
            type="button"
            className="text-white/80 hover:text-white text-xs font-body px-1"
            onClick={() => setMinimized((m) => !m)}
          >
            {minimized ? "▢" : "—"}
          </button>
          <button type="button" className="text-white/90 hover:text-white text-lg leading-none px-1" onClick={onClose}>
            ✕
          </button>
        </div>

        <AnimatePresence>
          {!minimized && (
            <motion.div
              className="flex flex-col flex-1 min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 font-[family-name:var(--font-dm-sans,DM_Sans),sans-serif] text-sm">
                {msgs.length <= 1 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {quick.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void sendWithText(s)}
                        className="text-xs bg-card border border-primary/25 text-foreground px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {msgs.map((m, i) => (
                  <motion.div
                    key={`${i}-${m.content.slice(0, 8)}`}
                    className={`flex gap-2 ${m.role === "USER" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {m.role === "ASSISTANT" && (
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        🌿
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl leading-relaxed shadow-sm text-[14px] ${
                        m.role === "USER"
                          ? "bg-primary text-primary-foreground rounded-tr-md ml-auto"
                          : "bg-[#FFFDF7] text-foreground border border-primary/10 rounded-tl-md"
                      }`}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}

                {typingWords.length > 0 && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      🌿
                    </div>
                    <div className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-tl-md bg-[#FFFDF7] border border-primary/10 text-[14px] text-foreground">
                      {typingWords.join(" ")}
                      <span className="inline-block w-1 h-3 ml-0.5 bg-primary align-middle animate-pulse rounded-sm" />
                    </div>
                  </div>
                )}

                {pending && typingWords.length === 0 && (
                  <p className="text-muted-foreground text-sm pl-9">Nesti is thinking 🌿...</p>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-primary/10 bg-card shrink-0">
                <div className="flex items-center gap-2 bg-background rounded-full px-3 h-12 border border-primary/15 shadow-sm">
                  <SpeechInput
                    onResult={(text) => setInput(text)}
                    onSend={(text) => void sendWithText(text)}
                  />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void sendWithText(input)}
                    placeholder="Type a message..."
                    disabled={pending}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
                  />
                  <motion.button
                    type="button"
                    onClick={() => void sendWithText(input)}
                    disabled={!input.trim() || pending}
                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 shrink-0"
                    whileTap={{ scale: 0.92 }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  <button type="button" className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => void clearChat()}>
                    Clear chat
                  </button>
                  <p className="text-[10px] text-muted-foreground/80 text-center flex-1">
                    Nesti is not a medical professional · For support only
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
