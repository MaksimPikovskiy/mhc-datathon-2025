import type BusViolationCount from "@/models/BusViolationCount";

const VIOLATION_API_URL = "https://data.ny.gov/resource/kh8p-hcbm.json";

export const getViolationCountData = async ({
  offset = 0,
  query = "",
}: {
  offset?: number;
  query?: string;
}) => {
  try {
    let finalQuery = query;

    if (query && query.length > 0) {
      finalQuery = `${query} OFFSET ${offset}`;
    }

    const url = `${VIOLATION_API_URL}${
      query && query.length > 0
        ? `?$query=${encodeURIComponent(finalQuery)}`
        : `?$offset=${offset}`
    }`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch Violation Count data");

    const data: BusViolationCount[] = await response.json();

    const normalized = data.map((row) => ({
      ...row,
      bus_route_id: row.bus_route_id ?? "ABLE",
    }));

    return normalized;
  } catch (error) {
    console.error("Error fetching Violation Count data:", error);
    return [];
  }
};
