import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { createRouter } from "./routes";
import { oasTelemetry } from "oas-telemetry-workspace";
import { TestLogExporter } from "./exporters/testLogExporter";
import { TestSpanExporter } from "./exporters/testSpanExporter";
import { TestSpanProcessor } from "./processors/testSpanProcessor";
import { TestLogProcessor } from "./processors/testLogProcessor";
import { TestMetricReader } from "./readers/testMetricReader";

const app = express();
const port = process.env.PORT || 3000;

/**
 spanProcessors: oasTlmConfig.traces.extraProcessors,
 metricReaders: oasTlmConfig.metrics.extraReaders,
 logRecordProcessors: oasTlmConfig.logs.extraProcessors,

 oasTlmConfig.{traces|logs}.extraExporters


 metrics.extraExporters no existe?
 */

import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc"; // or otlp-http
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// 1. Configure the OTLP Exporter
// By default, this sends data to http://localhost:4317 (gRPC) or 4318 (HTTP)
const otlpExporter = new OTLPMetricExporter();

// 2. Setup the Metric Reader
const prometheusMetricReader = new PeriodicExportingMetricReader({
  exporter: otlpExporter,
  exportIntervalMillis: 5000, // Push every 5 seconds
});

const oasTelemetryConfig = {
  general: {
    specFileName: "openapi.json",
  },
  storage: {
    path: "./data",
  },
  logs: {
    //extraExporters: [new TestLogExporter()],
    //extraProcessors: [new TestLogProcessor()],
  },
  traces: {
    extraExporters: [new TestSpanExporter()],
    extraProcessors: [new TestSpanProcessor()],
  },
  metrics: {
    extraReaders: [new TestMetricReader(), prometheusMetricReader],
  },
  auth: {
    enabled: false,
  },
};

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Swagger UI - Load JSON directly
const swaggerPath = path.join(__dirname, "../openapi.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/", createRouter());

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR] Unhandled error", {
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`[INFO] Microservice listening at http://localhost:${port}`);
  console.log(
    `[INFO] Swagger UI available at http://localhost:${port}/api-docs`,
  );
});

app.use(oasTelemetry(oasTelemetryConfig));
