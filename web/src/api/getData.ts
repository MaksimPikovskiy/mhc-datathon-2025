import { mergeBusRiderships, mergeBusSpeeds } from "@/util/utils";

export type BusViolation = {
  violation_id: string;
  vehicle_id: string;
  first_occurrence: string;
  last_occurrence: string;
  violation_status: string;
  violation_type: string;
  bus_route_id: string;
  violation_latitude: string;
  violation_longitude: string;
  stop_id: string;
  stop_name: string;
  bus_stop_latitude: string;
  bus_stop_longitude: string;
  violation_georeference: {
    type: "Point";
    coordinates: number[];
  };
  bus_stop_georeference: {
    type: "Point";
    coordinates: number[];
  };
};

export type BusViolationCount = {
  bus_route_id: string;
  total_violations: number;
  bus_stop_violations: number;
  double_parked_violations: number;
  bus_lane_violations: number;
};

export type BusRoute = {
  route: string;
  program: string;
  implementation_date: string;
};

export type BusSpeed = {
  route_id: string;
  total_mileage: number;
  total_operating_time: number;
  average_speed: number;
};

export type BusRidership = {
  bus_route: string;
  total_ridership: number;
  total_transfers: number;
  total_riders: number;
};

type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

type PolygonFeature = {
  polygon: GeoJSONPolygon;
};

const VIOLATION_API_URL = "https://data.ny.gov/resource/kh8p-hcbm.json";

const ROUTE_API_URL = "https://data.ny.gov/resource/ki2b-sg5y.json";

const CBD_API_URL = "https://data.ny.gov/resource/srxy-5nxn.json";

const SPEED_24_API_URL = "https://data.ny.gov/resource/6ksi-7cxr.json";

const SPEED_25_API_URL = "https://data.ny.gov/resource/4u4b-jge6.json";

const RIDERSHIP_24_API_URL = "https://data.ny.gov/resource/kv7t-n8in.json";

const RIDERSHIP_25_API_URL = "https://data.ny.gov/resource/gxb3-akrn.json";

export const getViolationData = async ({
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
    if (!response.ok) throw new Error("Failed to fetch ACE data");

    const data: BusViolation[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching ACE data:", error);
    return [];
  }
};

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

export const getCBDData = async () => {
  try {
    const response = await fetch(CBD_API_URL);
    if (!response.ok) throw new Error("Failed to fetch CBD data");

    const data: PolygonFeature[] = await response.json();
    return data.map((f) =>
      f.polygon.coordinates[0].map(([lng, lat]) => [lat, lng])
    );
  } catch (error) {
    console.error("Error fetching CBD data:", error);
    return [];
  }
};

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
