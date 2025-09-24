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
  /** x-axis label offset */
  xOffset?: number;
  /** y-axis label */
  yLabel?: string;
  /** y-axis label offset */
  yOffset?: number;
};

export function DisplayBarChart({
  data,
  config,
  bars,
  xKey = "bus_route_id",
  showLegend = false,
  showXLabels = true,
  xLabel = "",
  yLabel = "",
  xOffset = -5,
  yOffset = 10,
}: BarChartOptions) {
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="w-full">
      <ChartContainer
        config={config}
        className="min-h-[200px] max-h-[550px] w-full"
      >
        <BarChart accessibilityLayer data={data} margin={{ bottom: 30 }}>
          <CartesianGrid vertical={false} />
          <Tooltip content={<ChartTooltipContent />} />
          {showLegend && (
            <Legend
              content={<ChartLegendContent />}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ bottom: 0 }}
            />
          )}
          <XAxis
            dataKey={xKey}
            tick={showXLabels}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            interval={0}
            dy={-10}
            dx={-4}
          >
            {xLabel.length > 0 && (
              <Label value={xLabel} position="insideBottom" offset={xOffset} />
            )}
          </XAxis>
          <YAxis tickFormatter={formatNumber}>
            {yLabel.length > 0 && (
              <Label
                value={yLabel}
                angle={-90}
                position="insideLeft"
                offset={yOffset}
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
