import violationCsv from "../data/ace-violations.csv?raw";
import Papa from "papaparse";
import type BusViolationCount from "@/models/BusViolationCount";

export const getViolationCountDataLocal = async (): Promise<
  BusViolationCount[]
> => {
  try {
    // Parse CSV into JSON
    const data: BusViolationCount[] = Papa.parse(violationCsv, {
      header: true,
      skipEmptyLines: true,
    }).data as BusViolationCount[];

    // Normalize missing bus_route_id
    const normalized = data.map((row) => ({
      ...row,
      bus_route_id: row.bus_route_id ?? "ABLE",
    }));

    return normalized;
  } catch (error) {
    console.error("Error reading or parsing Violation CSV file:", error);
    return [];
  }
};
