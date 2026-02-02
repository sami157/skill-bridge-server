import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const BACKEND_BASE_URL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL ? "https://skill-bridge-server-eight.vercel.app" : "http://localhost:3000");

const isProduction = !!process.env.VERCEL || process.env.NODE_ENV === "production";

// Always allow the request origin (no 403 Invalid origin). Called per-request; we add current origin to the list.
async function trustedOrigins(request?: { headers?: { get?: (n: string) => string | null } }): Promise<string[]> {
  const list = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://skill-bridge-one-pi.vercel.app",
  ];
  const headers = request?.headers;
  const get = headers?.get;
  if (typeof get === "function") {
    const raw = (get("origin") ?? get("referer") ?? "") as string;
    const o = (raw.split("?")[0] ?? raw).replace(/\/$/, "").trim();
    if (o && !list.includes(o)) list.push(o);
  }
  return list;
}

export const auth = betterAuth({
  baseURL: BACKEND_BASE_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins,
  advanced: {
    disableOriginCheck: true,
    disableCSRFCheck: true,
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
