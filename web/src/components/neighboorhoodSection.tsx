import type { FeatureCollection } from "geojson";
import type Neighborhood from "@/models/Neighborhood";
import type NeighborhoodRisk from "@/models/NeighborhoodRisk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import MapWithPolygons from "./mapWithPolygons";
import { normalizeName } from "@/lib/utils";
import { DisplayTable } from "./displayTable";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { DisplayBarChart } from "./displayBarChart";
import { chartConfigRiskScores } from "@/lib/constants";

type NeighborhoodSectionProps = {
  neighborhoodPolygons: FeatureCollection;
  neighborhoods: Neighborhood[];
  neighborhoodRisks: NeighborhoodRisk[];
};

export default function NeighborhoodSection({
  neighborhoodPolygons,
  neighborhoods,
  neighborhoodRisks,
}: NeighborhoodSectionProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const enrichedData = {
    ...neighborhoodPolygons,
    features: neighborhoodPolygons.features.map((f) => {
      const name = normalizeName(f.properties!.NTAName);
      const risk = neighborhoodRisks.find(
        (r) => normalizeName(r.neighborhoodName) === name
      );
      const infoRecord = neighborhoods.find(
        (n) => normalizeName(n.neighborhood_name) === name
      );

      return {
        ...f,
        properties: {
          ...f.properties,
          riskScore: Number(risk?.riskScore ?? 0).toFixed(4),
          ridership: Number(infoRecord?.avg_total_ridership ?? 0).toFixed(0),
          speed: Number(infoRecord?.avg_speed ?? 0).toFixed(2),
          busRoutes:
            infoRecord?.bus_route_ids
              // eslint-disable-next-line no-useless-escape
              ?.replace(/[\[\]']/g, "")
              .replace(/\bABLE\b,?\s*/g, "")
              .trim() ?? "None",
          totalViolations: Number(infoRecord?.total_violations ?? 0).toFixed(0),
          doubleParked: Number(
            infoRecord?.double_parked_violations ?? 0
          ).toFixed(0),
          busStop: Number(infoRecord?.bus_stop_violations ?? 0).toFixed(0),
          busLane: Number(infoRecord?.bus_lane_violations ?? 0).toFixed(0),
        },
      };
    }),
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h2 className="font-bold  text-xl mb-1">
        Mapping Risk for Neighborhoods
      </h2>
      <Tabs defaultValue="map" className="h-[600px] w-full">
        <TabsList>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="bar-chart">Bar Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          {!loading ? (
            <MapWithPolygons
              data={enrichedData as FeatureCollection}
              info={neighborhoods}
              riskScores={neighborhoodRisks}
            />
          ) : (
            <div className="flex flex-row items-center justify-center w-full h-full gap-2 font-md">
              <LoaderCircle className="w-8 h-8 animate-spin" /> Loading...
            </div>
          )}
        </TabsContent>
        <TabsContent value="table">
          <DisplayTable<NeighborhoodRisk> data={neighborhoodRisks} />
        </TabsContent>
        <TabsContent value="bar-chart">
          <DisplayBarChart
            data={neighborhoodRisks}
            config={chartConfigRiskScores}
            xKey="neighborhoodName"
            bars={[
              {
                dataKey: "riskScore",
                fill: "var(--color-riskScore)",
              },
            ]}
            showLegend={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
