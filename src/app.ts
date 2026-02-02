import { toNodeHandler } from "better-auth/node";
import express, { type Application, type Request, type Response, type NextFunction } from "express";
import { auth } from "./lib/auth";
import { categoryRouter } from "./modules/categories/category.route";
import { subjectRouter } from "./modules/subjects/subjects.route";
import { tutorRouter } from "./modules/tutors/tutors.route";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { usersRouter } from "./modules/users/users.route";

const app: Application = express();

// CORS: set on every response so preflight and actual requests never get blocked
function corsHeaders(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
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

// Debug: log request Origin for auth routes (shows in Vercel logs)
app.use("/api/auth", (req, _res, next) => {
  const origin = req.headers.origin ?? req.headers.referer ?? "(none)";
  console.log("[Better Auth] request Origin:", origin, "| path:", req.method, req.path);
  next();
});

// Debug: check if a user exists and has credential account (no secrets). Must be before auth catch-all.
app.get("/api/auth/debug-credentials", async (req, res) => {
  const { prisma } = await import("./lib/prisma");
  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
  if (!email) {
    return res.status(400).json({ error: "Missing query param: email" });
  }
  try {
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
    console.error("[debug-credentials]", e);
    res.status(500).json({ error: "Database error" });
  }
});

app.use("/api/auth", toNodeHandler(auth));

app.use('/categories', categoryRouter)
app.use('/subjects', subjectRouter)
app.use('/tutors', tutorRouter)
app.use('/bookings', bookingRouter)
app.use('/users', usersRouter)

app.get("/", (req, res) => {
    res.send("Hello, this is Skill Bridge server!");
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

// Prevent serverless crash: catch errors and return 500 instead of crashing
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default app;