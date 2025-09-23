import "./App.css";

import Navbar from "./components/navbar";
import { useCallback, useEffect, useState } from "react";
import { DisplayTable } from "./components/displayTable";
import { DisplayBarChart } from "./components/displayBarChart";
import type { ChartConfig } from "./components/ui/chart";
import type BusRoute from "./models/BusRoute";
import type BusViolationCount from "./models/BusViolationCount";
import type BusSpeed from "./models/BusSpeed";
import type BusRidership from "./models/BusRidership";
// import type Neighborhood from "./models/Neighborhood";
import { getRouteData } from "./api/getBusRoutes";
import { getSpeedData } from "./api/getBusSpeeds";
import { getRidershipData } from "./api/getBusRiderships";
import { getViolationCountData } from "./api/getBusViolationCount";
import { FactorsDisplay } from "./components/displayFactors";
import type BusRouteRisk from "./models/busRouteRisk";
import { normalizeArray } from "./lib/utils";

const violationCountQuery = `SELECT 
    bus_route_id,
    COUNT(*) AS total_violations,
    SUM(CASE WHEN violation_type = 'MOBILE BUS STOP' THEN 1 ELSE 0 END) AS bus_stop_violations,
    SUM(CASE WHEN violation_type = 'MOBILE DOUBLE PARKED' THEN 1 ELSE 0 END) AS double_parked_violations,
    SUM(CASE WHEN violation_type = 'MOBILE BUS LANE' THEN 1 ELSE 0 END) AS bus_lane_violations
  GROUP BY bus_route_id`;

