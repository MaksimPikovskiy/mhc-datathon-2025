import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";
import { useEffect } from "react";
import L from "leaflet";

type Props = {
  data: FeatureCollection;
};

function FitBounds({ data }: { data: FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    const layer = L.geoJSON(data);
    map.fitBounds(layer.getBounds());
  }, [map, data]);
  return null;
}

export default function MapWithPolygons({ data }: Props) {
  return (
    <MapContainer
      center={[40.73, -73.93]} // area center
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* This draws every polygon in GeoJSON */}
      <GeoJSON
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={data as any}
        style={{
          color: "#3388ff",
          weight: 2,
          fillColor: "#3388ff",
          fillOpacity: 0.3,
        }}
      />
      <FitBounds data={data} />
    </MapContainer>
  );
}
