import type BusRoute from "@/models/BusRoute";

const ROUTE_API_URL = "https://data.ny.gov/resource/ki2b-sg5y.json";

export const getRouteData = async ({
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

    const url = `${ROUTE_API_URL}${
      query && query.length > 0
        ? `?$query=${encodeURIComponent(finalQuery)}`
        : `?$offset=${offset}`
    }`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch Bus Route data");

    const data: BusRoute[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Bus Route data:", error);
    return [];
  }
};
