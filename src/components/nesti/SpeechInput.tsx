import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  onResult: (text: string) => void;
  /** When set, called with final transcript after recognition ends (e.g. chat auto-send). */
  onSend?: (text: string) => void;
  variant?: "icon" | "pill";
};

export default function SpeechInput({ onResult, onSend, variant = "icon" }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const latestTranscript = useRef("");

  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      const current = (final || interim).trim();
      latestTranscript.current = current;
      onResult(current);
    };

    recognition.onend = () => {
      setIsListening(false);
      const t = latestTranscript.current.trim();
      if (t && onSend) {
        window.setTimeout(() => {
          onSend(t);
          latestTranscript.current = "";
        }, 400);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (e.error === "not-allowed") {
        window.alert("Please allow microphone access to use voice input.");
      }
    };

    recognitionRef.current = recognition;
  }, [onResult, onSend]);

  const toggleListening = useCallback(() => {
    if (!supported || !recognitionRef.current) {
      window.alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      latestTranscript.current = "";
      onResult("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, onResult, supported]);

  if (!supported) return null;

  if (variant === "pill") {
    return (
      <motion.button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm font-medium transition-all duration-200 ${
          isListening
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
            : "bg-card border border-primary/30 text-primary"
        }`}
        animate={
          isListening
            ? {
                boxShadow: [
                  "0 0 0 0 rgba(239,68,68,0.3)",
                  "0 0 0 12px rgba(239,68,68,0)",
                  "0 0 0 0 rgba(239,68,68,0)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{isListening ? "⏹" : "🎤"}</span>
        <span>{isListening ? "Tap to stop" : "Speak Instead"}</span>
      </motion.button>
    );
  }

  return (
    <div className="relative shrink-0">
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-3 py-1 rounded-full whitespace-nowrap font-body shadow-lg z-10"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            🎤 Listening...
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={toggleListening}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
          isListening ? "bg-red-500 text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
        }`}
        animate={
          isListening
            ? {
                boxShadow: [
                  "0 0 0 0 rgba(239,68,68,0.4)",
                  "0 0 0 10px rgba(239,68,68,0)",
                  "0 0 0 0 rgba(239,68,68,0)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
        whileTap={{ scale: 0.9 }}
        title={isListening ? "Stop recording" : "Voice input"}
      >
        {isListening ? <div className="w-2.5 h-2.5 bg-white rounded-sm" /> : <MicIcon />}
      </motion.button>
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
    </svg>
  );
}