const chartConfigTotalViolations = {
  total_violations: {
    label: "Total Violations",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const chartConfigViolationsPerType = {
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

const chartConfigSpeeds = {
  average_speed: {
    label: "Average Speed",
    color: "#2563eb",
  },
};

const chartConfigRiderships = {
  total_riders: {
    label: "Ridership",
    color: "#2563eb",
  },
};

function App() {
  const [busAceRoutes, setBusAceRoutes] = useState<BusRoute[]>([]);
  const [busViolationCounts, setBusViolationCounts] = useState<
    BusViolationCount[]
  >([]);
  const [busSpeeds, setBusSpeeds] = useState<BusSpeed[]>([]);
  const [busRiderships, setBusRiderships] = useState<BusRidership[]>([]);
  // const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]); //TODO: Add Type

  const [normalizedViolations, setNormalizedViolations] = useState<
    (BusViolationCount & {
      normalized_total_violations: number;
      normalized_double_parked_violations: number;
      normalized_bus_lane_violations: number;
      normalized_bus_stop_violations: number;
    })[]
  >([]);
  const [normalizedSpeeds, setNormalizedSpeeds] = useState<
    (BusSpeed & { normalized: number })[]
  >([]);
  const [normalizedRidership, setNormalizedRidership] = useState<
    (BusRidership & { normalized: number })[]
  >([]);

  const [busRouteRisks, setBusRouteRisks] = useState<BusRouteRisk[]>([]);

  const [weights, setWeights] = useState({
    doubleParkedViolation: 0,
    busStopViolation: 0,
    busLaneViolation: 0,
    speed: 0,
    ridership: 0,
  });

  const [factorsEnabled, setFactorsEnabled] = useState({
    doubleParkedViolation: true,
    busStopViolation: true,
    busLaneViolation: true,
    speed: true,
    ridership: true,
  });

  useEffect(() => {
    getRouteData({}).then((data) => {
      setBusAceRoutes(data);

      const inRouteList = data.map((route) => `'${route.route}'`).join(", ");

      const speedQuery = `SELECT
          route_id,
          SUM(total_mileage) AS total_mileage,
          SUM(total_operating_time) AS total_operating_time,
          AVG(average_speed) AS average_speed
        WHERE route_id IN (${inRouteList})
        GROUP BY route_id`;

      const ridershipQuery = `SELECT
          bus_route,
          SUM(ridership) AS total_ridership,
          SUM(transfers) AS total_transfers
        WHERE ridership != 0 OR transfers != 0
        GROUP BY bus_route`;

      getSpeedData({ offset: 0, query: speedQuery }).then(setBusSpeeds);
      getRidershipData({ offset: 0, query: ridershipQuery }).then((data) => {
        // Filter the routes locally for Database Servers times us out
        const filtered = data.filter((row) =>
          busAceRoutes.some((r) => r.route === row.bus_route)
        );
        setBusRiderships(filtered);
      });
    });

    getViolationCountData({ offset: 0, query: violationCountQuery }).then(
      setBusViolationCounts
    );
  }, []);

  useEffect(() => {
    if (busViolationCounts.length) {
      const totalViolations = busViolationCounts.map((v) => v.total_violations);
      const doubleParkedViolations = busViolationCounts.map(
        (v) => v.double_parked_violations
      );
      const busLaneViolations = busViolationCounts.map(
        (v) => v.bus_lane_violations
      );
      const busStopViolations = busViolationCounts.map(
        (v) => v.bus_stop_violations
      );

      const normalizedTotalViolations = normalizeArray(totalViolations);
      const normalizedDoubleParkedViolations = normalizeArray(
        doubleParkedViolations
      );
      const normalizedBusLaneViolations = normalizeArray(busLaneViolations);
      const normalizedBusStopViolations = normalizeArray(busStopViolations);

      setNormalizedViolations(
        busViolationCounts.map((v, idx) => ({
          ...v,
          normalized_total_violations: normalizedTotalViolations[idx],
          normalized_double_parked_violations:
            normalizedDoubleParkedViolations[idx],
          normalized_bus_lane_violations: normalizedBusLaneViolations[idx],
          normalized_bus_stop_violations: normalizedBusStopViolations[idx],
        }))
      );
    }

    if (busSpeeds.length) {
      const avgSpeeds = busSpeeds.map((s) => s.average_speed);
      const normalized = normalizeArray(avgSpeeds);
      setNormalizedSpeeds(
        busSpeeds.map((s, idx) => ({ ...s, normalized: normalized[idx] }))
      );
    }

    if (busRiderships.length) {
      const ridershipValues = busRiderships.map((r) => r.total_ridership);
      const normalized = normalizeArray(ridershipValues);
      setNormalizedRidership(
        busRiderships.map((r, idx) => ({ ...r, normalized: normalized[idx] }))
      );
    }
  }, [busViolationCounts, busSpeeds, busRiderships]);

  const calculateRiskByRoute = useCallback(
    (routeId: string) => {
      const violation = busViolationCounts.find(
        (b) => b.bus_route_id === routeId
      );
      const speed = busSpeeds.find((b) => b.route_id === routeId);
      const ridership = busRiderships.find((b) => b.bus_route === routeId);

      const vDouble = normalizedViolations.find(
        (v) => v.bus_route_id === routeId
      )?.normalized_double_parked_violations;
      const vStop = normalizedViolations.find(
        (v) => v.bus_route_id === routeId
      )?.normalized_bus_stop_violations;
      const vLane = normalizedViolations.find(
        (v) => v.bus_route_id === routeId
      )?.normalized_bus_lane_violations;
      const vSpeed = normalizedSpeeds.find(
        (v) => v.route_id === routeId
      )?.normalized;
      const vRidership = normalizedRidership.find(
        (v) => v.bus_route === routeId
      )?.normalized;

      if (!violation || !speed || !ridership) return 0;
      if (!vDouble || !vStop || !vLane || !vSpeed || !vRidership) return 0;

      let score = 0;
      if (factorsEnabled.doubleParkedViolation)
        score += weights.doubleParkedViolation * vDouble;
      if (factorsEnabled.busStopViolation)
        score += weights.busStopViolation * vStop;
      if (factorsEnabled.busLaneViolation)
        score += weights.busLaneViolation * vLane;
      if (factorsEnabled.speed) score += weights.speed * vSpeed;
      if (factorsEnabled.ridership) score += weights.ridership * vRidership;

      return score;
    },
    [
      busRiderships,
      busSpeeds,
      busViolationCounts,
      normalizedRidership,
      normalizedSpeeds,
      normalizedViolations,
      factorsEnabled,
      weights,
    ]
  );

  useEffect(() => {
    if (
      normalizedViolations.length &&
      normalizedSpeeds.length &&
      normalizedRidership.length
    ) {
      const allRoutes: BusRouteRisk[] = busAceRoutes.map((route) => ({
        busRouteId: route.route,
        riskScore: 0,
      }));

      allRoutes.forEach((route) => {
        route.riskScore = calculateRiskByRoute(route.busRouteId);
      });

      setBusRouteRisks(allRoutes);
    }
  }, [
    busAceRoutes,
    normalizedViolations,
    normalizedSpeeds,
    normalizedRidership,
    calculateRiskByRoute,
  ]);

  return (
    <>
      <Navbar />
      <main className="mt-12 space-y-6">
        <DisplayTable<BusRoute>
          title="Bus Route with ACE or ABLE"
          data={busAceRoutes}
        />
        <DisplayTable<BusViolationCount>
          title="Bus Violations"
          data={busViolationCounts}
        />
        <DisplayTable<BusSpeed>
          title="Bus Speeds for ACE/ABLE Routes"
          data={busSpeeds}
        />
        <DisplayTable<BusRidership>
          title="Bus Riderships for ACE/ABLE Routes"
          data={busRiderships}
        />

        <DisplayBarChart
          title="Total Violations Per Bus Route"
          data={busViolationCounts}
          config={chartConfigTotalViolations}
          bars={[
            {
              dataKey: "total_violations",
              fill: "var(--color-total_violations)",
            },
          ]}
          showLegend={true}
        />
        <DisplayBarChart
          title="Violations of Each Type Per Bus Route"
          data={busViolationCounts}
          config={chartConfigViolationsPerType}
          bars={[
            {
              dataKey: "bus_stop_violations",
              fill: "var(--color-bus_stop_violations)",
            },
            {
              dataKey: "bus_lane_violations",
              fill: "var(--color-bus_lane_violations)",
            },
            {
              dataKey: "double_parked_violations",
              fill: "var(--color-double_parked_violations)",
            },
          ]}
          showLegend={true}
        />
        <DisplayBarChart
          title="Average Speed Per Bus Route"
          data={busSpeeds}
          config={chartConfigSpeeds}
          xKey="route_id"
          bars={[
            {
              dataKey: "average_speed",
              fill: "var(--color-average_speed)",
            },
          ]}
          showLegend={true}
        />
        <DisplayBarChart
          title="Ridership Per Bus Route"
          data={busRiderships}
          config={chartConfigRiderships}
          xKey="bus_route"
          bars={[
            {
              dataKey: "total_riders",
              fill: "var(--color-total_riders)",
            },
          ]}
          showLegend={true}
        />
        <FactorsDisplay
          weights={weights}
          setWeights={setWeights}
          factorsEnabled={factorsEnabled}
          setFactorsEnabled={setFactorsEnabled}
        />

        <DisplayTable<
          BusViolationCount & {
            normalized_total_violations: number;
            normalized_double_parked_violations: number;
            normalized_bus_lane_violations: number;
            normalized_bus_stop_violations: number;
          }
        >
          title="Normalized Bus Violations"
          data={normalizedViolations}
        />

        <DisplayTable<BusSpeed & { normalized: number }>
          title="Normalized Bus Speeds"
          data={normalizedSpeeds}
        />

        <DisplayTable<BusRidership & { normalized: number }>
          title="Normalized Bus Ridership"
          data={normalizedRidership}
        />

        <DisplayTable<BusRouteRisk>
          title="Risk for Bus Route"
          data={busRouteRisks}
        />
      </main>
    </>
  );
}

export default App;
