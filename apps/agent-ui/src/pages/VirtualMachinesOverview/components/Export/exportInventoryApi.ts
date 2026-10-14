import { ResponseError } from "@openshift-migration-advisor/agent-sdk";
import type { DefaultApiInterface } from "../../../../api/agentApi";
import { getAgentApiBasePath } from "../../../../api/agentApiConfig";
import { getLatestCollectionId } from "../../../../api/collectionApi";
import {
  downloadExportBlob,
  getDatedExportBasename,
} from "./downloadExportBlob";
import {
  DEFAULT_EXPORT_FORMAT,
  type ExportFormat,
  type ExportScopeId,
  scopesToExportParam,
} from "./exportScopes";

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const EXPORT_FETCH_INIT = { cache: "no-store" as RequestCache };

/** Infer the payload format from Content-Type, if recognizable. */
export function detectExportFormatFromContentType(
  contentType: string | null,
): ExportFormat | null {
  if (!contentType) {
    return null;
  }

  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (
    normalized === XLSX_CONTENT_TYPE ||
    normalized.includes("spreadsheetml")
  ) {
    return "xlsx";
  }
  if (
    normalized === "application/zip" ||
    normalized === "application/x-zip-compressed" ||
    normalized.endsWith("/zip")
  ) {
    return "zip";
  }

  return null;
}

function assertExportContentTypeMatchesFormat(
  contentType: string | null,
  requestedFormat: ExportFormat,
): void {
  const detectedFormat = detectExportFormatFromContentType(contentType);

  if (requestedFormat === "xlsx") {
    if (detectedFormat === "xlsx") {
      return;
    }
    if (detectedFormat === "zip") {
      throw new Error(
        "Excel export is not supported by this agent. Choose ZIP (CSV files), or upgrade the agent.",
      );
    }
    throw new Error(
      "Could not verify Excel export response. Choose ZIP (CSV files), or try again.",
    );
  }

  if (detectedFormat === "xlsx") {
    throw new Error(
      "The agent returned an unexpected export format. Please try again.",
    );
  }
}

async function getExportErrorMessage(error: unknown): Promise<string> {
  if (!(error instanceof ResponseError)) {
    return error instanceof Error
      ? error.message
      : "Failed to export inventory. Please try again.";
  }

  let message = `Export failed (${error.response.status})`;
  try {
    const body: unknown = await error.response.json();
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      message = body.error;
    }
  } catch {
    // Response body is not JSON.
  }
  return message;
}

export function getInventoryJsonZipFilename(date = new Date()): string {
  return `${getDatedExportBasename(date)}-inventory.zip`;
}

/** GET /inventory?scope=all — ZIP of main + group subset inventories. */
export async function fetchInventoryJsonZip(
  agentApi: DefaultApiInterface,
): Promise<Blob> {
  const basePath = getAgentApiBasePath(agentApi);
  const url = new URL(`${basePath}/inventory`);
  url.searchParams.set("scope", "all");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    let message = `Export failed (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      // Response body is not JSON.
    }
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.toLowerCase().includes("json")) {
    throw new Error(
      "The agent returned JSON instead of a ZIP archive. Please try again.",
    );
  }

  return response.blob();
}

export async function downloadInventoryJsonZip(
  agentApi: DefaultApiInterface,
): Promise<void> {
  const blob = await fetchInventoryJsonZip(agentApi);
  downloadExportBlob(blob, getInventoryJsonZipFilename());
}

export async function fetchExportInventory(
  agentApi: DefaultApiInterface,
  scopes: ExportScopeId[],
  format: ExportFormat = DEFAULT_EXPORT_FORMAT,
): Promise<Blob> {
  const collectionId = await getLatestCollectionId(agentApi);
  if (!collectionId) {
    throw new Error("No collection is available to export.");
  }

  const scope = scopesToExportParam(scopes);

  try {
    const response = await agentApi.exportCollectionRaw(
      {
        id: collectionId,
        scope,
        format,
      },
      EXPORT_FETCH_INIT,
    );

    assertExportContentTypeMatchesFormat(
      response.raw.headers.get("content-type"),
      format,
    );

    return response.value();
  } catch (error) {
    throw new Error(await getExportErrorMessage(error));
  }
}
