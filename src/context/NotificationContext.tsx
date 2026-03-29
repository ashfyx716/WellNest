import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/services/api";

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

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("wellnest_token")) return;
    try {
      const { data } = await api.get<
        { id: number; type: string; title: string; message: string; read: boolean; createdAt: string }[]
      >("/api/notifications/all");
      setItems(
        data.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt,
        }))
      );
    } catch {
      /* guest / offline */
    }
  }, []);

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
    void refresh();
    const t = setInterval(() => void refresh(), 45_000);
    return () => clearInterval(t);
  }, [refresh]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const v = useMemo(() => ({ items, unreadCount, refresh, markRead }), [items, unreadCount, refresh, markRead]);

  return <NotificationContext.Provider value={v}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const c = useContext(NotificationContext);
  if (!c) throw new Error("NotificationProvider missing");
  return c;
}
