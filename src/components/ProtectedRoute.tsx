import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NestiOrb from "@/components/nesti/NestiOrb";

export function ProtectedRoute() {
  const { token, isGuest, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">
        Getting your wellness ready 🌿...
      </div>
    );
  }

  if (!token && !isGuest) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  return (
    <>
      <Outlet />
      <NestiOrb />
    </>
  );
}
