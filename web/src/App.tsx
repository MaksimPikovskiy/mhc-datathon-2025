import "./App.css";

import Navbar from "./components/navbar";
import { useCallback, useEffect, useState } from "react";
import { DisplayTable } from "./components/displayTable";
import { DisplayBarChart } from "./components/displayBarChart";
import type BusRoute from "./models/BusRoute";
import type BusViolationCount from "./models/BusViolationCount";
import type BusSpeed from "./models/BusSpeed";
import type BusRidership from "./models/BusRidership";
import { getRouteData } from "./api/getBusRoutes";
import { getSpeedData } from "./api/getBusSpeeds";
import { getRidershipData } from "./api/getBusRiderships";
import { getViolationCountData } from "./api/getBusViolationCount";
import { FactorsDisplay } from "./components/displayFactors";
import type BusRouteRisk from "./models/busRouteRisk";
import { normalizeArray } from "./lib/utils";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import { getRouteDataLocal } from "./local-api/getBusRoutesLocal";
import { getSpeedDataLocal } from "./local-api/getBusSpeedsLocal";
import { getRidershipDataLocal } from "./local-api/getBusRidershipsLocal";
import { getViolationCountDataLocal } from "./local-api/getBusViolationCountLocal";
import neighborhoodPolygons from "./data/neighborhoods.json";
import type { FeatureCollection } from "geojson";
import type Neighborhood from "./models/Neighborhood";
import { getNeighborhoodsLocal } from "./local-api/getNeighborhoodsLocal";
import type NeighborhoodRisk from "./models/NeighborhoodRisk";
import NeighborhoodSection from "./components/neighboorhoodSection";
import {
  chartConfigRiderships,
  chartConfigRiskScores,
  chartConfigSpeeds,
  chartConfigTotalViolations,
  chartConfigViolationsPerType,
  defaultFactorsEnabled,
  defaultWeights,
  violationCountQuery,
} from "./lib/constants";

