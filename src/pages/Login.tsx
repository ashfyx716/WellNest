import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth, roleRedirectPath } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(email, password);
      const raw = localStorage.getItem("wellnest_user");
      const u = raw ? (JSON.parse(raw) as { role: string }) : { role: "MOTHER" };
      toast.success("Welcome back 💛");
      nav(roleRedirectPath(u.role as "MOTHER" | "FAMILY" | "GUEST", false));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          toast.error("Email or password doesn’t match — try again or use Sign up if you’re new.", {
            id: "login-error",
          });
          return;
        }
        if (!err.response) {
          toast.error("Can't reach the server — start the API (e.g. Spring Boot on port 8081) and try again.", {
            id: "login-error",
          });
          return;
        }
      }
      toast.error("Couldn't sign in — check your email and password.", { id: "login-error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-wellnest-cream via-wellnest-parchment to-wellnest-cream text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card-strong p-8 bg-wellnest-cream/95 border-border/60 shadow-lg"
      >
        <h1 className="text-3xl font-display font-bold text-center mb-2">Welcome back 🌿</h1>
        <p className="text-sm text-muted-foreground text-center font-body mb-6">Login to your nest</p>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div>
            <label className="text-xs font-body text-muted-foreground">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-input bg-wellnest-cream px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-body text-muted-foreground">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-input bg-wellnest-cream px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="text-sm text-primary font-body"
            onClick={() => toast("Reset link coming soon — your password is safe with you for now 🌸")}
          >
            Forgot password?
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="wellnest-btn-large w-full bg-primary text-primary-foreground font-display disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4 font-body">
          New here?{" "}
          <Link to="/signup" className="text-primary font-semibold">
            Sign up
          </Link>
        </p>
        <Link to="/" className="block text-center text-xs text-muted-foreground mt-4">
          ← Home
        </Link>
      </motion.div>
    </div>
  );
}
