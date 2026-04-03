import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { MomMlRiskApi } from "@/types/mlInsights";

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type Ctx = {
  items: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
};

const NotificationContext = createContext<Ctx | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const { user } = useAuth();
  const notifiedIdsRef = useRef<Set<number>>(new Set());
  const lastRiskAlertAtRef = useRef<number>(0);

  const isUrgentMotherAlert = useCallback((n: AppNotification) => {
    const type = (n.type || "").toLowerCase();
    const text = `${n.title || ""} ${n.message || ""}`.toLowerCase();

    const hasStressSignal =
      type.includes("stress") ||
      type.includes("risk") ||
      type.includes("alert") ||
      text.includes("stressed") ||
      text.includes("stress") ||
      text.includes("high risk") ||
      text.includes("severe") ||
      text.includes("needs attention") ||
      text.includes("urgent");

    const isMotherContext =
      text.includes("mother") ||
      text.includes("mom") ||
      text.includes("mama");

    return hasStressSignal && isMotherContext;
  }, []);

  const showBrowserAlerts = useCallback(
    (nextItems: AppNotification[]) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (user?.role !== "FAMILY") return;
      if (Notification.permission !== "granted") return;

      for (const n of nextItems) {
        if (notifiedIdsRef.current.has(n.id)) continue;
        if (!isUrgentMotherAlert(n)) continue;

        notifiedIdsRef.current.add(n.id);
        new Notification(n.title || "WellNest Alert", {
          body: n.message || "Your mother may need support right now.",
          tag: `wellnest-alert-${n.id}`,
          renotify: false,
        });
      }
    },
    [isUrgentMotherAlert, user?.role]
  );

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("wellnest_token")) return;
    try {
      const { data } = await api.get<
        { id: number; type: string; title: string; message: string; read: boolean; createdAt: string }[]
      >("/api/notifications/all");
      const mapped = data.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      }));
      setItems(mapped);
      showBrowserAlerts(mapped);
    } catch {
      /* guest / offline */
    }
  }, [showBrowserAlerts]);

  const refreshFamilyRiskAlert = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!localStorage.getItem("wellnest_token")) return;
    if (user?.role !== "FAMILY" || user.linkedMotherId == null) return;

    try {
      const { data } = await api.get<MomMlRiskApi>("/api/family/mom-ml-risk");
      if (!data?.showAlert) return;
      if (Notification.permission !== "granted") return;

      const now = Date.now();
      const cooldownMs = 15 * 60 * 1000;
      if (now - lastRiskAlertAtRef.current < cooldownMs) return;

      lastRiskAlertAtRef.current = now;
      new Notification("Mom Needs Attention", {
        body:
          data.message ||
          "Your mother may be under severe stress right now. Please check in when you can.",
        tag: "wellnest-mom-high-risk",
        renotify: true,
      });
    } catch {
      /* best-effort only */
    }
  }, [user?.linkedMotherId, user?.role]);

  const markRead = useCallback(async (id: number) => {
    if (!localStorage.getItem("wellnest_token")) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      return;
    }
    try {
      await api.patch(`/api/notifications/read/${id}`);
    } catch {
      /* offline */
    }
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  useEffect(() => {
    void Promise.all([refresh(), refreshFamilyRiskAlert()]);
    const t = setInterval(() => {
      void refresh();
      void refreshFamilyRiskAlert();
    }, 5_000);
    return () => clearInterval(t);
  }, [refresh, refreshFamilyRiskAlert]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (user?.role !== "FAMILY") return;
    if (!localStorage.getItem("wellnest_token")) return;
    if (Notification.permission !== "default") return;

    void Notification.requestPermission();
  }, [user?.role]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const v = useMemo(() => ({ items, unreadCount, refresh, markRead }), [items, unreadCount, refresh, markRead]);

  return <NotificationContext.Provider value={v}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const c = useContext(NotificationContext);
  if (!c) throw new Error("NotificationProvider missing");
  return c;
}
