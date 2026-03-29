import { useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useAuth } from "@/context/AuthContext";

export default function SplashScreen() {
  const nav = useNavigate();
  const { continueGuest } = useAuth();

  return (
    <WelcomeScreen
      onLogin={() => nav("/login")}
      onSignup={() => nav("/signup")}
      onGuest={() => {
        continueGuest();
        nav("/dashboard");
      }}
    />
  );
}
