import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { motion } from "framer-motion";

type Pulse = { id: number; message: string; sentAt: string; read: boolean };

export default function FamilyMessagesPage() {
  const nav = useNavigate();
  const [items, setItems] = useState<Pulse[]>([]);

  useEffect(() => {
    api
      .get<Pulse[]>("/api/care-pulse/inbox")
      .then(({ data }) => setItems(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-6 pt-8 flex items-center gap-3">
        <button type="button" onClick={() => nav("/dashboard")} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold">Family love 💕</h1>
      </div>
      <div className="px-6 mt-6 space-y-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground font-body">Nothing logged yet — that's okay 🌿</p>
        ) : (
          items.map((p) => (
            <motion.div key={p.id} layout className="glass-card p-4">
              <p className="font-display italic text-foreground">{p.message}</p>
              <p className="text-xs text-muted-foreground mt-2 font-body">{new Date(p.sentAt).toLocaleString()}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
