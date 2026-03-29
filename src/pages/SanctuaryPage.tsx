import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sanctuary from "@/components/Sanctuary";
import { goTab, tabFromPath } from "@/utils/navTab";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function SanctuaryPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { token, isGuest } = useAuth();
  const [goals, setGoals] = useState<{ id: number; goalText: string }[]>([]);

  useEffect(() => {
    if (!token || isGuest) return;
    api
      .get<{ id: number; goalText: string; completed: boolean }[]>("/api/gentle-goal/active")
      .then(({ data }) => setGoals(data.filter((g) => !g.completed).map((g) => ({ id: g.id, goalText: g.goalText }))))
      .catch(() => {});
  }, [token, isGuest]);

  const complete = (id: number) => {
    api
      .post("/api/gentle-goal/complete", null, { params: { goalId: id } })
      .then(() => {
        setGoals((g) => g.filter((x) => x.id !== id));
        toast.success("Beautiful — goal tucked away 🌿");
      })
      .catch(() => toast.error("Couldn't mark done just now."));
  };

  return (
    <Sanctuary
      gentleGoals={goals}
      onCompleteGoal={(id) => void complete(id)}
      onBack={() => nav("/dashboard")}
      activeTab={tabFromPath(loc.pathname)}
      onTabChange={(t) => goTab(nav, t)}
    />
  );
}
