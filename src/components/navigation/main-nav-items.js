/**
 * Single source for primary app nav (PageShell bottom nav + circle-arena bottom nav).
 * Keep hrefs/keys/labels in sync so users get the same destinations everywhere.
 */
export const MAIN_NAV_ITEMS = [
  { key: "predictions", href: "/predictions", label: "Predictions", icon: "ads_click" },
  { key: "circles", href: "/tournaments", label: "Circles", icon: "groups" },
  { key: "home", href: "/dashboard", label: "Home", icon: "sports_cricket" },
  { key: "leaderboard", href: "/leaderboard", label: "Rankings", icon: "leaderboard" },
  { key: "results", href: "/results", label: "Results", icon: "emoji_events" },
  { key: "profile", href: "/profile", label: "Profile", icon: "person" },
];
