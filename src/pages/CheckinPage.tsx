import { useLocation, useNavigate } from "react-router-dom";
import ConversationalEntry from "@/components/ConversationalEntry";

export default function CheckinPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const pre = (loc.state as { section?: string } | null)?.section;

  return (
    <ConversationalEntry
      initialSection={pre}
      onComplete={() => nav("/dashboard")}
    />
  );
}
