import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { DisplayTable } from "./displayTable";
import {
  chartConfigRiderships,
  chartConfigSpeeds,
  chartConfigTotalViolations,
  chartConfigViolationsPerType,
} from "@/lib/constants";
import { DisplayBarChart } from "./displayBarChart";
import type BusViolationCount from "@/models/BusViolationCount";
import type BusSpeed from "@/models/BusSpeed";
import type BusRidership from "@/models/BusRidership";
import type Neighborhood from "@/models/Neighborhood";
import type BusRoute from "@/models/BusRoute";

type OurDataSectionProps = {
  busAceRoutes: BusRoute[];
  busViolationCounts: BusViolationCount[];
  busSpeeds: BusSpeed[];
  busRiderships: BusRidership[];
  neighborhoods: Neighborhood[];
};

export default function OurDataSection({
  busAceRoutes,
  busViolationCounts,
  busSpeeds,
  busRiderships,
  neighborhoods,
}: OurDataSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("violations");
  const [showChart, setShowChart] = useState<boolean>(true);
  const [showTotal, setShowTotal] = useState<boolean>(true);

  // Group routes by name and track programs
  const routePrograms = busAceRoutes.reduce((acc, r) => {
    const routeName = r.route;
    if (!acc[routeName]) acc[routeName] = new Set<string>();
    acc[routeName].add(r.program.toUpperCase());
    return acc;
  }, {} as Record<string, Set<string>>);

  // Determine badge color based on program(s)
  const getBadgeColor = (programs: Set<string>) => {
    const hasACE = programs.has("ACE");
    const hasABLE = programs.has("ABLE");

    if (hasACE && hasABLE) return "bg-purple-500";
    if (hasACE) return "bg-blue-500";
    if (hasABLE) return "bg-green-500";
    return "bg-gray-400";
  };

  return (
    <div>
      <h2 className="font-bold  text-xl mb-1">ACE/ABLE Enforced Bus Routes</h2>
      <div className="mb-2 flex flex-row justify-center w-full gap-4">
        <span
          key={"ACE"}
          className={`bg-blue-500 text-white px-3 py-1 rounded-full font-semibold`}
        >
          {"ACE Route"}
        </span>
        <span
          key={"ABLE"}
          className={`bg-green-500 text-white px-3 py-1 rounded-full font-semibold`}
        >
          {"ABLE Route"}
        </span>
        <span
          key={"ABLE->ACE"}
          className={`bg-purple-500 text-white px-3 py-1 rounded-full font-semibold`}
        >
          {"ABLE→ACE Route"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2 rounded border p-2">
        {Object.entries(routePrograms).map(([routeName, programs]) => (
          <span
            key={routeName}
            className={`${getBadgeColor(
              programs
            )} text-white px-3 py-1 rounded-full font-semibold`}
          >
            {routeName}
          </span>
        ))}
      </div>
      <h2 className="font-bold  text-xl mb-1">Our Data at a Glance</h2>
      <Tabs
        defaultValue="violations"
        className={`h-[600px] w-full`}
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex flex-row justify-between">
          <TabsList>
            <TabsTrigger value="violations">ACE Violations</TabsTrigger>
            <TabsTrigger value="speeds">Bus Speeds</TabsTrigger>
            <TabsTrigger value="riderships">Bus Total Riderships</TabsTrigger>
            <TabsTrigger value="neighborhoods">NYC Neigborhoods</TabsTrigger>
          </TabsList>
          {activeTab != "neighborhoods" && (
            <div className="flex flex-row gap-12">
              {activeTab === "violations" && (
                <div className="flex flex-row gap-2 items-center">
                  <Label>
                    Showing{" "}
                    {showTotal ? "Combined Data" : "Data Split by Types"}
                  </Label>
                  <Switch checked={showTotal} onCheckedChange={setShowTotal} />
                </div>
              )}
              <div className="flex flex-row gap-2 items-center">
                <Label>Showing Data as {showChart ? "Chart" : "Table"}</Label>
                <Switch checked={showChart} onCheckedChange={setShowChart} />
              </div>
            </div>
          )}
        </div>
        <TabsContent value="violations">
          {showChart ? (
            showTotal ? (
              <DisplayBarChart
                data={busViolationCounts}
                config={chartConfigTotalViolations}
                bars={[
                  {
                    dataKey: "total_violations",
                    fill: "var(--color-total_violations)",
                  },
                ]}
                showLegend={false}
                xLabel="Bus Route"
                xOffset={-30}
                yLabel="Total Violations"
                yOffset={5}
              />
            ) : (
              <DisplayBarChart
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
                xLabel="Bus Route"
                xOffset={-30}
                yLabel="Total Violations"
                yOffset={5}
              />
            )
          ) : (
            <DisplayTable<BusViolationCount> data={busViolationCounts} />
          )}
        </TabsContent>
        <TabsContent value="speeds">
          {showChart ? (
            <DisplayBarChart
              data={busSpeeds}
              config={chartConfigSpeeds}
              xKey="route_id"
              bars={[
                {
                  dataKey: "average_speed",
                  fill: "var(--color-average_speed)",
                },
              ]}
              showLegend={false}
              xLabel="Bus Route"
              xOffset={-30}
              yLabel="Average Speed (mph)"
            />
          ) : (
            <DisplayTable<BusSpeed> data={busSpeeds} />
          )}
        </TabsContent>
        <TabsContent value="riderships">
          {showChart ? (
            <DisplayBarChart
              data={busRiderships}
              config={chartConfigRiderships}
              xKey="bus_route"
              bars={[
                {
                  dataKey: "total_riders",
                  fill: "var(--color-total_riders)",
                },
              ]}
              showLegend={false}
              xLabel="Bus Route"
              xOffset={-30}
              yLabel="Total Ridership"
              yOffset={5}
            />
          ) : (
            <DisplayTable<BusRidership> data={busRiderships} />
          )}
        </TabsContent>
        <TabsContent value="neighborhoods">
          <DisplayTable<Neighborhood> data={neighborhoods} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
