import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import toast from "react-hot-toast";

type PrivacyLevel = "FULL" | "SUMMARY" | "PRIVATE";

type P = {
  privacyLevel: PrivacyLevel;
  shareMood: boolean;
  shareSleep: boolean;
  shareActivity: boolean;
  shareCalendar: boolean;
  allowGoals: boolean;
  allowVoice: boolean;
};

export default function PrivacyPage() {
  const nav = useNavigate();
  const [p, setP] = useState<P | null>(null);

  useEffect(() => {
    api.get<P>("/api/settings/privacy").then(({ data }) => setP(data));
  }, []);

  const save = async (patch: Partial<P>) => {
    if (!p) return;
    const next = { ...p, ...patch };
    try {
      const { data } = await api.put<P>("/api/settings/privacy", next);
      setP(data);
      toast.success("Privacy updated 🌿");
    } catch {
      toast.error("Couldn't save settings.");
    }
  };

  if (!p) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">
        Getting your wellness ready 🌿...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-6 pt-8 flex items-center gap-3">
        <button type="button" onClick={() => nav("/dashboard")} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold">Privacy</h1>
      </div>
      <div className="px-6 mt-6 space-y-6">
        <div>
          <p className="font-display font-semibold mb-2">Privacy level</p>
          <RadioGroup
            value={p.privacyLevel}
            onValueChange={(v) => void save({ privacyLevel: v as PrivacyLevel })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FULL" id="full" />
              <Label htmlFor="full">Full share</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SUMMARY" id="sum" />
              <Label htmlFor="sum">Summary only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PRIVATE" id="prv" />
              <Label htmlFor="prv">Private</Label>
            </div>
          </RadioGroup>
        </div>
        {(
          [
            ["shareMood", "Share mood with family", p.shareMood],
            ["shareSleep", "Share sleep data", p.shareSleep],
            ["shareActivity", "Share activity data", p.shareActivity],
            ["shareCalendar", "Share wellness calendar", p.shareCalendar],
            ["allowGoals", "Allow gentle goals", p.allowGoals],
            ["allowVoice", "Allow voice hugs", p.allowVoice],
          ] as const
        ).map(([key, label, val]) => (
          <div key={key} className="flex items-center justify-between glass-card p-4">
            <Label htmlFor={key}>{label}</Label>
            <Switch
              id={key}
              checked={val}
              onCheckedChange={(c) => void save({ [key]: c } as Partial<P>)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
