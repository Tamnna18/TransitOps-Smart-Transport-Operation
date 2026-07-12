import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import authRouter from "./routes/auth";
import fleetRouter from "./routes/fleet";
import driversRouter from "./routes/drivers";
import tripsRouter from "./routes/trips";
import maintenanceRouter from "./routes/maintenance";
import expensesRouter from "./routes/expenses";

const app = express();
const PORT = process.env.PORT || 5000;

// Config Middlewares
app.use(cors());
app.use(express.json());

// Log Requests
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Endpoints
app.use("/api/auth", authRouter);
app.use("/api/fleet", fleetRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/expenses", expensesRouter);

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Global Handler Error: ", err);
  res.status(500).json({ error: "An unexpected error occurred on the server." });
});

// Boot listening
app.listen(PORT, () => {
  console.log(`TransitOps API Gateway running on http://localhost:${PORT}`);
});
