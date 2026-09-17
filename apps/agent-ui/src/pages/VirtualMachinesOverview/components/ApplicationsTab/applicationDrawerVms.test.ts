import { describe, expect, it, vi } from "vitest";
import {
  applicationDrawerByExpression,
  applicationFilterExpression,
  fetchApplicationDrawerVms,
} from "./applicationDrawerVms";

describe("applicationDrawerByExpression", () => {
  it("filters by application name alone when no VM scope is provided", () => {
    expect(applicationDrawerByExpression("Nginx")).toBe(
      "application = 'Nginx'",
    );
  });

  it("ANDs the application filter with the VM id list", () => {
    expect(applicationDrawerByExpression("Docker", ["vm-1", "vm-2"])).toBe(
      "(application = 'Docker') and (id in ['vm-1','vm-2'])",
    );
  });
});

describe("applicationFilterExpression", () => {
  it("escapes quotes in the application name", () => {
    expect(applicationFilterExpression("O'Reilly")).toBe(
      "application = 'O\\'Reilly'",
    );
  });
});

describe("fetchApplicationDrawerVms", () => {
  it("does not fetch when the scoped VM list is empty", async () => {
    const agentApi = {
      listLatestVirtualMachines: vi.fn(),
      listLatestGroups: vi.fn(),
    };

    await expect(
      fetchApplicationDrawerVms(agentApi as never, "Docker", []),
    ).resolves.toEqual([]);
    expect(agentApi.listLatestVirtualMachines).not.toHaveBeenCalled();
  });

  it("requests only VMs in the application scope", async () => {
    const agentApi = {
      listLatestVirtualMachines: vi.fn(async () => ({
        virtualMachines: [{ id: "vm-1", name: "web-01" }],
        total: 1,
        pageCount: 1,
      })),
      listLatestGroups: vi.fn(async () => ({
        groups: [],
        total: 0,
        pageCount: 1,
      })),
    };

    await fetchApplicationDrawerVms(agentApi as never, "Docker", [
      "vm-1",
      "vm-2",
    ]);

    expect(agentApi.listLatestVirtualMachines).toHaveBeenCalledWith(
      expect.objectContaining({
        byExpression: "(application = 'Docker') and (id in ['vm-1','vm-2'])",
      }),
    );
  });
});
