import './App.css'
import { type BusRoute, getRouteData, getViolationData, type BusViolation, getCBDData } from './api/getData';
import { JSON_COLUMNS } from './util/constants';
import Navbar from './components/navbar';
import { DataTable } from './components/data-table';
import { MapContainer, Marker, Polygon, Popup, TileLayer } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import "leaflet/dist/leaflet.css";
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css';
import 'leaflet-extra-markers';
import { useCallback, useEffect, useState } from 'react';

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

function App() {
  const [data, setData] = useState<BusViolation[]>([]);
  const [routes, setRoutes] = useState<BusRouteMarker[]>([]);
  const [congestionZone, setCongestionZone] = useState<number[][][]>([]);

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

    for (let i = 0; i < totalRecordsToFetch / limit; i++) {
      const offset = i * limit;
      try {
        const newData = await getViolationData({ offset });
        allViolationData.push(...newData);
      } catch (error) {
        console.error('Failed to fetch violation data:', error);
      }
    }

    setData(allViolationData);
    console.log(`Successfully fetched and set ${allViolationData.length} records.`);

    setRoutes(getDistinctRoutesWithColors(allViolationData));
  }, []);

  useEffect(() => {
    fetchAndSetViolationData();
    getCBDData().then(setCongestionZone);
  }, [fetchAndSetViolationData]);

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
                position={[+vio.bus_stop_latitude, +vio.bus_stop_longitude]}
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
                </Popup>
              </Marker>
            ))}
            <Polygon pathOptions={purpleOptions} positions={congestionZone as LatLngExpression[][]} />
          </MapContainer>
        </div>
      </main>
    </>
  )
}

export default App
