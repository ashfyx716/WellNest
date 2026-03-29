import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/services/api";

type Item = { kind: string; id: number; preview: string; date: string; audioUrl?: string | null };

export default function LoveArchivePage() {
  const nav = useNavigate();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    api
      .get<Item[]>("/api/family/archive")
      .then(({ data }) => setItems(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-6 pt-8 flex items-center gap-3">
        <button type="button" onClick={() => nav("/family")} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold">Love archive 💌</h1>
      </div>
      <ul className="px-6 mt-6 space-y-2">
        {items.map((it) => (
          <li key={`${it.kind}-${it.id}`} className="glass-card p-3 text-sm font-body">
            <span className="text-muted-foreground text-xs">{it.kind}</span>
            <p className="font-medium">{it.preview}</p>
            <p className="text-xs text-muted-foreground">{new Date(it.date).toLocaleString()}</p>
            {it.audioUrl && (
              <audio controls className="w-full mt-2" src={`${import.meta.env.VITE_API_URL ?? "http://localhost:8081"}${it.audioUrl}`} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
