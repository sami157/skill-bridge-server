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