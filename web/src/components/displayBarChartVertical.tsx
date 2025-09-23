import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "./ui/chart";

export type BarDefinition = {
  dataKey: string;
  fill: string;
  radius?: number;
};

type BarChartOptions = {
  /** data to display in the chart */
  data: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** recharts config for colors and labels */
  config: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** bars format for label and color */
  bars: BarDefinition[];
  /** variable to put on X-Axis */
  xKey?: string;
  /** show or hide legend with variables */
  showLegend?: boolean;
  /** show or hide x-axis labels*/
  showXLabels?: boolean;
};

export function DisplayBarChartVertical({
  data,
  config,
  bars,
  xKey = "bus_route_id",
  showLegend = false,
  showXLabels = true,
}: BarChartOptions) {
  return (
    <div className="w-full">
      <ChartContainer
        config={config}
        className="min-h-[200px] max-h-[550px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ bottom: 30 }}
        >
          <CartesianGrid vertical={false} />
          <Tooltip content={<ChartTooltipContent />} />
          {showLegend && <Legend content={<ChartLegendContent />} />}
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey={xKey}
            tick={showXLabels}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            textAnchor="end"
            interval={0}
            dy={-10}
            dx={-4}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill}
              radius={bar.radius ?? 4}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
