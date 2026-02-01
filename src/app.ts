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

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.options("*", cors());

app.use(express.json());
app.all("/api/auth/*", toNodeHandler(auth));

app.use('/categories', categoryRouter)
app.use('/subjects', subjectRouter)
app.use('/tutors', tutorRouter)
app.use('/bookings', bookingRouter)
app.use('/users', usersRouter)

app.get("/", (req, res) => {
    res.send("Hello, this is Skill Bridge server!");
})

export default app;