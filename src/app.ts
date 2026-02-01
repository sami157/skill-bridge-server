import { toNodeHandler } from "better-auth/node";
import express, { type Application } from "express";
import { auth } from "./lib/auth";
import cors from "cors";
import { categoryRouter } from "./modules/categories/category.route";
import { subjectRouter } from "./modules/subjects/subjects.route";
import { tutorRouter } from "./modules/tutors/tutors.route";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { usersRouter } from "./modules/users/users.route";

const app:Application = express();

// CORS: allow frontend origin so browser doesn't block requests
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      const noOrigin = !origin; // same-origin or non-browser
      const localhost =
        noOrigin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const appUrl = process.env.APP_URL && origin === process.env.APP_URL;
      const allowList = allowedOrigins.includes(origin || "");
      const vercelHost =
        /^https:\/\/[^/]+\.vercel\.app$/.test(origin || "");
      const allowed =
        localhost || appUrl || allowList || vercelHost;
      callback(null, allowed ? origin || true : false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.all('/api/auth/{*splat}', toNodeHandler(auth));
app.use('/categories', categoryRouter)
app.use('/subjects', subjectRouter)
app.use('/tutors', tutorRouter)
app.use('/bookings', bookingRouter)
app.use('/users', usersRouter)

app.get("/", (req, res) => {
    res.send("Hello, this is Skill Bridge server!");
})

export default app;