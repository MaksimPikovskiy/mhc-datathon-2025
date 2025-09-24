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
    color: "#6C3BAA",
  },
} satisfies ChartConfig;

// export const chartConfigViolationsPerType = {
//   bus_stop_violations: {
//     label: "Bus Stop",
//     color: "#8231C4",
//   },
//   double_parked_violations: {
//     label: "Double Parked",
//     color: "#E9B3FB",
//   },
//   bus_lane_violations: {
//     label: "Bus Lane",
//     color: "#3B0270",
//   },
// } satisfies ChartConfig;

export const chartConfigViolationsPerType = {
  bus_stop_violations: {
    label: "Bus Stop",
    color: "#6C3BAA",
  },
  double_parked_violations: {
    label: "Double Parked",
    color: "#AA3B42",
  },
  bus_lane_violations: {
    label: "Bus Lane",
    color: "#79AA3B",
  },
} satisfies ChartConfig;

export const chartConfigSpeeds = {
  average_speed: {
    label: "Average Speed",
    color: "#6C3BAA",
  },
};

export const chartConfigRiderships = {
  total_riders: {
    label: "Ridership",
    color: "#6C3BAA",
  },
};

export const chartConfigRiskScores = {
  riskScore: {
    label: "Risk Score",
    color: "#6C3BAA",
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
  "datasets",
  "our_data",
  "risk_factors",
  "findings",
  "conclusion",
  "appendix",
];

export const datasets = [
  {
    name: "MTA Bus Automated Camera Enforcement Violations: Beginning October 2019",
    link: "https://data.ny.gov/Transportation/MTA-Bus-Automated-Camera-Enforcement-Violations-Be/kh8p-hcbm/about_data",
    main: true,
  },
  {
    name: "ACE/ABLE-Enforced Bus Routes",
    link: "https://data.ny.gov/Transportation/MTA-Bus-Automated-Camera-Enforced-Routes-Beginning/ki2b-sg5y/about_data",
  },
  {
    name: "MTA Bus Hourly Ridership: 2020-2024",
    link: "https://data.ny.gov/Transportation/MTA-Bus-Hourly-Ridership-2020-2024/kv7t-n8in/about_data",
  },
  {
    name: "MTA Bus Hourly Ridership: Beginning 2025",
    link: "https://data.ny.gov/Transportation/MTA-Bus-Hourly-Ridership-Beginning-2025/gxb3-akrn/about_data",
  },
  {
    name: "MTA Bus Speeds: 2020 - 2024",
    link: "https://data.ny.gov/Transportation/MTA-Bus-Speeds-2020-2024/6ksi-7cxr/about_data",
  },
  {
    name: "MTA Bus Speeds: Beginning 2025",
    link: "https://data.ny.gov/Transportation/MTA-Bus-Speeds-Beginning-2025/4u4b-jge6/about_data",
  },
  {
    name: "2020 Neighborhood Tabulation Areas (NTAs)",
    link: "https://www.nyc.gov/content/planning/pages/resources/datasets/neighborhood-tabulation",
  },
];
