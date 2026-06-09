import {
  ExportResult,
  ExportResultCode,
  hrTimeToMicroseconds,
} from "@opentelemetry/core";
import { LogRecordExporter, ReadableLogRecord } from "@opentelemetry/sdk-logs";
import { applyNesting, removeCircularRefs } from "./circular.js";
import {
  BaseDiskJsonExporter,
  BaseExporterOptions,
} from "./BaseDiskJsonExporter.js";

export class DiskLogExporter
  extends BaseDiskJsonExporter
  implements LogRecordExporter
{
  constructor(options: BaseExporterOptions) {
    super("logs", "logs", options);
  }

  export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    try {
      const serializableLogs = logs
        .map((logRecord) => this.formatLogRecord(logRecord))
        .map((log) => removeCircularRefs(log))
        .map((log) => applyNesting(log));

      this.addToQueue(serializableLogs);
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error: any) {
      console.error(
        `[DiskLogExporter] Failed to queue logs: ${error?.message || error}`,
      );
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private formatLogRecord(logRecord: ReadableLogRecord) {
    return {
      resource: { attributes: logRecord.resource.attributes },
      instrumentationScope: logRecord.instrumentationScope,
      timestamp: hrTimeToMicroseconds(logRecord.hrTime) ?? Date.now(),
      observedTimestamp:
        hrTimeToMicroseconds(logRecord.hrTimeObserved) ?? Date.now(),
      traceId: logRecord.spanContext?.traceId,
      spanId: logRecord.spanContext?.spanId,
      traceFlags: logRecord.spanContext?.traceFlags,
      severityText: logRecord.severityText,
      severityNumber: logRecord.severityNumber,
      body: logRecord.body,
      attributes: logRecord.attributes,
    };
  }
}
