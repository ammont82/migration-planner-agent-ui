import { vi } from "vitest";
import type { AgentApiClient } from "../api/agentApi";

/**
 * Minimal SDK stub so `createStore`'s `appInitialized` collector-resume
 * listener does not throw when tests pass a partial fake client.
 */
export function withCollectorReady(
  api: Partial<AgentApiClient> = {},
): AgentApiClient {
  return {
    getCollectorStatus: vi.fn(async () => ({ status: "ready" })),
    ...api,
  } as unknown as AgentApiClient;
}
