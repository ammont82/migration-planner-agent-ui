import type { DefaultApiInterface } from "../../../../api/agentApi";
import {
  combineFilterExpressions,
  vmIdsToFilterExpression,
} from "../../../Groups/utils/groupFilters";
import {
  buildVmGroupMembership,
  mergeVmGroupItems,
  type VirtualMachineWithGroupItems,
} from "../../../Groups/utils/vmGroupMembership";
import { fetchAllMatchingVms } from "../VirtualMachinesTab/vmSelection";

function escapeApplicationFilterValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

export function applicationFilterExpression(applicationName: string): string {
  return `application = '${escapeApplicationFilterValue(applicationName)}'`;
}

export function applicationDrawerByExpression(
  applicationName: string,
  vmIds?: string[],
): string | undefined {
  return combineFilterExpressions(
    applicationFilterExpression(applicationName),
    vmIds ? vmIdsToFilterExpression(vmIds) : undefined,
  );
}

export async function fetchApplicationDrawerVms(
  agentApi: DefaultApiInterface,
  applicationName: string,
  vmIds?: string[],
): Promise<VirtualMachineWithGroupItems[]> {
  if (vmIds && vmIds.length === 0) {
    return [];
  }

  const [vms, membership] = await Promise.all([
    fetchAllMatchingVms(agentApi, {
      byExpression: applicationDrawerByExpression(applicationName, vmIds),
    }),
    buildVmGroupMembership(agentApi),
  ]);

  return mergeVmGroupItems(vms, membership);
}
