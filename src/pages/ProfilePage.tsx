import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const nav = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-6 pt-8 flex items-center gap-3">
        <button type="button" onClick={() => nav("/dashboard")} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold">Profile</h1>
      </div>
      <div className="px-6 mt-6 glass-card p-6 space-y-2 font-body">
        <p>
          <span className="text-muted-foreground">Name:</span> {user?.name}
        </p>
        <p>
          <span className="text-muted-foreground">Email:</span> {user?.email}
        </p>
        <p>
          <span className="text-muted-foreground">Role:</span> {user?.role}
        </p>
        <button
          type="button"
          className="mt-4 text-primary text-sm font-semibold"
          onClick={() => nav("/settings/privacy")}
        >
          Privacy settings →
        </button>
      </div>
    </div>
  );
}
