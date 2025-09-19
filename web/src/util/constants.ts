import type { BusViolation } from "@/api/getData";

export const CSV_COLUMNS = [
  "Violation ID",
  "Vehicle ID",
  "First Occurrence",
  "Last Occurrence",
  "Violation Status",
  "Violation Type",
  "Bus Route ID",
  "Violation Latitude",
  "Violation Longitude",
  "Stop ID",
  "Stop Name",
  "Bus Stop Latitude",
  "Bus Stop Longitude",
  "Violation Georeference",
  "Bus Stop Georeference",
];

type ColumnsType = (keyof BusViolation)[];

export const JSON_COLUMNS: ColumnsType = [
  "violation_id",
  "vehicle_id",
  "first_occurrence",
  "last_occurrence",
  "violation_status",
  "violation_type",
  "bus_route_id",
  "violation_latitude",
  "violation_longitude",
  "stop_id",
  "stop_name",
  "bus_stop_latitude",
  "bus_stop_longitude",
  "violation_georeference",
  "bus_stop_georeference",
];
