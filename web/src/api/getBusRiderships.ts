import { mergeBusRiderships } from "@/lib/utils";
import type BusRidership from "@/models/BusRidership";

const RIDERSHIP_24_API_URL = "https://data.ny.gov/resource/kv7t-n8in.json";

const RIDERSHIP_25_API_URL = "https://data.ny.gov/resource/gxb3-akrn.json";

export const getRidershipData = async ({
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

    const url_query = `${
      query && query.length > 0
        ? `?$query=${encodeURIComponent(finalQuery)}`
        : `?$offset=${offset}`
    }`;

    const response_24 = await fetch(`${RIDERSHIP_24_API_URL}${url_query}`);
    if (!response_24.ok)
      throw new Error("Failed to fetch Bus Ridership 2020-2024 data");

    const data_24: BusRidership[] = await response_24.json();

    const response_25 = await fetch(`${RIDERSHIP_25_API_URL}${url_query}`);
    if (!response_25.ok)
      throw new Error("Failed to fetch Bus Ridership 2025- data");

    const data_25: BusRidership[] = await response_25.json();

    const combinedData = mergeBusRiderships(data_24, data_25);

    return combinedData;
  } catch (error) {
    console.error("Error fetching Bus Ridership data:", error);
    return [];
  }
};
