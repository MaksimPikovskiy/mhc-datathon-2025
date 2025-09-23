import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type BusViolationCount from "@/models/BusViolationCount";

const VIOLATION_CSV = path.resolve(process.cwd(), "data/violations.csv");

export const getViolationCountData = async (): Promise<BusViolationCount[]> => {
  try {
    // Read the CSV file
    const csv = fs.readFileSync(VIOLATION_CSV, "utf-8");

    // Parse CSV into JSON
    const data: BusViolationCount[] = Papa.parse(csv, {
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
