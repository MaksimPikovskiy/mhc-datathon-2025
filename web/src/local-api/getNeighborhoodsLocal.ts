import neighborhoodsCsv from "../data/neighbor_with_speeds_ridership.csv?raw";
import Papa from "papaparse";
import type Neighborhood from "@/models/Neighborhood";

export const getNeighborhoodsLocal = async (): Promise<Neighborhood[]> => {
  try {
    // Parse CSV into JSON
    const data: Neighborhood[] = Papa.parse(neighborhoodsCsv, {
      header: true,
      skipEmptyLines: true,
    }).data as Neighborhood[];

    return data;
  } catch (error) {
    console.error("Error reading or parsing Neighborhood CSV file:", error);
    return [];
  }
};
