import express, { type Application } from "express";

const app:Application = express();

app.get("/", (req, res) => {
    res.send("Hello, this is Skill Bridge server!");
})

export default app;