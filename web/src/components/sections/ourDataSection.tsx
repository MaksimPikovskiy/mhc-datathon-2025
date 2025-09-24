import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { DisplayTable } from "../displayTable";
import {
  chartConfigRiderships,
  chartConfigSpeeds,
  chartConfigTotalViolations,
  chartConfigViolationsPerType,
} from "@/lib/constants";
import { DisplayBarChart } from "../displayBarChart";
import type BusViolationCount from "@/models/BusViolationCount";
import type BusSpeed from "@/models/BusSpeed";
import type BusRidership from "@/models/BusRidership";
import type Neighborhood from "@/models/Neighborhood";
import type BusRoute from "@/models/BusRoute";
import { scrollToSection } from "@/lib/utils";

type OurDataSectionProps = {
  id?: string;
  busAceRoutes: BusRoute[];
  busViolationCounts: BusViolationCount[];
  busSpeeds: BusSpeed[];
  busRiderships: BusRidership[];
  neighborhoods: Neighborhood[];
};

export default function OurDataSection({
  id = "",
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

    if (hasACE && hasABLE) return "bg-[var(--color-royal)]";
    if (hasACE) return "bg-[var(--color-royal-light)]";
    if (hasABLE) return "bg-[var(--color-royal-super-dark)]";
    return "bg-gray-400";
  };

  return (
    <section id={id} className="space-y-3 pt-12">
      <h2 className="font-bold text-xl">ACE/ABLE Enforced Bus Routes</h2>
      <div className="mb-2 flex flex-row justify-center w-full gap-4">
        <span
          key={"ACE"}
          className={`bg-[var(--color-royal-light)] text-white px-3 py-1 rounded-full font-semibold`}
        >
          {"ACE Route"}
        </span>
        <span
          key={"ABLE"}
          className={`bg-[var(--color-royal-super-dark)] text-white px-3 py-1 rounded-full font-semibold`}
        >
          {"ABLE Route"}
        </span>
        <span
          key={"ABLE->ACE"}
          className={`bg-[var(--color-royal)] text-white px-3 py-1 rounded-full font-semibold`}
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
      <div className="pt-12 space-y-3 container mx-auto px-4">
        <h2 className="text-2xl font-bold">
          From Raw Data to Processed Insights
        </h2>
        <p>
          After gathering enforcement, speed, and ridership datasets, we ran
          SoQL queries and Python scripts to combine and clean the data. This
          produced our set of datasets (seen in{' "'}
          <button
            onClick={() => scrollToSection("processed_data")}
            className="cursor-pointer underline hover:text-primary/50"
          >
            Our Data at a Glance
          </button>
          {'" '}
          below), which powers the analysis.
        </p>
        <p className="text-sm">
          Appendix: Full Python scripts too large to display here are linked{" "}
          <button
            onClick={() => scrollToSection("appendix")}
            className="cursor-pointer underline hover:text-primary/50"
          >
            here
          </button>
          .
        </p>
        <h3 className="font-semibold text-md">
          SoQL Query to get ACE Violations per Bus Route between 2020 and 2025
          <button
            onClick={() => scrollToSection("main_soql_note")}
            className="hover:underline hover:text-primary/50 cursor-pointer"
          >
            *
          </button>
        </h3>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`SELECT
  bus_route_id,
  COUNT(*) AS total_violations,
  SUM(CASE WHEN violation_type = 'MOBILE BUS STOP' THEN 1 ELSE 0 END) AS bus_stop_violations,
  SUM(CASE WHEN violation_type = 'MOBILE DOUBLE PARKED' THEN 1 ELSE 0 END) AS double_parked_violations,
  SUM(CASE WHEN violation_type = 'MOBILE BUS LANE' THEN 1 ELSE 0 END) AS bus_lane_violations
WHERE first_occurrence > '2019-12-31T23:59:59'
GROUP BY bus_route_id`}
            </code>
          </pre>
        </div>
        <h3 className="font-semibold text-md">
          SoQL Query to get Bus Speeds for ACE/ABLE Enforced Routes
        </h3>
        <p className="text-sm mb-2 italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            inRouteList
          </span>{" "}
          is a variable containing the set of ACE/ABLE Enforced Bus Routes we
          mentioned earlier.
        </p>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`SELECT
  route_id,
  SUM(total_mileage) AS total_mileage,
  SUM(total_operating_time) AS total_operating_time,
  AVG(average_speed) AS average_speed
WHERE route_id IN (\${inRouteList})
GROUP BY route_id`}
            </code>
          </pre>
        </div>
        <h3 className="font-semibold text-md">
          SoQL Query to get Bus Total Ridership for ACE/ABLE Enforced Routes
        </h3>
        <p className="text-sm italic">
          <span className="bg-gray-100 rounded py-0.5 px-2 text-gray-500">
            inRouteList
          </span>{" "}
          is a variable containing the set of ACE/ABLE Enforced Bus Routes we
          mentioned earlier.
        </p>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
          <pre className="text-gray-500 font-mono text-sm text-start overflow-auto">
            <code>
              {`SELECT
  route_id,
  SUM(total_mileage) AS total_mileage,
  SUM(total_operating_time) AS total_operating_time,
  AVG(average_speed) AS average_speed
WHERE route_id IN (\${inRouteList})
GROUP BY route_id`}
            </code>
          </pre>
        </div>
        <span id="main_soql_note" className="italic text-sm">
          *We limited main dataset to 2020-2025 due to Ridership and Speeds
          being in that range.
        </span>
      </div>
      <h2 id="processed_data" className="font-bold  text-xl mb-1 pt-12">
        Our Data at a Glance
      </h2>
      <Tabs
        defaultValue="violations"
        className={`md:h-[600px] w-full`}
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <TabsList className="w-[375px] md:w-auto overflow-x-auto items-center justify-start bg-[var(--color-royal-light)]/25">
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
                  <Switch
                    checked={showTotal}
                    onCheckedChange={setShowTotal}
                    className="cursor-pointer data-[state=checked]:bg-[var(--color-royal)] data-[state=unchecked]:bg-[var(--color-royal-light)]"
                  />
                </div>
              )}
              <div className="flex flex-row gap-2 items-center">
                <Label>Showing Data as {showChart ? "Chart" : "Table"}</Label>
                <Switch
                  checked={showChart}
                  onCheckedChange={setShowChart}
                  className="cursor-pointer data-[state=checked]:bg-[var(--color-royal)] data-[state=unchecked]:bg-[var(--color-royal-light)]"
                />
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
    </section>
  );
}
