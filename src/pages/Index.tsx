import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import RoleSelection from "@/components/RoleSelection";
import MotherDashboard from "@/components/MotherDashboard";
import FamilyDashboard from "@/components/FamilyDashboard";
import ConversationalEntry from "@/components/ConversationalEntry";
import JourneyPage from "@/components/JourneyPage";
import Sanctuary from "@/components/Sanctuary";
import { getState, setState, type UserRole } from "@/lib/wellnest-store";

type Screen = "welcome" | "role" | "mother-dashboard" | "family-dashboard" | "check-in" | "journey" | "family-connect" | "relax";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const saved = getState();
    if (saved.role === "mother") setScreen("mother-dashboard");
    else if (saved.role === "family") setScreen("family-dashboard");
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setState({ role: role! });
    if (role === "mother") setScreen("mother-dashboard");
    else setScreen("family-dashboard");
  };

  const handleLogout = () => {
    setState({ role: null });
    setScreen("welcome");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "home": setScreen("mother-dashboard"); break;
      case "journal": setScreen("check-in"); break;
      case "family": setScreen("family-connect"); break;
      case "journey": setScreen("journey"); break;
      case "relax": setScreen("relax"); break;
    }
  };

  switch (screen) {
    case "welcome":
      return (
        <WelcomeScreen
          onLogin={() => setScreen("role")}
          onSignup={() => setScreen("role")}
          onGuest={() => setScreen("role")}
        />
      );
    case "role":
      return <RoleSelection onSelect={handleRoleSelect} />;
    case "mother-dashboard":
      return (
        <MotherDashboard
          onCheckIn={() => { setScreen("check-in"); setActiveTab("journal"); }}
          onJourney={() => { setScreen("journey"); setActiveTab("journey"); }}
          onFamily={() => { setScreen("family-connect"); setActiveTab("family"); }}
          onRelax={() => { setScreen("relax"); setActiveTab("relax"); }}
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      );
    case "family-dashboard":
      return <FamilyDashboard onLogout={handleLogout} />;
    case "check-in":
      return <ConversationalEntry onComplete={() => { setScreen("mother-dashboard"); setActiveTab("home"); }} />;
    case "journey":
      return <JourneyPage onBack={() => { setScreen("mother-dashboard"); setActiveTab("home"); }} activeTab={activeTab} onTabChange={handleTabChange} />;
    case "family-connect":
      return <FamilyDashboard onLogout={() => { setScreen("mother-dashboard"); setActiveTab("home"); }} activeTab={activeTab} onTabChange={handleTabChange} />;
    case "relax":
      return <Sanctuary onBack={() => { setScreen("mother-dashboard"); setActiveTab("home"); }} activeTab={activeTab} onTabChange={handleTabChange} />;
    default:
      return null;
  }
};

export default Index;