function App() {
  const [useLocal, setUseLocal] = useState<boolean>(true);

  const [busAceRoutes, setBusAceRoutes] = useState<BusRoute[]>([]);
  const [busViolationCounts, setBusViolationCounts] = useState<
    BusViolationCount[]
  >([]);
  const [busSpeeds, setBusSpeeds] = useState<BusSpeed[]>([]);
  const [busRiderships, setBusRiderships] = useState<BusRidership[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

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

  const [normalizedNeighborhoods, setNormalizedNeighborhoods] = useState<
    (Neighborhood & {
      normalized_total_violations: number;
      normalized_bus_stop_violations: number;
      normalized_double_parked_violations: number;
      normalized_bus_lane_violations: number;
      normalized_avg_speed: number;
      normalized_avg_total_ridership: number;
    })[]
  >([]);

  const [busRouteRisks, setBusRouteRisks] = useState<BusRouteRisk[]>([]);
  const [neighborhoodRisks, setNeighborhoodRisks] = useState<
    NeighborhoodRisk[]
  >([]);

  const [weights, setWeights] = useState(defaultWeights);

  const [factorsEnabled, setFactorsEnabled] = useState(defaultFactorsEnabled);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const routes = useLocal
          ? await getRouteDataLocal()
          : await getRouteData({});

        setBusAceRoutes(routes);

        const inRouteList = routes
          .map((route) => `'${route.route}'`)
          .join(", ");

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

        const speeds = useLocal
          ? await getSpeedDataLocal()
          : await getSpeedData({ offset: 0, query: speedQuery });

        if (useLocal) {
          // Filter locally to match ACE/ABLE routes
          const filteredSpeeds = speeds.filter((row) =>
            routes.some((r) => r.route === row.route_id)
          );
          setBusSpeeds(filteredSpeeds);
        } else {
          setBusSpeeds(speeds);
        }

        const ridershipData = useLocal
          ? await getRidershipDataLocal()
          : await getRidershipData({ offset: 0, query: ridershipQuery });

        // Filter locally to match ACE/ABLE routes
        const filteredRidership = ridershipData.filter((row) =>
          routes.some((r) => r.route === row.bus_route)
        );
        setBusRiderships(filteredRidership);

        const violations = useLocal
          ? await getViolationCountDataLocal()
          : await getViolationCountData({
              offset: 0,
              query: violationCountQuery,
            });
        setBusViolationCounts(violations);

        getNeighborhoodsLocal().then((data) => {
          setNeighborhoods(data);

          if (data.length) {
            const totalViolations = data.map((v) => v.total_violations);
            const doubleParkedViolations = data.map(
              (v) => v.double_parked_violations
            );
            const busLaneViolations = data.map((v) => v.bus_lane_violations);
            const busStopViolations = data.map((v) => v.bus_stop_violations);
            const busAvgSpeeds = data.map((v) => v.avg_speed);
            const busAvgRiderships = data.map((v) => v.avg_total_ridership);

            const normalizedTotalViolations = normalizeArray(totalViolations);
            const normalizedDoubleParkedViolations = normalizeArray(
              doubleParkedViolations
            );
            const normalizedBusLaneViolations =
              normalizeArray(busLaneViolations);
            const normalizedBusStopViolations =
              normalizeArray(busStopViolations);
            const normalizedBusAvgSpeeds = normalizeArray(busAvgSpeeds);
            const normalizedBusAvgRiderships = normalizeArray(busAvgRiderships);

            setNormalizedNeighborhoods(
              data.map((v, idx) => ({
                ...v,
                normalized_total_violations: normalizedTotalViolations[idx],
                normalized_double_parked_violations:
                  normalizedDoubleParkedViolations[idx],
                normalized_bus_lane_violations:
                  normalizedBusLaneViolations[idx],
                normalized_bus_stop_violations:
                  normalizedBusStopViolations[idx],
                normalized_avg_speed: normalizedBusAvgSpeeds[idx],
                normalized_avg_total_ridership: normalizedBusAvgRiderships[idx],
              }))
            );
          }
        });
      } catch (error) {
        console.error("Error fetching bus data:", error);
      }
    };

    fetchData();
  }, [useLocal]);

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
      const ridershipValues = busRiderships.map((r) => r.total_riders);
      const normalized = normalizeArray(ridershipValues);
      setNormalizedRidership(
        busRiderships.map((r, idx) => ({ ...r, normalized: normalized[idx] }))
      );
    }
  }, [busViolationCounts, busSpeeds, busRiderships]);

  useEffect(() => {
    const calculateRiskByNeighborhood = (name: string) => {
      const entry = normalizedNeighborhoods.find(
        (n) => n.neighborhood_name === name
      );

      if (!entry) return 0;

      const vDouble = entry.normalized_double_parked_violations;
      const vStop = entry.bus_stop_violations;
      const vLane = entry.bus_lane_violations;
      const vSpeed = entry.avg_speed;
      const vRidership = entry.avg_total_ridership;

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
    };
    if (normalizedNeighborhoods.length) {
      const allNeighborhoods: NeighborhoodRisk[] = [];

      normalizedNeighborhoods.forEach((neighborhood) => {
        const newNeighborhoodRisk: NeighborhoodRisk = {
          neighborhoodName: "",
          riskScore: 0,
        };

        newNeighborhoodRisk.neighborhoodName = neighborhood.neighborhood_name;
        newNeighborhoodRisk.riskScore = calculateRiskByNeighborhood(
          neighborhood.neighborhood_name
        );

        allNeighborhoods.push(newNeighborhoodRisk);
      });

      const allRiskScores = allNeighborhoods.map((s) => s.riskScore);
      const normalizedRiskScores = normalizeArray(allRiskScores);

      const normalizedAllNeighborhoods = allNeighborhoods.map((s, idx) => ({
        ...s,
        riskScore: normalizedRiskScores[idx],
      }));

      setNeighborhoodRisks(normalizedAllNeighborhoods);
    }
  }, [normalizedNeighborhoods, factorsEnabled, weights]);

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

      const allRiskScores = allRoutes.map((s) => s.riskScore);
      const normalizedRiskScores = normalizeArray(allRiskScores);

      const normalizedAllRoutes = allRoutes.map((s, idx) => ({
        ...s,
        riskScore: normalizedRiskScores[idx],
      }));

      setBusRouteRisks(normalizedAllRoutes);
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
        <div
          className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm hover:scale-101 cursor-pointer"
          onClick={() => setUseLocal(!useLocal)}
        >
          <div className="space-y-0.5">
            <Label>Fetching Data Method</Label>
            <p className="text-sm">
              {useLocal
                ? "Using Local Data Available to the Website"
                : "Fetching Data from data.ny.gov"}
            </p>
          </div>
          <div>
            <Switch
              checked={useLocal}
              onCheckedChange={setUseLocal}
              aria-readonly
            />
          </div>
        </div>
        <DisplayTable<BusRoute>
          // title="Bus Route with ACE or ABLE"
          data={busAceRoutes}
        />
        <DisplayTable<BusViolationCount>
          // title="Bus Violations"
          data={busViolationCounts}
        />
        <DisplayTable<BusSpeed>
          // title="Bus Speeds for ACE/ABLE Routes"
          data={busSpeeds}
        />
        <DisplayTable<BusRidership>
          // title="Bus Riderships for ACE/ABLE Routes"
          data={busRiderships}
        />

        <DisplayBarChart
          // title="Total Violations Per Bus Route"
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
          // title="Violations of Each Type Per Bus Route"
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
          // title="Average Speed Per Bus Route"
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
          // title="Ridership Per Bus Route"
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
          // title="Normalized Bus Violations"
          data={normalizedViolations}
        />

        <DisplayTable<BusSpeed & { normalized: number }>
          // title="Normalized Bus Speeds"
          data={normalizedSpeeds}
        />

        <DisplayTable<BusRidership & { normalized: number }>
          // title="Normalized Bus Ridership"
          data={normalizedRidership}
        />

        <DisplayTable<BusRouteRisk>
          // title="Risk Score for Bus Routes"
          data={busRouteRisks}
        />
        <DisplayBarChart
          // title="Risk Score for Bus Routes"
          data={busRouteRisks}
          config={chartConfigRiskScores}
          xKey="busRouteId"
          bars={[
            {
              dataKey: "riskScore",
              fill: "var(--color-riskScore)",
            },
          ]}
          showLegend={true}
        />
        <h2 className="font-bold  text-xl mb-2">
          Mapping Risk by Neighborhoods
        </h2>
        <DisplayTable<
          Neighborhood & {
            normalized_total_violations: number;
            normalized_bus_stop_violations: number;
            normalized_double_parked_violations: number;
            normalized_bus_lane_violations: number;
            normalized_avg_speed: number;
            normalized_avg_total_ridership: number;
          }
        >
          // title="Normalized Statistics for Neighborhoods"
          data={normalizedNeighborhoods}
        />
        <NeighborhoodSection
          neighborhoodPolygons={neighborhoodPolygons as FeatureCollection}
          neighborhoods={neighborhoods}
          neighborhoodRisks={neighborhoodRisks}
        />
      </main>
    </>
  );
}

export default App;
