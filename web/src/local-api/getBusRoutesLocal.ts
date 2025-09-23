import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type BusRoute from "@/models/BusRoute";

const ROUTE_CSV = path.resolve(process.cwd(), "data/routes.csv");

export const getRouteData = async (): Promise<BusRoute[]> => {
  try {
    // Read the CSV file
    const csv = fs.readFileSync(ROUTE_CSV, "utf-8");

    // Parse CSV into JSON
    const data: BusRoute[] = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
    }).data as BusRoute[];

    return data;
  } catch (error) {
    console.error("Error reading or parsing Route CSV file:", error);
    return [];
  }
};
