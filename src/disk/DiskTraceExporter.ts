import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
//import { applyNesting, removeCircularRefs } from '../oas-telemetry/packages/lib/src/telemetry/custom-implementations/utils/circular.js';
import { applyNesting, removeCircularRefs } from "./circular.js";
import {
  BaseDiskJsonExporter,
  BaseExporterOptions,
} from "./BaseDiskJsonExporter.js";

export class DiskTraceExporter
  extends BaseDiskJsonExporter
  implements SpanExporter
{
  constructor(options: BaseExporterOptions) {
    super("spans", "traces", options);
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    try {
      const serializableSpans = spans
        .map((span) => removeCircularRefs(span))
        .map((span) => applyNesting(span));

      this.addToQueue(serializableSpans);
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error: any) {
      console.error(
        `[DiskTraceExporter] Failed to queue spans: ${error?.message || error}`,
      );
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}
