import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FamilyDashboard from "@/components/FamilyDashboard";
import { useAuth } from "@/context/AuthContext";

export default function FamilyDashboardPage() {
  const nav = useNavigate();
  const { logout, user } = useAuth();
  const r = useRef(false);

  useEffect(() => {
    if (!user || r.current) return;
    if (user.role === "MOTHER") {
      r.current = true;
      nav("/dashboard", { replace: true });
    }
  }, [user, nav]);

  return (
    <FamilyDashboard
      useLiveApi
      onLogout={() => {
        logout();
        nav("/");
      }}
    />
  );
}
