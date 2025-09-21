import './App.css'
import { type BusRoute, getRouteData, getViolationData, type BusViolation, getCBDData, getViolationCountData, type BusViolationCount } from './api/getData';
import { JSON_COLUMNS } from './util/constants';
import Navbar from './components/navbar';
import { DataTable } from './components/data-table';
import { MapContainer, Marker, Polygon, Popup, TileLayer } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import "leaflet/dist/leaflet.css";
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
import 'leaflet-extra-markers';
import { useCallback, useEffect, useState } from 'react';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from './components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// This extends L with ExtraMarkers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ExtraMarkers = (L as any).ExtraMarkers;

const getExtraMarker = (color: string) =>
  ExtraMarkers.icon({
    icon: 'fa-number',
    // number: '1',
    markerColor: color,
    shape: 'penta',
    prefix: 'fa',
    // iconColor: 'gray',
    svg: true
  });

type BusRouteMarker = {
  bus_route_id: string,
  color: string,
}

const purpleOptions = { color: 'purple' }

const greenOptions = { color: 'green' }

const simpleCongestionZone = [
  [40.699793, -74.019806],  // bottom-left
  [40.774653, -74.019806],  // top-left
  [40.774653, -73.9586025], // top-right
  [40.699793, -73.9586025], // bottom-right
]

function App() {
  const [data, setData] = useState<BusViolation[]>([]);
  const [routes, setRoutes] = useState<BusRouteMarker[]>([]);
  const [congestionZone, setCongestionZone] = useState<number[][][]>([]);

  const [counts, setCounts] = useState<BusViolationCount[]>([]);
  const countQuery = `SELECT 
                          bus_route_id,
                          COUNT(*) AS total_violations,
                          SUM(CASE WHEN violation_type = 'MOBILE BUS STOP' THEN 1 ELSE 0 END) AS bus_stop_violations,
                          SUM(CASE WHEN violation_type = 'MOBILE DOUBLE PARKED' THEN 1 ELSE 0 END) AS double_parked_violations,
                          SUM(CASE WHEN violation_type = 'MOBILE BUS LANE' THEN 1 ELSE 0 END) AS bus_lane_violations
                      GROUP BY bus_route_id
                      `

  const chartConfig = {
    value: {
      label: "Total Violations",
      color: "#2563eb",
    },
  } satisfies ChartConfig

  const chartConfig2 = {
    bus_stop_violations: {
      label: "Bus Stop",
      color: "#E53A70",
    },
    double_parked_violations: {
      label: "Double Parked",
      color: "#32CD32",
    },
    bus_lane_violations: {
      label: "Bus Lane",
      color: "#FF8C00",
    },
  } satisfies ChartConfig

  const getDistinctRoutesWithColors = (data: BusViolation[]) => {
    const uniqueRouteIds = new Set<string>(data.map((item: BusViolation) => item.bus_route_id));
    const distinctRoutes: BusRouteMarker[] = [];

    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    uniqueRouteIds.forEach(id => {
      distinctRoutes.push({
        bus_route_id: id,
        color: getRandomColor()
      });
    });

    return distinctRoutes;
  };

  const fetchAndSetViolationData = useCallback(async () => {
    const allViolationData = [];
    const limit = 1000;
    const totalRecordsToFetch = 5000;
    const query = `SELECT *
                    WHERE
                      \`violation_longitude\` BETWEEN -74.019806 AND -73.9586025
                      AND \`violation_latitude\` BETWEEN 40.699793 AND 40.774653
                      AND caseless_contains(\`bus_route_id\`, "M")
                    ORDER BY \`violation_id\` DESC NULL FIRST`;

    for (let i = 0; i < totalRecordsToFetch / limit; i++) {
      const offset = i * limit;
      try {
        const newData = await getViolationData({ offset, query });
        allViolationData.push(...newData);
      } catch (error) {
        console.error('Failed to fetch violation data:', error);
      }
    }

    setData(allViolationData);
    console.log(`Successfully fetched and set ${allViolationData.length} records.`);

    setRoutes(getDistinctRoutesWithColors(allViolationData));
  }, []);

  const getTotal = () => {
    return counts.reduce((acc, curr) => +acc + +curr.total_violations, 0)
  }

  const getChartData = () => {
    return counts.map((c) => ({
      label: c.bus_route_id,
      value: c.total_violations
    }));
  }

  useEffect(() => {
    fetchAndSetViolationData();
    getCBDData().then(setCongestionZone);

    getViolationCountData({ offset: 0, query: countQuery }).then(setCounts);

  }, [fetchAndSetViolationData, countQuery]);

  const getColorByRouteId = (id: string) => {
    return routes.find(r => r.bus_route_id === id)?.color ?? 'gray';
  }

  return (
    <>
      <Navbar />
      <main className="mt-12 space-y-6">
        <DataTable<BusViolation>
          title="Bus Violation"
          fetchData={getViolationData}
          columns={JSON_COLUMNS}
          renderCell={(col, value) => {
            if (
              col === 'violation_georeference' ||
              col === 'bus_stop_georeference'
            ) {
              if (typeof value === 'object' && value?.coordinates) {
                return `Point(${value.coordinates[0]}, ${value.coordinates[1]})`
              }
              return JSON.stringify(value)
            }
            return value as string
          }}
        />
        <DataTable<BusRoute>
          title="Bus Route"
          fetchData={getRouteData}
        />
        <div className="rounded border">
          <MapContainer center={[40.6782, -73.9442]} zoom={13} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data.map(vio => (
              <Marker
                key={vio.violation_id}
                position={[parseFloat(vio.violation_latitude), parseFloat(vio.violation_longitude)]}
                icon={getExtraMarker(getColorByRouteId(vio.bus_route_id))}
              >
                <Popup className="flex flex-row">
                  <span>{vio.bus_route_id}</span>
                  <br />
                  <span>{vio.stop_name}</span>
                  <br />
                  <span>{vio.violation_type}</span>
                  <br />
                  <span>{vio.violation_status}</span>
                  <br />
                  <span>Longitude: {vio.violation_longitude}</span>
                  <br />
                  <span>Latitude: {vio.violation_latitude}</span>
                </Popup>
              </Marker>
            ))}
            <Polygon pathOptions={purpleOptions} positions={congestionZone as LatLngExpression[][]} />
            <Polygon pathOptions={greenOptions} positions={simpleCongestionZone as LatLngExpression[]} />
          </MapContainer>
        </div>

        <DataTable<BusViolationCount>
          title="Violation Count"
          fetchData={() => getViolationCountData({ offset: 0, query: countQuery })}
        />

        <span>{getTotal()}</span>
        <h2 className='font-bold text-xl'>Total Violations Per Bus Route</h2>
        <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[500px] w-full">
          <BarChart accessibilityLayer data={getChartData()}>
            <CartesianGrid vertical={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
        <h2 className='font-bold text-xl'>Violations of Each Type Per Bus Route</h2>
        <ChartContainer config={chartConfig2} className="min-h-[200px] max-h-[500px] w-full">
          <BarChart accessibilityLayer data={counts}>
            <CartesianGrid vertical={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <XAxis
              dataKey="bus_route_id"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Bar dataKey="bus_stop_violations" fill="var(--color-bus_stop_violations)" radius={4} />
            <Bar dataKey="bus_lane_violations" fill="var(--color-bus_lane_violations)" radius={4} />
            <Bar dataKey="double_parked_violations" fill="var(--color-double_parked_violations)" radius={4} />
          </BarChart>
        </ChartContainer>
      </main>
    </>
  )
}

export default App
