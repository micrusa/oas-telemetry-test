import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import { LogRecordExporter, ReadableLogRecord } from "@opentelemetry/sdk-logs";
import { execSync } from "child_process";

export class TestLogExporter implements LogRecordExporter {
  data: ReadableLogRecord[] = [];

  export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    execSync('notify-send "Exporting logs" "Received ' + logs.length + ' log records"')
    this.data.push(...logs);
    resultCallback({ code: ExportResultCode.SUCCESS });
  }
  shutdown(): Promise<void> {
    execSync('notify-send "Shutting down" "Shutting down log exporter"')
    return Promise.resolve();
  }
  forceFlush(): Promise<void> {
    execSync('notify-send "Force flushing" "Flushing ' + this.data.length + ' log records"')
    this.data = [];
    return Promise.resolve();
  }
}
