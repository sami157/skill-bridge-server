import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// Frontend + local dev. Add more if you have other domains.
const TRUSTED_ORIGINS = [
  "https://skill-bridge-one-pi.vercel.app",
  "https://skill-bridge-one-pi.vercel.app/",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: TRUSTED_ORIGINS,
  advanced: {
    // Stop 403 on sign-in from frontend (cross-origin). Re-enable for stricter security.
    disableCSRFCheck: true,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
});