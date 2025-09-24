import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
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
  /** x-axis label */
  xLabel?: string;
  /** y-axis label */
  yLabel?: string;
};

export function DisplayBarChartVertical({
  data,
  config,
  bars,
  xKey = "bus_route_id",
  showLegend = false,
  showXLabels = true,
  xLabel = "",
  yLabel = "",
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
          <XAxis type="number">
            {xLabel.length > 0 && (
              <Label value={xLabel} position="insideBottom" offset={-5} />
            )}
          </XAxis>
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
          >
            {yLabel.length > 0 && (
              <Label
                value={yLabel}
                angle={-90}
                position="insideLeft"
                offset={10}
              />
            )}
          </YAxis>
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
