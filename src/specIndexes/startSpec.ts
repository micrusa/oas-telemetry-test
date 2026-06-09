import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { createRouter } from "../routes";
import { oasTelemetry } from "@oas-tools/oas-telemetry";

const app = express();
const port = process.env.PORT || 3000;

// Swagger UI - Load JSON directly
const swaggerPath = path.join(__dirname, "../../openapi.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
const specString = JSON.stringify(swaggerDocument);

const oasTelemetryConfig = {
  general: {
    spec: specString,
  },
  storage: {
    path: "./data",
  },
  auth: {
    enabled: false,
  },
};

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/", createRouter());

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR] Unhandled error", err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`[INFO] Microservice (spec) listening at http://localhost:${port}`);
});

app.use(oasTelemetry(oasTelemetryConfig));
