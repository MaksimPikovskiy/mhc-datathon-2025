import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { DisplayTable } from "./displayTable";
import type BusRouteRisk from "@/models/busRouteRisk";
import { chartConfigRiskScores } from "@/lib/constants";
import { DisplayBarChart } from "./displayBarChart";

type BusRouteSectionProps = {
  id?: string;
  busRouteRisks: BusRouteRisk[];
};

export default function BusRouteSection({
  id = "",
  busRouteRisks,
}: BusRouteSectionProps) {
  const [sortData, setSortData] = useState<boolean>(true);

  const sortedBusRouteRisks = [...busRouteRisks].sort(
    (a, b) => b.riskScore - a.riskScore
  );

  const getData = () => {
    return sortData ? sortedBusRouteRisks : busRouteRisks;
  };

  return (
    <div id={id}>
      <h2 className="font-bold  text-xl mb-1">Risk Score for Bus Routes</h2>
      <Tabs defaultValue="bar-chart" className={`md:h-[600px] w-full`}>
        <div className="flex flex-row justify-between">
          <TabsList className="bg-[var(--color-royal-light)]/25">
            <TabsTrigger value="bar-chart">Bar Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <div className="flex flex-row gap-2 items-center">
            <Label>Sort Data by Risk Score</Label>
            <Switch
              checked={sortData}
              onCheckedChange={setSortData}
              className="cursor-pointer data-[state=checked]:bg-[var(--color-royal)] data-[state=unchecked]:bg-[var(--color-royal-light)]"
            />
          </div>
        </div>
        <TabsContent value="table">
          <DisplayTable<BusRouteRisk> data={getData()} />
        </TabsContent>
        <TabsContent value="bar-chart">
          <DisplayBarChart
            data={getData()}
            config={chartConfigRiskScores}
            xKey="busRouteId"
            bars={[
              {
                dataKey: "riskScore",
                fill: "var(--color-riskScore)",
              },
            ]}
            showLegend={false}
            xLabel="Bus Route"
            xOffset={-30}
            yLabel="Risk Score"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
