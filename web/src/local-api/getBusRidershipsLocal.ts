import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { mergeBusRiderships } from "@/lib/utils";
import type BusRidership from "@/models/BusRidership";

const RIDERSHIP_24_CSV = path.resolve(process.cwd(), "data/ridership_24.csv");
const RIDERSHIP_25_CSV = path.resolve(process.cwd(), "data/ridership_25.csv");

export const getRidershipData = async (): Promise<BusRidership[]> => {
  try {
    // Read the CSV files
    const csv24 = fs.readFileSync(RIDERSHIP_24_CSV, "utf-8");
    const csv25 = fs.readFileSync(RIDERSHIP_25_CSV, "utf-8");

    // Parse CSV into JSON
    const data_24: BusRidership[] = Papa.parse(csv24, {
      header: true,
      skipEmptyLines: true,
    }).data as BusRidership[];

    const data_25: BusRidership[] = Papa.parse(csv25, {
      header: true,
      skipEmptyLines: true,
    }).data as BusRidership[];

    // Merge the two datasets
    const combinedData = mergeBusRiderships(data_24, data_25);

    return combinedData;
  } catch (error) {
    console.error("Error reading or parsing CSV files:", error);
    return [];
  }
};
