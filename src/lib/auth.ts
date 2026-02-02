import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// Build trusted origins: APP_URL (with and without trailing slash) + ALLOWED_ORIGINS
function getTrustedOrigins(): string[] {
  const origins = new Set<string>();
  const add = (url: string) => {
    if (!url?.trim()) return;
    const u = url.trim().replace(/\/$/, "");
    origins.add(u);
    origins.add(`${u}/`);
  };
  if (process.env.APP_URL) add(process.env.APP_URL);
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(",").forEach((o) => add(o.trim()));
  }
  origins.add("http://localhost:3000");
  origins.add("http://localhost:5173");
  origins.add("http://127.0.0.1:3000");
  origins.add("http://127.0.0.1:5173");
  return Array.from(origins);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
});