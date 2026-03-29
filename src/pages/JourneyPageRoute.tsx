import { useNavigate, useLocation } from "react-router-dom";
import JourneyPage from "@/components/JourneyPage";
import { goTab, tabFromPath } from "@/utils/navTab";

export default function JourneyPageRoute() {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <JourneyPage
      onBack={() => nav("/dashboard")}
      activeTab={tabFromPath(loc.pathname)}
      onTabChange={(t) => goTab(nav, t)}
    />
  );
}
