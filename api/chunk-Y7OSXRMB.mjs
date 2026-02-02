import {
  prisma
} from "./chunk-L6OZA6O5.mjs";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
var BACKEND_BASE_URL = process.env.BETTER_AUTH_URL || (process.env.VERCEL ? "https://skill-bridge-server-eight.vercel.app/api/auth" : "http://localhost:3000/api/auth");
var isProduction = !!process.env.VERCEL || process.env.NODE_ENV === "production";
async function trustedOrigins(request) {
  const list = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://skill-bridge-one-pi.vercel.app"
  ];
  const headers = request?.headers;
  const get = headers?.get;
  if (typeof get === "function") {
    const raw = get("origin") ?? get("referer") ?? "";
    const o = (raw.split("?")[0] ?? raw).replace(/\/$/, "").trim();
    if (o && !list.includes(o)) list.push(o);
  }
  return list;
}
function maskEmail(email) {
  if (!email || typeof email !== "string") return "(no email)";
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const l = local.length >= 2 ? local.slice(0, 1) + "***" : "***";
  const d = domain.length >= 4 ? domain.slice(0, 2) + "***" + domain.slice(-2) : "***";
  return `${l}@${d}`;
}
function sanitizeForLog(obj) {
  if (obj === null || obj === void 0) return obj;
  if (typeof obj !== "object") return obj;
  const out = {};
  const skip = /* @__PURE__ */ new Set(["password", "token", "secret", "accessToken", "refreshToken", "idToken"]);
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
var auth = betterAuth({
  baseURL: BACKEND_BASE_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins,
  user: {
    additionalFields: {
      role: { type: "string", input: true }
    }
  },
  advanced: {
    disableOriginCheck: true,
    disableCSRFCheck: true,
    defaultCookieAttributes: isProduction ? { sameSite: "none", secure: true } : void 0,
    useSecureCookies: isProduction
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role;
          const allowed = role === "STUDENT" || role === "TUTOR";
          if (!allowed) {
            user.role = "STUDENT";
          }
          return user;
        },
        after: async (user, _context) => {
          const emailMasked = maskEmail(user?.email);
          console.log("[Better Auth] signup: user created in DB", { id: user?.id, email: emailMasked });
          try {
            const found = user?.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, name: true, role: true } }) : null;
            console.log("[Better Auth] signup: DB verification", found ? "user found" : "user NOT found", found ? { id: found.id, email: maskEmail(found.email), role: found.role } : {});
          } catch (e) {
            console.error("[Better Auth] signup: DB verification error", e);
          }
        }
      }
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const path = ctx.path ?? "";
      if (path !== "/sign-up/email" && path !== "/sign-in/email") return;
      const body = ctx.body ?? {};
      const emailMasked = maskEmail(body?.email);
      console.log("[Better Auth] request", path, "email:", emailMasked);
      const returned = ctx.returned;
      if (returned !== void 0) {
        console.log("[Better Auth] response (sanitized)", path, JSON.stringify(sanitizeForLog(returned)));
      }
    })
  }
});

export {
  auth
};
