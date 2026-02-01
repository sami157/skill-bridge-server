/**
 * Vercel serverless entry: export the Express app only.
 * Do NOT call app.listen() or prisma.$connect() here.
 */
import app from "./app";

export default app;
