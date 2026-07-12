"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const fleet_1 = __importDefault(require("./routes/fleet"));
const drivers_1 = __importDefault(require("./routes/drivers"));
const trips_1 = __importDefault(require("./routes/trips"));
const maintenance_1 = __importDefault(require("./routes/maintenance"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Config Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Log Requests
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Mount Endpoints
app.use("/api/auth", auth_1.default);
app.use("/api/fleet", fleet_1.default);
app.use("/api/drivers", drivers_1.default);
app.use("/api/trips", trips_1.default);
app.use("/api/maintenance", maintenance_1.default);
app.use("/api/expenses", expenses_1.default);
// Health Check
app.get("/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error("Global Handler Error: ", err);
    res.status(500).json({ error: "An unexpected error occurred on the server." });
});
// Boot listening
app.listen(PORT, () => {
    console.log(`TransitOps API Gateway running on http://localhost:${PORT}`);
});
