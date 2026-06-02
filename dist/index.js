"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = require("./routes");
const oas_telemetry_workspace_1 = __importDefault(require("oas-telemetry-workspace"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const oasTelemetryConfig = {
    general: {
        baseUrl: "/telemetry",
        specFileName: "openapi.json",
    },
    auth: {
        enabled: false,
    },
};
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`, {
        headers: req.headers,
        body: req.body,
    });
    next();
});
// Swagger UI - Load JSON directly
const swaggerPath = path_1.default.join(__dirname, "../openapi.json");
const swaggerDocument = JSON.parse(fs_1.default.readFileSync(swaggerPath, "utf8"));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Routes
app.use("/", (0, routes_1.createRouter)());
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("[ERROR] Unhandled error", {
        error: err.message,
        stack: err.stack,
    });
    res.status(500).json({ error: "Something went wrong" });
});
app.listen(port, () => {
    console.log(`[INFO] Microservice listening at http://localhost:${port}`);
    console.log(`[INFO] Swagger UI available at http://localhost:${port}/api-docs`);
});
app.use((0, oas_telemetry_workspace_1.default)(oasTelemetryConfig));
