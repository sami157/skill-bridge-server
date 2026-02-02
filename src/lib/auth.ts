import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
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

/** Mask email for logs: "user@example.com" -> "u***@ex***.com" */
function maskEmail(email: string | undefined): string {
  if (!email || typeof email !== "string") return "(no email)";
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const l = local.length >= 2 ? local.slice(0, 1) + "***" : "***";
  const d = domain.length >= 4 ? domain.slice(0, 2) + "***" + domain.slice(-2) : "***";
  return `${l}@${d}`;
}

/** Remove password/token/secret fields from an object for safe logging */
function sanitizeForLog(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  const out: Record<string, unknown> = {};
  const skip = new Set(["password", "token", "secret", "accessToken", "refreshToken", "idToken"]);
  for (const [k, v] of Object.entries(obj)) {
    if (skip.has(k)) {
      out[k] = "(redacted)";
      continue;
    }
    if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = sanitizeForLog(v);
    } else {
      out[k] = v;
    }
  }
  return out;
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
  databaseHooks: {
    user: {
      create: {
        after: async (user, _context) => {
          const emailMasked = maskEmail(user?.email as string | undefined);
          console.log("[Better Auth] signup: user created in DB", { id: user?.id, email: emailMasked });
          try {
            const found = user?.id
              ? await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, name: true } })
              : null;
            console.log("[Better Auth] signup: DB verification", found ? "user found" : "user NOT found", found ? { id: found.id, email: maskEmail(found.email) } : {});
          } catch (e) {
            console.error("[Better Auth] signup: DB verification error", e);
          }
        },
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const path = (ctx as { path?: string }).path ?? "";
      if (path !== "/sign-up/email" && path !== "/sign-in/email") return;
      const body = (ctx as { body?: Record<string, unknown> }).body ?? {};
      const emailMasked = maskEmail(body?.email as string | undefined);
      console.log("[Better Auth] request", path, "email:", emailMasked);
      const returned = (ctx as { returned?: unknown }).returned;
      if (returned !== undefined) {
        console.log("[Better Auth] response (sanitized)", path, JSON.stringify(sanitizeForLog(returned)));
      }
    }),
  },
});
