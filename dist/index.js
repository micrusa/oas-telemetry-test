"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oas_telemetry_1 = require("@oas-tools/oas-telemetry");
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const DiskLogExporter_1 = require("./disk/DiskLogExporter");
const DiskTraceExporter_1 = require("./disk/DiskTraceExporter");
const DiskMetricReader_1 = require("./disk/DiskMetricReader");
function createDiskConfig() {
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
        extraExporters: [new DiskLogExporter_1.DiskLogExporter(createDiskConfig())],
        //extraExporters: [new TestLogExporter()],
        //extraProcessors: [new TestLogProcessor()],
    },
    traces: {
        extraExporters: [new DiskTraceExporter_1.DiskTraceExporter(createDiskConfig())],
        //extraExporters: [new TestSpanExporter()],
        //extraProcessors: [new TestSpanProcessor()],
    },
    metrics: {
        extraReaders: [
            new DiskMetricReader_1.DiskMetricReader({
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
const telemetryRouter = (0, oas_telemetry_1.oasTelemetry)(oasTelemetryConfig);
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
// Mount telemetry router before main router
app.use(telemetryRouter);
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
