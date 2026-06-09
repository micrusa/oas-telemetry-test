import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import {
  PushMetricExporter,
  ResourceMetrics,
} from "@opentelemetry/sdk-metrics";
import { removeCircularRefs } from "./circular.js";
import {
  BaseDiskJsonExporter,
  BaseExporterOptions,
} from "./BaseDiskJsonExporter.js";

export type DiskMetricReaderOptions = BaseExporterOptions & {
  exportIntervalMillis?: number;
  exportTimeoutMillis?: number;
};

export class DiskMetricReader extends PeriodicExportingMetricReader {
  constructor(options: DiskMetricReaderOptions) {
    const exporter = new DiskMetricExporter(options);

    super({
      exporter: exporter,
      exportIntervalMillis: options.exportIntervalMillis,
      exportTimeoutMillis: options.exportTimeoutMillis,
    });
  }
}

export class DiskMetricExporter
  extends BaseDiskJsonExporter
  implements PushMetricExporter
{
  constructor(options: BaseExporterOptions) {
    super("metrics", "metrics", options);
  }

  export(
    resourceMetrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void,
  ): void {
    try {
      const scopeMetrics = removeCircularRefs(
        resourceMetrics.scopeMetrics || [],
      );

      if (Array.isArray(scopeMetrics) && scopeMetrics.length > 0) {
        this.addToQueue(scopeMetrics);
      }
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error: any) {
      console.error(
        `[DiskMetricJsonExporter] Error al encolar métricas: ${error?.message || error}`,
      );
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}
