import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-node";
import { execSync } from "child_process";

export class TestSpanExporter implements SpanExporter {
  data: ReadableSpan[] = [];

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    execSync(
      'notify-send "Exporting spans" "Received ' +
        spans.length +
        ' span records"',
    );
    this.data.push(...spans);
    resultCallback({ code: ExportResultCode.SUCCESS });
  }
  shutdown(): Promise<void> {
    execSync('notify-send "Shutting down" "Shutting down span exporter"');
    return Promise.resolve();
  }
  forceFlush?(): Promise<void> {
    execSync(
      'notify-send "Force flushing" "Flushing ' +
        this.data.length +
        ' span records"',
    );
    this.data = [];
    return Promise.resolve();
  }
}
