import ridershipCsv24 from "../data/ridership-24.csv?raw";
import ridershipCsv25 from "../data/ridership-25.csv?raw";
import Papa from "papaparse";
import { mergeBusRiderships } from "@/lib/utils";
import type BusRidership from "@/models/BusRidership";

export const getRidershipDataLocal = async (): Promise<BusRidership[]> => {
  try {
    // Parse CSV into JSON
    const data_24: BusRidership[] = Papa.parse(ridershipCsv24, {
      header: true,
      skipEmptyLines: true,
    }).data as BusRidership[];

    const data_25: BusRidership[] = Papa.parse(ridershipCsv25, {
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
