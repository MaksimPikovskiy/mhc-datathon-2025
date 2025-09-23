import "./App.css";

import Navbar from "./components/navbar";
import { useEffect, useState } from "react";
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

  const [weights, setWeights] = useState({
    doubleParkedViolation: 0,
    busStopViolation: 0,
    busLaneViolation: 0,
    speed: 0,
    ridership: 0,
    neighborhood: 0,
  });

  const [factorsEnabled, setFactorsEnabled] = useState({
    doubleParkedViolation: true,
    busStopViolation: true,
    busLaneViolation: true,
    speed: true,
    ridership: true,
    neighborhood: true,
  });

  // const calculateRisk = (routeId: string) => {
  //   const violation = busViolationCounts.find(
  //     (b) => b.bus_route_id === routeId
  //   );
  //   const speed = busSpeeds.find((b) => b.route_id === routeId);
  //   const ridership = busRiderships.find((b) => b.bus_route === routeId);
  //   // const neighborhood = 0; //TODO: get neighboorhood based on id? idk

  //   // TODO: Get normalized values
  //   const vDouble = 0;
  //   const vStop = 0;
  //   const vLane = 0;
  //   const vSpeed = 0;
  //   const vRidership = 0;
  //   const vNeighborhood = 0;

  //   if (!violation || !speed || !ridership) return 0;

  //   let score = 0;
  //   if (factorsEnabled.doubleParkedViolation)
  //     score += weights.doubleParkedViolation * vDouble;
  //   if (factorsEnabled.busStopViolation)
  //     score += weights.busStopViolation * vStop;
  //   if (factorsEnabled.busLaneViolation)
  //     score += weights.busLaneViolation * vLane;
  //   if (factorsEnabled.speed) score += weights.speed * vSpeed;
  //   if (factorsEnabled.ridership) score += weights.ridership * vRidership;
  //   if (factorsEnabled.neighborhood)
  //     score += weights.neighborhood * vNeighborhood;

  //   return score;
  // };

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
        WHERE (ridership != 0 OR transfers != 0)
          AND bus_route IN (${inRouteList})
        GROUP BY bus_route`;

      getSpeedData({ offset: 0, query: speedQuery }).then(setBusSpeeds);
      getRidershipData({ offset: 0, query: ridershipQuery }).then(
        setBusRiderships
      );
    });

    getViolationCountData({ offset: 0, query: violationCountQuery }).then(
      setBusViolationCounts
    );
  }, []);

  useEffect(() => {}, [busViolationCounts, busSpeeds, busRiderships]);

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
      </main>
    </>
  );
}

export default App;
