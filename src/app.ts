import express, { type Application, type Request, type Response, type NextFunction } from "express";
import { categoryRouter } from "./modules/categories/category.route";
import { subjectRouter } from "./modules/subjects/subjects.route";
import { tutorRouter } from "./modules/tutors/tutors.route";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { usersRouter } from "./modules/users/users.route";
import { adminRouter } from "./modules/admin/admin.route";
import { authRouter } from "./modules/auth/auth.route";

const app: Application = express();

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

// NextAuth-compatible auth: register + verify-credentials (used by Next.js app)
app.use("/api/auth", authRouter);

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

app.use("/categories", categoryRouter);
app.use("/subjects", subjectRouter);
app.use("/tutors", tutorRouter);
app.use("/bookings", bookingRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

app.get("/", (_req, res) => {
  res.send("Hello, this is Skill Bridge server!");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  const message = err instanceof Error ? err.message : String(err);
  console.error("[App] error:", err);
  res.status(500).json({ success: false, message });
});

export default app;
