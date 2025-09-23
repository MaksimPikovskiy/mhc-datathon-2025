import { mergeBusSpeeds } from "@/lib/utils";
import type BusSpeed from "@/models/BusSpeed";

const SPEED_24_API_URL = "https://data.ny.gov/resource/6ksi-7cxr.json";

const SPEED_25_API_URL = "https://data.ny.gov/resource/4u4b-jge6.json";

export const getSpeedData = async ({
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

    const response_24 = await fetch(`${SPEED_24_API_URL}${url_query}`);
    if (!response_24.ok)
      throw new Error("Failed to fetch Bus Speed 2020-2024 data");

    const data_24: BusSpeed[] = await response_24.json();

    const response_25 = await fetch(`${SPEED_25_API_URL}${url_query}`);
    if (!response_25.ok)
      throw new Error("Failed to fetch Bus Speed 2025- data");

    const data_25: BusSpeed[] = await response_25.json();

    const combinedData = mergeBusSpeeds(data_24, data_25);

    return combinedData;
  } catch (error) {
    console.error("Error fetching Bus Speed data:", error);
    return [];
  }
};