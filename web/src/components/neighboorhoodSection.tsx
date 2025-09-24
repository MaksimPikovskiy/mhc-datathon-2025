import type { FeatureCollection } from "geojson";
import type Neighborhood from "@/models/Neighborhood";
import type NeighborhoodRisk from "@/models/NeighborhoodRisk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import MapWithPolygons from "./mapWithPolygons";
import { normalizeName } from "@/lib/utils";
import { DisplayTable } from "./displayTable";
import { useEffect, useState } from "react";
import { InfoIcon, LoaderCircle } from "lucide-react";
import { chartConfigRiskScores } from "@/lib/constants";
import { DisplayBarChart } from "./displayBarChart";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type NeighborhoodSectionProps = {
  id?: string;
  neighborhoodPolygons: FeatureCollection;
  neighborhoods: Neighborhood[];
  neighborhoodRisks: NeighborhoodRisk[];
};

export default function NeighborhoodSection({
  id = "",
  neighborhoodPolygons,
  neighborhoods,
  neighborhoodRisks,
}: NeighborhoodSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("map");
  const [loading, setLoading] = useState<boolean>(true);
  const [sortData, setSortData] = useState<boolean>(false);
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

  const sortedNeighborhoodRisks = [...neighborhoodRisks].sort(
    (a, b) => b.riskScore - a.riskScore
  );

  const getData = () => {
    return sortData ? sortedNeighborhoodRisks : neighborhoodRisks;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  };

  return (
    <div id={id}>
      <h2 className="font-bold  text-xl mb-1">
        Mapping Risk for Neighborhoods
      </h2>
      <Tabs
        defaultValue="map"
        className="h-[600px] w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <TabsList>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="bar-chart">Bar Chart</TabsTrigger>
          </TabsList>
          <div className="flex flex-row gap-12">
            {activeTab === "map" && (
              <div className="flex flex-row gap-2 items-center">
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="w-6 h-6" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[150px]">
                    <p className="text-center">It is necessary to rerender the map when adjusting weights or enabling/disabling risk factors</p>
                  </TooltipContent>
                </Tooltip>
                <Button onClick={handleClick} className="cursor-pointer">
                  Rerender Map
                </Button>
              </div>
            )}
            <div className="flex flex-row gap-2 items-center">
              <Label>Sort Data by Risk Score</Label>
              <Switch checked={sortData} onCheckedChange={setSortData} />
            </div>
          </div>
        </div>
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
          <DisplayTable<NeighborhoodRisk> data={getData()} />
        </TabsContent>
        <TabsContent value="bar-chart">
          <DisplayBarChart
            data={getData()}
            config={chartConfigRiskScores}
            xKey="neighborhoodName"
            bars={[
              {
                dataKey: "riskScore",
                fill: "var(--color-riskScore)",
              },
            ]}
            showLegend={false}
            showXLabels={false}
            xLabel="Neighborhood"
            yLabel="Risk Score"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
