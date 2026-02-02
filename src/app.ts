import type { IncomingHttpHeaders } from "node:http";
import { toNodeHandler } from "better-auth/node";
import express, { type Application, type Request, type Response, type NextFunction } from "express";
import { categoryRouter } from "./modules/categories/category.route";
import { subjectRouter } from "./modules/subjects/subjects.route";
import { tutorRouter } from "./modules/tutors/tutors.route";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { usersRouter } from "./modules/users/users.route";
import { adminRouter } from "./modules/admin/admin.route";

const app: Application = express();

// CORS: allow frontend origin and credentials so cookies work; never block with 403 for origin
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://skill-bridge-one-pi.vercel.app",
  "https://skill-bridge-eight.vercel.app",
];

function corsHeaders(req: Request, res: Response, next: NextFunction) {
  const origin = (req.headers.origin ?? req.headers.referer ?? "").toString().replace(/\/$/, "").split("?")[0].trim();
  const allowOrigin = origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app"))
    ? origin
    : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With, Cookie");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
}
app.use(corsHeaders);

app.use(express.json());

// Fix "Illegal invocation": Better Auth (or deps) may call headers.get(name) with detached reference.
// Express req.headers has no .get(); add a get() that works when called in any context (Node + Vercel).
app.use("/api/auth", (req: Request, _res, next) => {
  const raw = req.headers as IncomingHttpHeaders & Record<string, string | string[] | undefined>;
  raw.get = function get(name: string): string | null {
    const key = Object.keys(raw).find((k) => k !== "get" && k.toLowerCase() === name.toLowerCase());
    const val = key ? raw[key] : undefined;
    if (val === undefined) return null;
    return Array.isArray(val) ? val.join(", ") : val;
  };
  next();
});

// Debug: test DB connection and return actual error (so we can see what's wrong)
app.get("/api/auth/debug-db", async (_req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    res.json({ ok: true, userCount, message: "DB connected" });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[debug-db]", e);
    res.status(500).json({ ok: false, error: message });
  }
});

// Debug: check if a user exists and has credential account (no secrets). Must be before auth catch-all.
app.get("/api/auth/debug-credentials", async (req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ error: "Missing query param: email" });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, accounts: { select: { providerId: true } } },
    });
    const hasCredentialAccount = user?.accounts?.some((a) => a.providerId === "credential") ?? false;
    res.json({
      userFound: !!user,
      hasCredentialAccount,
      accountProviderIds: user?.accounts?.map((a) => a.providerId) ?? [],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[debug-credentials]", e);
    res.status(500).json({ error: "Database error", message });
  }
});

// Load auth on first request so load-time errors (e.g. DATABASE_URL) are caught and returned
app.use("/api/auth", async (req: Request, res: Response, next: NextFunction) => {
  const sendError = (err: unknown) => {
    if (res.headersSent) return;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Better Auth] error:", err);
    res.status(500).json({ success: false, error: "Authentication error", message });
  };
  try {
    const { auth } = await import("./lib/auth");
    const authHandler = toNodeHandler(auth);
    const wrappedNext: NextFunction = (err?: unknown) => {
      if (err) return sendError(err);
      next();
    };
    const result = authHandler(req, res, wrappedNext);
    if (result && typeof (result as Promise<unknown>).catch === "function") {
      (result as Promise<unknown>).catch(sendError);
    }
  } catch (err) {
    sendError(err);
  }
});

app.use('/categories', categoryRouter);
app.use('/subjects', subjectRouter);
app.use('/tutors', tutorRouter);
app.use('/bookings', bookingRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

app.get("/", (req, res) => {
    res.send("Hello, this is Skill Bridge server!");
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

// Global error handler: return actual error message so we can debug 500s
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  const message = err instanceof Error ? err.message : String(err);
  console.error("[App] error:", err);
  res.status(500).json({ success: false, message });
});

export default app;