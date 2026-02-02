import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// Backend base URL: BETTER_AUTH_URL env, or production fallback (never infer from request on Vercel)
const BACKEND_BASE_URL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL ? "https://skill-bridge-server-eight.vercel.app" : "http://localhost:3000");

// Frontend / allowed origins: FRONTEND_URL + required list (no trailing slashes for consistent matching)
function getTrustedOrigins(): string[] {
  const list = new Set<string>();
  const add = (url: string) => {
    if (!url?.trim()) return;
    list.add(url.trim().replace(/\/$/, ""));
  };
  add("http://localhost:3000");
  add("https://skill-bridge-one-pi.vercel.app");
  if (process.env.FRONTEND_URL) add(process.env.FRONTEND_URL);
  if (process.env.APP_URL) add(process.env.APP_URL);
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(",").forEach((o) => add(o.trim()));
  }
  add("http://localhost:5173");
  add("http://127.0.0.1:3000");
  add("http://127.0.0.1:5173");
  return Array.from(list);
}

const trustedOrigins = getTrustedOrigins();
const isProduction = !!process.env.VERCEL || process.env.NODE_ENV === "production";

// Debug: print on module load (shows in Vercel function cold start logs)
console.log("[Better Auth] baseURL:", BACKEND_BASE_URL);
console.log("[Better Auth] trustedOrigins:", trustedOrigins);
console.log("[Better Auth] production (cookies sameSite=none):", isProduction);

export const auth = betterAuth({
  baseURL: BACKEND_BASE_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins,
  advanced: {
    defaultCookieAttributes: isProduction
      ? { sameSite: "none", secure: true }
      : undefined,
    useSecureCookies: isProduction,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
});
