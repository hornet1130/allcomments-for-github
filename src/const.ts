export const DEFAULT_ALLOWED_DOMAINS: string[] = ["github.com"];
export const DEFAULT_INTERVAL_MS = 2000;
export const DEFAULT_MAX_ATTEMPTS = 20;
export const DEFAULT_LOAD_PATTERN =
  "Load more|Show more replies|Show \\d+ more replies";
export const DEFAULT_HIDDEN_PATTERN =
  "\\d+\\s+(remaining|hidden)\\s+(items|replies|comments)";
export const COLORS: Record<"info" | "success" | "warning" | "error", string> =
  {
    info: "rgba(0,0,0,0.7)",
    success: "#0047ab",
    warning: "#ffa500",
    error: "#ff0000",
  };
export const isDev = process.env.NODE_ENV !== "production";
