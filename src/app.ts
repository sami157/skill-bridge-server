import { toNodeHandler } from "better-auth/node";
import express, { type Application } from "express";
import { auth } from "./lib/auth";
import cors from "cors";
import { categoryRouter } from "./modules/categories/category.route";
import { subjectRouter } from "./modules/subjects/subjects.route";
import { tutorRouter } from "./modules/tutors/tutors.route";
import { bookingRouter } from "./modules/bookings/bookings.route";

const app:Application = express();
app.all('/api/auth/{*splat}', toNodeHandler(auth));

app.use(cors());
app.use(express.json());

app.use('/categories', categoryRouter)
app.use('/subjects', subjectRouter)
app.use('/tutors', tutorRouter)
app.use('/bookings', bookingRouter)

app.get("/", (req, res) => {
    res.send("Hello, this is Skill Bridge server!");
})

export default app;