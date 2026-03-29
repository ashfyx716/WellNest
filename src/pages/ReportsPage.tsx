import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function ReportsPage() {
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [weekly, setWeekly] = useState<{
    avgSleepScore: number;
    moodCounts: Record<string, number>;
    activeDays: number;
    totalDays: number;
  } | null>(null);
  const [monthly, setMonthly] = useState<{ moodTrend: { label: string; value: number }[] } | null>(null);
  const [insight, setInsight] = useState<string>("");

  useEffect(() => {
    api.get("/api/reports/weekly").then(({ data }) => setWeekly(data as typeof weekly));
    api.get("/api/reports/monthly").then(({ data }) => setMonthly(data as typeof monthly));
    api.get<{ insight: string }>("/api/reports/ai-insight").then(({ data }) => setInsight(data.insight));
  }, []);

  const downloadPdf = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current);
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("wellnest-report.pdf");
  };

  const trendData =
    monthly?.moodTrend?.map((p) => ({ name: p.label?.slice(5) ?? "", m: p.value })) ?? [];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="px-6 pt-8 flex items-center gap-3">
        <button type="button" onClick={() => nav("/dashboard")} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold">Wellness reports</h1>
      </div>
      <div ref={ref} className="px-6 mt-6 space-y-6">
        {weekly && (
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground">This week</p>
            <p className="text-lg font-display font-bold">Sleep score avg: {weekly.avgSleepScore}</p>
            <p className="text-sm font-body">Active days: {weekly.activeDays} / {weekly.totalDays}</p>
          </div>
        )}
        {weekly && (
          <div className="glass-card p-4 h-56">
            <p className="text-xs text-muted-foreground mb-2">Mood mix</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(weekly.moodCounts).map(([name, value]) => ({ name, value }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(156 44% 43%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {trendData.length > 0 && (
          <div className="glass-card p-4 h-56">
            <p className="text-xs text-muted-foreground mb-2">30-day mood trend</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="m" stroke="hsl(15 68% 63%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Nesti insight</p>
          <p className="font-body text-foreground mt-2">{insight}</p>
        </div>
        <button
          type="button"
          onClick={() => void downloadPdf()}
          className="wellnest-btn-large w-full bg-primary text-primary-foreground"
        >
          Download report as PDF
        </button>
      </div>
    </div>
  );
}
