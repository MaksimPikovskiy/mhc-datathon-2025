import "./App.css";

import Navbar from "./components/navbar";
import { useCallback, useEffect, useState } from "react";
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
import { getRouteDataLocal } from "./local-api/getBusRoutesLocal";
import { getSpeedDataLocal } from "./local-api/getBusSpeedsLocal";
import { getRidershipDataLocal } from "./local-api/getBusRidershipsLocal";
import { getViolationCountDataLocal } from "./local-api/getBusViolationCountLocal";
import neighborhoodPolygons from "./data/neighborhoods.json";
import type { FeatureCollection } from "geojson";
import type Neighborhood from "./models/Neighborhood";
import { getNeighborhoodsLocal } from "./local-api/getNeighborhoodsLocal";
import type NeighborhoodRisk from "./models/NeighborhoodRisk";
import NeighborhoodSection from "./components/sections/neighboorhoodSection";
import {
  defaultFactorsEnabled,
  defaultWeights,
  sections,
  violationCountQuery,
} from "./lib/constants";
import BusRouteSection from "./components/sections/busRouteSection";
import OurDataSection from "./components/sections/ourDataSection";
import DatasetsSection from "./components/sections/datasetsSection";
import HeroSection from "./components/sections/heroSection";
import IntroSection from "./components/sections/introSection";
import RiskFormulaSection from "./components/sections/riskFormulaSection";
import ResultsInterlude from "./components/sections/resultsInterlude";
import ConclusionSection from "./components/sections/conclusionSection";
import AppendixSection from "./components/sections/appendixSection";

