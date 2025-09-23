import routesCsv from "../data/bus-routes.csv?raw";
import Papa from "papaparse";
import type BusRoute from "@/models/BusRoute";

export const getRouteDataLocal = async (): Promise<BusRoute[]> => {
  try {
    // Parse CSV into JSON
    const data: BusRoute[] = Papa.parse(routesCsv, {
      header: true,
      skipEmptyLines: true,
    }).data as BusRoute[];

    return data;
  } catch (error) {
    console.error("Error reading or parsing Route CSV file:", error);
    return [];
  }
};
