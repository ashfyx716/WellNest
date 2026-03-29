import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (password !== confirm) {
      toast.error("Passwords don't match yet — try again?", { id: "signup-validate" });
      return;
    }
    setSubmitting(true);
    try {
      await signup(name, email, password, phone || undefined);
      toast.success("Account ready — choose your path 💛");
      nav("/role-select");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          toast.error("That email is already registered — tap Login below to sign in 💛", {
            id: "signup-error",
          });
          return;
        }
        if (!err.response) {
          toast.error("Can't reach the server — start the API (e.g. Spring Boot) and try again.", {
            id: "signup-error",
          });
          return;
        }
      }
      toast.error("Something went wrong — try again in a moment.", { id: "signup-error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-wellnest-cream via-wellnest-parchment to-wellnest-cream text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card-strong p-8 bg-wellnest-cream/95 border-border/60 shadow-lg"
      >
        <h1 className="text-3xl font-display font-bold text-center mb-2">Join WellNest</h1>
        <p className="text-sm text-muted-foreground text-center font-body mb-6">A gentle start 🌸</p>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <input
            required
            placeholder="Name"
            className="w-full rounded-xl border border-input bg-wellnest-cream px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-input bg-wellnest-cream px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Phone (optional)"
            className="w-full rounded-xl border border-input bg-wellnest-cream px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Password"
            minLength={6}
            className="w-full rounded-xl border border-input bg-wellnest-cream px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Confirm password"
            className="w-full rounded-xl border border-input bg-wellnest-cream px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="wellnest-btn-large w-full bg-primary text-primary-foreground font-display mt-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? "Creating…" : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-sm mt-4 font-body text-muted-foreground">
          Have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