function App() {
  const [useLocal, setUseLocal] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [unmodifiedBusAceRoutes, setUnmodifiedBusAceRoutes] = useState<
    BusRoute[]
  >([]);
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

  // Navigate via keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(prev + 1, sections.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll to section whenever currentIndex changes
  useEffect(() => {
    const sectionId = sections[currentIndex];
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Scroll so the section top is at the top of viewport, minus 75px margin
    const top = section.offsetTop - 75;
    window.scrollTo({ top, behavior: "smooth" });
  }, [currentIndex]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const routes = useLocal
          ? await getRouteDataLocal()
          : await getRouteData({});

        routes.sort((a, b) => {
          // Regex to capture: letter prefix, number, optional suffix
          const regex = /^([A-Za-z]+)?(\d+)(.*)?$/;

          const matchA = a.route.match(regex);
          const matchB = b.route.match(regex);

          if (!matchA || !matchB) return 0;

          const [, prefixA = "", numA, suffixA = ""] = matchA;
          const [, prefixB = "", numB, suffixB = ""] = matchB;

          // 1. Compare letter prefixes
          const prefixDiff = prefixA.localeCompare(prefixB);
          if (prefixDiff !== 0) return prefixDiff;

          // 2. Compare numeric part
          const numDiff = Number(numA) - Number(numB);
          if (numDiff !== 0) return numDiff;

          // 3. Compare suffixes (put '+' last)
          if (suffixA && !suffixB) return 1;
          if (!suffixA && suffixB) return -1;

          return suffixA.localeCompare(suffixB);
        });

        setUnmodifiedBusAceRoutes(routes);

        const uniqueRoutes: BusRoute[] = Array.from(
          new Map(routes.map((r) => [r.route, r])).values()
        );

        uniqueRoutes.sort((a, b) => {
          // Regex to capture: letter prefix, number, optional suffix
          const regex = /^([A-Za-z]+)?(\d+)(.*)?$/;

          const matchA = a.route.match(regex);
          const matchB = b.route.match(regex);

          if (!matchA || !matchB) return 0;

          const [, prefixA = "", numA, suffixA = ""] = matchA;
          const [, prefixB = "", numB, suffixB = ""] = matchB;

          // 1. Compare letter prefixes
          const prefixDiff = prefixA.localeCompare(prefixB);
          if (prefixDiff !== 0) return prefixDiff;

          // 2. Compare numeric part
          const numDiff = Number(numA) - Number(numB);
          if (numDiff !== 0) return numDiff;

          // 3. Compare suffixes (put '+' last)
          if (suffixA && !suffixB) return 1;
          if (!suffixA && suffixB) return -1;

          return suffixA.localeCompare(suffixB);
        });

        setBusAceRoutes(uniqueRoutes);

        const inRouteList = uniqueRoutes
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

        speeds.sort((a, b) => {
          // Regex to capture: letter prefix, number, optional suffix
          const regex = /^([A-Za-z]+)?(\d+)(.*)?$/;

          const matchA = a.route_id.match(regex);
          const matchB = b.route_id.match(regex);

          if (!matchA || !matchB) return 0;

          const [, prefixA = "", numA, suffixA = ""] = matchA;
          const [, prefixB = "", numB, suffixB = ""] = matchB;

          // 1. Compare letter prefixes
          const prefixDiff = prefixA.localeCompare(prefixB);
          if (prefixDiff !== 0) return prefixDiff;

          // 2. Compare numeric part
          const numDiff = Number(numA) - Number(numB);
          if (numDiff !== 0) return numDiff;

          // 3. Compare suffixes (put '+' last)
          if (suffixA && !suffixB) return 1;
          if (!suffixA && suffixB) return -1;

          return suffixA.localeCompare(suffixB);
        });

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

        ridershipData.sort((a, b) => {
          // Regex to capture: letter prefix, number, optional suffix
          const regex = /^([A-Za-z]+)?(\d+)(.*)?$/;

          const matchA = a.bus_route.match(regex);
          const matchB = b.bus_route.match(regex);

          if (!matchA || !matchB) return 0;

          const [, prefixA = "", numA, suffixA = ""] = matchA;
          const [, prefixB = "", numB, suffixB = ""] = matchB;

          // 1. Compare letter prefixes
          const prefixDiff = prefixA.localeCompare(prefixB);
          if (prefixDiff !== 0) return prefixDiff;

          // 2. Compare numeric part
          const numDiff = Number(numA) - Number(numB);
          if (numDiff !== 0) return numDiff;

          // 3. Compare suffixes (put '+' last)
          if (suffixA && !suffixB) return 1;
          if (!suffixA && suffixB) return -1;

          return suffixA.localeCompare(suffixB);
        });

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
          data.sort((a, b) => {
            // Compare boroughs first
            const boroughDiff = a.borough_name.localeCompare(b.borough_name);
            if (boroughDiff !== 0) return boroughDiff;

            // If boroughs are the same, compare neighborhoods
            return a.neighborhood_name.localeCompare(b.neighborhood_name);
          });

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
      const vStop = entry.normalized_bus_stop_violations;
      const vLane = entry.normalized_bus_lane_violations;
      const vSpeed = entry.normalized_avg_speed;
      const vRidership = entry.normalized_avg_total_ridership;

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

      setNeighborhoodRisks(allNeighborhoods);
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
      <Navbar sections={sections} setCurrentIndex={setCurrentIndex} />
      <main className="mt-12 space-y-6">
        <HeroSection id="home" setCurrentIndex={setCurrentIndex} />
        <IntroSection
          id="intro"
          useLocal={useLocal}
          setUseLocal={setUseLocal}
        />
        <DatasetsSection id="datasets" />
        <OurDataSection
          id="our_data"
          busAceRoutes={unmodifiedBusAceRoutes}
          busViolationCounts={busViolationCounts}
          busSpeeds={busSpeeds}
          busRiderships={busRiderships}
          neighborhoods={neighborhoods}
        />
        <RiskFormulaSection id="risk_factors"/>
        <FactorsDisplay
          weights={weights}
          setWeights={setWeights}
          factorsEnabled={factorsEnabled}
          setFactorsEnabled={setFactorsEnabled}
        />
        <ResultsInterlude id="findings" />
        <BusRouteSection id="route_risk_score" busRouteRisks={busRouteRisks} />
        <NeighborhoodSection
          neighborhoodPolygons={neighborhoodPolygons as FeatureCollection}
          neighborhoods={neighborhoods}
          neighborhoodRisks={neighborhoodRisks}
        />
        <ConclusionSection id="conclusion"/>
        <AppendixSection id="appendix"/>
      </main>
    </>
  );
}

export default App;
