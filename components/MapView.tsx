import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Message, LatLngTuple } from "@/lib/types";
import { LocationClickHandler } from "./LocationClickHandler";
import { MessageMarkers } from "./MessageMarkers";
import { LocationSearch } from "./LocationSearch";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  center: LatLngTuple;
  messages: Message[];
  onLocationClick: (position: LatLngTuple) => void;
  onLocationSearch: (position: LatLngTuple) => void;
  onMapMove: (center: LatLngTuple, radius: number) => void;
}

function MapUpdater({ center }: { center: LatLngTuple }) {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.flyTo(center, 13, {
        duration: 1,
      });
    }
  }, [center, map]);

  return null;
}

export function MapView({
  center,
  messages,
  onLocationClick,
  onLocationSearch,
  onMapMove,
}: MapViewProps) {
  return (
    <div className="relative w-full h-screen bg-transparent">
      <MapContainer
        key="freedom-wall-map"
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        minZoom={6}
        maxZoom={18}
        className="w-full h-screen"
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} />
        <LocationClickHandler
          onLocationClick={onLocationClick}
          onMapMove={onMapMove}
        />
        <MessageMarkers messages={messages} />
      </MapContainer>
      <LocationSearch onLocationSelected={onLocationSearch} />
    </div>
  );
}
