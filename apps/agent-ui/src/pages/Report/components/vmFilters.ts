export interface VMFilters {
  // Client-side filters (for UI display and client-side filtering - status and issues only)
  hasIssues?: boolean;
  statuses?: string[];
  search?: string;

  // Backend filters (match API parameters - disk and memory use these)
  minIssues?: number;
  diskSizeMin?: number;
  diskSizeMax?: number;
  memorySizeMin?: number;
  memorySizeMax?: number;
}

/**
 * Converts VM filters to URL search params
 */
export function filtersToSearchParams(filters: VMFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Client-side filters
  if (filters.hasIssues !== undefined) {
    params.set("hasIssues", filters.hasIssues.toString());
  }

  if (filters.statuses && filters.statuses.length > 0) {
    params.set("statuses", filters.statuses.join(","));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  // Backend filters
  if (filters.minIssues !== undefined) {
    params.set("minIssues", filters.minIssues.toString());
  }

  if (filters.diskSizeMin !== undefined) {
    params.set("diskSizeMin", filters.diskSizeMin.toString());
  }

  if (filters.diskSizeMax !== undefined) {
    params.set("diskSizeMax", filters.diskSizeMax.toString());
  }

  if (filters.memorySizeMin !== undefined) {
    params.set("memorySizeMin", filters.memorySizeMin.toString());
  }

  if (filters.memorySizeMax !== undefined) {
    params.set("memorySizeMax", filters.memorySizeMax.toString());
  }

  return params;
}

/**
 * Parses URL search params to VM filters
 */
export function searchParamsToFilters(
  searchParams: URLSearchParams,
): VMFilters {
  const filters: VMFilters = {};

  // Client-side filters
  const hasIssues = searchParams.get("hasIssues");
  if (hasIssues !== null) {
    filters.hasIssues = hasIssues === "true";
  }

  const statuses = searchParams.get("statuses");
  if (statuses) {
    filters.statuses = statuses.split(",").filter(Boolean);
  }

  const search = searchParams.get("search");
  if (search) {
    filters.search = search;
  }

  // Backend filters
  const minIssues = searchParams.get("minIssues");
  if (minIssues !== null) {
    const parsed = Number.parseInt(minIssues, 10);
    if (!Number.isNaN(parsed)) {
      filters.minIssues = parsed;
    }
  }

  const diskSizeMin = searchParams.get("diskSizeMin");
  if (diskSizeMin !== null) {
    const parsed = Number.parseInt(diskSizeMin, 10);
    if (!Number.isNaN(parsed)) {
      filters.diskSizeMin = parsed;
    }
  }

  const diskSizeMax = searchParams.get("diskSizeMax");
  if (diskSizeMax !== null) {
    const parsed = Number.parseInt(diskSizeMax, 10);
    if (!Number.isNaN(parsed)) {
      filters.diskSizeMax = parsed;
    }
  }

  const memorySizeMin = searchParams.get("memorySizeMin");
  if (memorySizeMin !== null) {
    const parsed = Number.parseInt(memorySizeMin, 10);
    if (!Number.isNaN(parsed)) {
      filters.memorySizeMin = parsed;
    }
  }

  const memorySizeMax = searchParams.get("memorySizeMax");
  if (memorySizeMax !== null) {
    const parsed = Number.parseInt(memorySizeMax, 10);
    if (!Number.isNaN(parsed)) {
      filters.memorySizeMax = parsed;
    }
  }

  return filters;
}

/**
 * Checks if any filters are applied
 */
export function hasActiveFilters(filters: VMFilters): boolean {
  return !!(
    filters.hasIssues ||
    filters.minIssues !== undefined ||
    filters.diskSizeMin !== undefined ||
    filters.diskSizeMax !== undefined ||
    filters.memorySizeMin !== undefined ||
    filters.memorySizeMax !== undefined ||
    (filters.statuses && filters.statuses.length > 0) ||
    filters.search
  );
}

/**
 * Helper: Parse memory tier string (e.g., "0-4 GB", "256+ GB") to filter values
 * This must match the exact ranges defined in VMTable's memorySizeRanges
 */
export function parseMemoryTier(tier: string): {
  memorySizeMin?: number;
  memorySizeMax?: number;
} {
  const MB_IN_GB = 1024;

  // Normalize the tier string
  const normalized = tier.trim();

  // Define exact mappings to match VMTable ranges
  const memoryRangeMappings: Record<
    string,
    { min: number; max: number | undefined }
  > = {
    "0-4": { min: 0, max: 4 * MB_IN_GB },
    "0-4 GB": { min: 0, max: 4 * MB_IN_GB },
    "5-16": { min: 4 * MB_IN_GB + 1, max: 16 * MB_IN_GB },
    "5-16 GB": { min: 4 * MB_IN_GB + 1, max: 16 * MB_IN_GB },
    "17-32": { min: 16 * MB_IN_GB + 1, max: 32 * MB_IN_GB },
    "17-32 GB": { min: 16 * MB_IN_GB + 1, max: 32 * MB_IN_GB },
    "33-64": { min: 32 * MB_IN_GB + 1, max: 64 * MB_IN_GB },
    "33-64 GB": { min: 32 * MB_IN_GB + 1, max: 64 * MB_IN_GB },
    "65-128": { min: 64 * MB_IN_GB + 1, max: 128 * MB_IN_GB },
    "65-128 GB": { min: 64 * MB_IN_GB + 1, max: 128 * MB_IN_GB },
    "129-256": { min: 128 * MB_IN_GB + 1, max: 256 * MB_IN_GB },
    "129-256 GB": { min: 128 * MB_IN_GB + 1, max: 256 * MB_IN_GB },
    "256+": { min: 256 * MB_IN_GB + 1, max: undefined },
    "256+ GB": { min: 256 * MB_IN_GB + 1, max: undefined },
  };

  // Check for exact match first
  if (normalized in memoryRangeMappings) {
    const { min, max } = memoryRangeMappings[normalized];
    return { memorySizeMin: min, memorySizeMax: max };
  }

  // Fallback: Pattern: "256+ GB" or "256+"
  const plusMatch = normalized.match(/^(\d+)\+(?:\s*GB)?$/i);
  if (plusMatch) {
    const value = Number.parseInt(plusMatch[1]);
    return { memorySizeMin: value * MB_IN_GB + 1 };
  }

  // Fallback: Pattern: "0-4 GB" or "0-4"
  const rangeMatch = normalized.match(/^(\d+)-(\d+)(?:\s*GB)?$/i);
  if (rangeMatch) {
    const min = Number.parseInt(rangeMatch[1]);
    const max = Number.parseInt(rangeMatch[2]);
    return {
      memorySizeMin: min === 0 ? 0 : min * MB_IN_GB + 1,
      memorySizeMax: max * MB_IN_GB,
    };
  }

  return {};
}

/**
 * Helper: Parse disk tier string (e.g., "0-10 TB", "> 50 TB") to filter values
 * This must match the exact ranges defined in VMTable's diskSizeRanges
 */
export function parseDiskTier(tier: string): {
  diskSizeMin?: number;
  diskSizeMax?: number;
} {
  const MB_IN_TB = 1024 * 1024;

  // Normalize the tier string
  const normalized = tier.trim();

  // Define exact mappings to match VMTable ranges
  const diskRangeMappings: Record<
    string,
    { min: number; max: number | undefined }
  > = {
    "0-10 TB": { min: 0, max: 10 * MB_IN_TB },
    "11-20 TB": { min: 10 * MB_IN_TB + 1, max: 20 * MB_IN_TB },
    "21-50 TB": { min: 20 * MB_IN_TB + 1, max: 50 * MB_IN_TB },
    "50+ TB": { min: 50 * MB_IN_TB + 1, max: undefined },
  };

  // Check for exact match first
  if (normalized in diskRangeMappings) {
    const { min, max } = diskRangeMappings[normalized];
    return { diskSizeMin: min, diskSizeMax: max };
  }

  // Fallback: Pattern: "> 50 TB" or "50+ TB"
  const plusMatch = normalized.match(/^[>≥]?\s*(\d+)\+?\s*TB$/i);
  if (plusMatch) {
    const value = Number.parseInt(plusMatch[1]);
    return { diskSizeMin: value * MB_IN_TB + 1 };
  }

  // Fallback: Pattern: "0-10 TB", "11-20 TB", etc.
  const rangeMatch = normalized.match(/^(\d+)-(\d+)\s*TB$/i);
  if (rangeMatch) {
    const min = Number.parseInt(rangeMatch[1]);
    const max = Number.parseInt(rangeMatch[2]);
    return {
      diskSizeMin: min === 0 ? 0 : min * MB_IN_TB + 1,
      diskSizeMax: max * MB_IN_TB,
    };
  }

  return {};
}
