import type { ChartConfig } from "@/components/ui/chart";

export const riskColors = [
  "#FFFFCC", // very low
  "#FFEDA0",
  "#FED976",
  "#FEB24C",
  "#FD8D3C",
  "#F03B20",
  "#BD0026", // very high
];

export const chartConfigTotalViolations = {
  total_violations: {
    label: "Total Violations",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export const chartConfigViolationsPerType = {
  bus_stop_violations: {
    label: "Bus Stop",
    color: "#E53A70",
  },
  double_parked_violations: {
    label: "Double Parked",
    color: "#32CD32",
  },
  bus_lane_violations: {
    label: "Bus Lane",
    color: "#FF8C00",
  },
} satisfies ChartConfig;

export const chartConfigSpeeds = {
  average_speed: {
    label: "Average Speed",
    color: "#2563eb",
  },
};

export const chartConfigRiderships = {
  total_riders: {
    label: "Ridership",
    color: "#2563eb",
  },
};

export const chartConfigRiskScores = {
  riskScore: {
    label: "Risk Score",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export const defaultWeights = {
  doubleParkedViolation: 0.28,
  busStopViolation: 0.22,
  busLaneViolation: 0.2,
  speed: 0.18,
  ridership: 0.12,
};

export const defaultFactorsEnabled = {
  doubleParkedViolation: true,
  busStopViolation: true,
  busLaneViolation: true,
  speed: true,
  ridership: true,
};

export const violationCountQuery = `SELECT 
    bus_route_id,
    COUNT(*) AS total_violations,
    SUM(CASE WHEN violation_type = 'MOBILE BUS STOP' THEN 1 ELSE 0 END) AS bus_stop_violations,
    SUM(CASE WHEN violation_type = 'MOBILE DOUBLE PARKED' THEN 1 ELSE 0 END) AS double_parked_violations,
    SUM(CASE WHEN violation_type = 'MOBILE BUS LANE' THEN 1 ELSE 0 END) AS bus_lane_violations
  WHERE first_occurrence > '2019-12-31T23:59:59'
  GROUP BY bus_route_id`;

export const sections = [
  "home",
  "our_data",
  "risk_factors",
  "route_risk_score",
  "neighborhood_risk_score",
];
