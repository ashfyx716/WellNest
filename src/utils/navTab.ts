import type { NavigateFunction } from "react-router-dom";

const paths: Record<string, string> = {
  home: "/dashboard",
  journal: "/checkin",
  family: "/family-view",
  journey: "/journey",
  relax: "/sanctuary",
};

export function goTab(nav: NavigateFunction, tab: string) {
  nav(paths[tab] ?? "/dashboard");
}

export function tabFromPath(pathname: string): string {
  if (pathname.startsWith("/checkin")) return "journal";
  if (pathname.startsWith("/family-view")) return "family";
  if (pathname.startsWith("/journey")) return "journey";
  if (pathname.startsWith("/sanctuary")) return "relax";
  return "home";
}
