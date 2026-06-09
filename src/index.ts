import { oasTelemetry } from "@oas-tools/oas-telemetry";
import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { createRouter } from "./routes";
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

import { BaseExporterOptions } from "./disk/BaseDiskJsonExporter";
import { DiskLogExporter } from "./disk/DiskLogExporter";
import { DiskTraceExporter } from "./disk/DiskTraceExporter";
import { DiskMetricReader } from "./disk/DiskMetricReader";

function createDiskConfig(): BaseExporterOptions {
  return {
    directoryPath: `./data`,
    flushIntervalMs: 5000,
    batchSize: 50,
    maxSegmentBytes: 1024 * 1024 * 1024, // 1GB
  };
}

const oasTelemetryConfig = {
  general: {
    specFileName: "openapi.json",
  },
  logs: {
    extraExporters: [new DiskLogExporter(createDiskConfig())],
    //extraExporters: [new TestLogExporter()],
    //extraProcessors: [new TestLogProcessor()],
  },
  traces: {
    extraExporters: [new DiskTraceExporter(createDiskConfig())],
    //extraExporters: [new TestSpanExporter()],
    //extraProcessors: [new TestSpanProcessor()],
  },
  metrics: {
    extraReaders: [
      new DiskMetricReader({
        ...createDiskConfig(),
        exportIntervalMillis: 1000,
        exportTimeoutMillis: 1000,
      }),
    ],
    mainMetricReaderOptions: {
      exportIntervalMillis: 1000,
    },
    //extraReaders: [new DiskMetricExporter(createDiskConfig())],
    //extraReaders: [new TestMetricReader(), prometheusMetricReader],
  },
  auth: {
    enabled: false,
  },
};

const telemetryRouter = oasTelemetry(oasTelemetryConfig);

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

// Mount telemetry router before main router
app.use(telemetryRouter);

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
