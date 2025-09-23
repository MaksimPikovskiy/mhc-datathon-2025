import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { mergeBusSpeeds } from "@/lib/utils";
import type BusSpeed from "@/models/BusSpeed";

const SPEED_24_CSV = path.resolve(process.cwd(), "data/speed_24.csv");
const SPEED_25_CSV = path.resolve(process.cwd(), "data/speed_25.csv");

export const getSpeedData = async (): Promise<BusSpeed[]> => {
  try {
    // Read the CSV files
    const csv24 = fs.readFileSync(SPEED_24_CSV, "utf-8");
    const csv25 = fs.readFileSync(SPEED_25_CSV, "utf-8");

    // Parse CSV into JSON
    const data_24: BusSpeed[] = Papa.parse(csv24, {
      header: true,
      skipEmptyLines: true,
    }).data as BusSpeed[];

    const data_25: BusSpeed[] = Papa.parse(csv25, {
      header: true,
      skipEmptyLines: true,
    }).data as BusSpeed[];

    // Merge the datasets
    const combinedData = mergeBusSpeeds(data_24, data_25);

    return combinedData;
  } catch (error) {
    console.error("Error reading or parsing Speed CSV files:", error);
    return [];
  }
};
