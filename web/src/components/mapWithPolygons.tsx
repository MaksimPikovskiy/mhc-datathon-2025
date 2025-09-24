import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";
import { useEffect } from "react";
import L from "leaflet";
import type Neighborhood from "@/models/Neighborhood";
import type NeighborhoodRisk from "@/models/NeighborhoodRisk";
import { getColorForScore, normalizeName } from "@/lib/utils";

type Props = {
  data: FeatureCollection;
  info: Neighborhood[];
  riskScores: NeighborhoodRisk[];
};

function FitBounds({ data }: { data: FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    const layer = L.geoJSON(data);
    map.fitBounds(layer.getBounds());
  }, [map, data]);
  return null;
}

export default function MapWithPolygons({ data, info, riskScores }: Props) {
  const neighborhoodDataLookup = Object.fromEntries(
    riskScores.map((r) => {
      const normalized = normalizeName(r.neighborhoodName);
      const infoRecord = info.find(
        (n) => normalizeName(n.neighborhood_name) === normalized
      );
      return [
        normalized,
        {
          riskScore: r.riskScore,
          ridership: infoRecord?.avg_total_ridership ?? 0,
          speed: infoRecord?.avg_speed ?? 0,
          busRoutes: infoRecord?.bus_route_ids ?? "None",
          totalViolations: infoRecord?.total_violations ?? 0,
          doubleParked: infoRecord?.double_parked_violations ?? 0,
          busStop: infoRecord?.bus_stop_violations ?? 0,
          busLane: infoRecord?.bus_lane_violations ?? 0,
        },
      ];
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styleFeature = (feature: any) => {
    const name = normalizeName(feature.properties.NTAName);
    const score = neighborhoodDataLookup[name]?.riskScore ?? 0; // default 0 if not found
    return {
      color: getColorForScore(score), // polygon outline
      weight: 1,
      fillColor: getColorForScore(score),
      fillOpacity: 0.75,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachFeature = (feature: any, layer: any) => {
    const p = feature.properties;

    layer.bindPopup(`
    <div class="p-1">
      <strong class="text-md font-semibold">${p.NTAName}</strong><br/>
      <span class="text-xs text-gray-600">Borough: ${p.BoroName}</span>
      <ul class="mt-1 list-disc list-inside space-y-1 text-xs">
        <li>Bus Routes: <span class="font-medium">${p.busRoutes}</span></li>
        <li>Risk Score: <span class="font-medium">${p.riskScore}</span></li>
        <li>Avg Speed: <span class="font-medium">${p.speed}</span></li>
        <li>Ridership: <span class="font-medium">${p.ridership}</span></li>
        <li>
          Total Violations: <span class="font-medium">${p.totalViolations}</span>
          <ul class="list-[circle] list-inside pl-2 mt-1 space-y-0.5 text-xs">
            <li>Double Parked: <span class="font-medium">${p.doubleParked}</span></li>
            <li>Bus Stop: <span class="font-medium">${p.busStop}</span></li>
            <li>Bus Lane: <span class="font-medium">${p.busLane}</span></li>
          </ul>
        </li>
      </ul>
    </div>
  `);

    layer.bindTooltip(p.NTAName, { sticky: true });
  };

  return (
    <MapContainer
      center={[40.73, -73.93]} // area center
      zoom={13}
      style={{ height: "575px", width: "100%", zIndex: 49 }}
      className="border rounded"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* This draws every polygon in GeoJSON */}
      <GeoJSON
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={data as any}
        style={styleFeature}
        onEachFeature={onEachFeature}
      />
      <FitBounds data={data} />
    </MapContainer>
  );
}
