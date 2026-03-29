import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import RoleSelection from "@/components/RoleSelection";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/wellnest-store";
import { setState } from "@/lib/wellnest-store";

export default function RoleSelectionPage() {
  const { setRole, token } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!token) nav("/signup", { replace: true });
  }, [token, nav]);

  const onSelect = async (role: UserRole) => {
    if (!role) return;
    try {
      if (role === "mother") {
        await setRole("MOTHER");
        setState({ role: "mother" });
        nav("/dashboard");
      } else {
        await setRole("FAMILY");
        setState({ role: "family" });
        nav("/family");
      }
      toast.success("You're all set 🌿");
    } catch {
      toast.error("Couldn't save role — try again?");
    }
  };

  return <RoleSelection onSelect={onSelect} />;
}
