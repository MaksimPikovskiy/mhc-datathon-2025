import speedsCsv24 from "../data/speeds-24.csv?raw";
import speedsCsv25 from "../data/speeds-25.csv?raw";
import Papa from "papaparse";
import { mergeBusSpeeds } from "@/lib/utils";
import type BusSpeed from "@/models/BusSpeed";

export const getSpeedDataLocal = async (): Promise<BusSpeed[]> => {
  try {
    // Parse CSV into JSON
    const data_24: BusSpeed[] = Papa.parse(speedsCsv24, {
      header: true,
      skipEmptyLines: true,
    }).data as BusSpeed[];

    const data_25: BusSpeed[] = Papa.parse(speedsCsv25, {
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
