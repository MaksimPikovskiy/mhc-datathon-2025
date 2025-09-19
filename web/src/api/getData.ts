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

const API_URL = "https://data.ny.gov/resource/kh8p-hcbm.json";

export const getData = async ({
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

    const url = `${API_URL}${
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
  }
};
