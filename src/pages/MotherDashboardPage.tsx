import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MotherDashboard, { type DashboardSummaryApi, type MomInboxItemApi } from "@/components/MotherDashboard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { goTab, tabFromPath } from "@/utils/navTab";
import type { MlInsightsApi } from "@/types/mlInsights";

export default function MotherDashboardPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { logout, token, isGuest, user } = useAuth();
  const redirected = useRef(false);
  const [summary, setSummary] = useState<DashboardSummaryApi | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [pulse, setPulse] = useState<{ message: string } | null>(null);
  const [mlInsights, setMlInsights] = useState<MlInsightsApi | null>(null);
  const [familyInbox, setFamilyInbox] = useState<MomInboxItemApi[]>([]);

  useEffect(() => {
    if (!token || isGuest) return;
    let cancel = false;

    const loadInbox = async () => {
      try {
        const inbox = await api.get<MomInboxItemApi[]>("/api/family/mom-inbox");
        if (!cancel) {
          setFamilyInbox(Array.isArray(inbox.data) ? inbox.data : []);
        }
      } catch {
        if (!cancel) {
          setFamilyInbox([]);
        }
      }
    };

    void loadInbox();
    const interval = window.setInterval(() => {
      void loadInbox();
    }, 7000);

    return () => {
      cancel = true;
      window.clearInterval(interval);
    };
  }, [token, isGuest, loc.pathname]);

  useEffect(() => {
    if (!token || isGuest) return;
    let cancel = false;
    (async () => {
      try {
        const [s, sug, cp] = await Promise.all([
          api.get<DashboardSummaryApi>("/api/dashboard/summary"),
          api.get<{ suggestion: string }>("/api/dashboard/suggestion"),
          api.get<{ message: string } | null>("/api/care-pulse/latest"),
        ]);
        let mlData: MlInsightsApi | null = null;
        try {
          const ml = await api.get<MlInsightsApi>("/api/dashboard/ml-insights");
          mlData = ml.data;
        } catch {
          mlData = null;
        }
        if (!cancel) {
          setSummary(s.data);
          setSuggestion(sug.data?.suggestion ?? null);
          setPulse(cp.data?.message ? { message: cp.data.message } : null);
          setMlInsights(mlData);
        }
      } catch {
        /* offline */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [token, isGuest, loc.pathname]);

  useEffect(() => {
    if (user?.role === "FAMILY" && !redirected.current) {
      redirected.current = true;
      nav("/family", { replace: true });
    }
  }, [user, nav]);

  return (
    <MotherDashboard
      activeTab={tabFromPath(loc.pathname)}
      onTabChange={(t) => goTab(nav, t)}
      apiSummary={summary}
      smartSuggestion={suggestion}
      carePulse={pulse}
      mlInsights={mlInsights}
      familyInbox={familyInbox}
      onCheckIn={() => nav("/checkin")}
      onJourney={() => nav("/journey")}
      onFamily={() => nav("/family-view")}
      onRelax={() => nav("/sanctuary")}
      onLogout={() => {
        logout();
        nav("/");
      }}
    />
  );
}
