import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

const markerColors = {
  start: "#378ADD",
  pickup: "#EF9F27",
  dropoff: "#1D9E75",
};

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const stopLabels = ["Fuel stop", "30-minute break", "10-hour rest", "34-hour restart"];

const stopStyles = {
  "Fuel stop": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "30-minute break": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "10-hour rest": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  "34-hour restart": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export default function RouteMap({ trip }) {
  const { leg_to_pickup: legToPickup, leg_to_dropoff: legToDropoff } = trip.route;

  const routeCoords = [...legToPickup.geometry, ...legToDropoff.geometry];
  const startPoint = legToPickup.geometry[0];
  const pickupPoint = legToPickup.geometry[legToPickup.geometry.length - 1];
  const dropoffPoint = legToDropoff.geometry[legToDropoff.geometry.length - 1];

  const stops = trip.daily_logs.flatMap((day) =>
    day.segments
      .filter((seg) => stopLabels.includes(seg.label))
      .map((seg) => ({ ...seg, day: day.day }))
  );

  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Route</h2>
          <p className="text-sm text-gray-500">Planned path with pickup and dropoff points</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: markerColors.start }} />Start</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: markerColors.pickup }} />Pickup</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: markerColors.dropoff }} />Dropoff</span>
        </div>
      </div>

      <div style={{ height: "400px" }}>
        <MapContainer bounds={routeCoords} className="w-full h-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={routeCoords} pathOptions={{ color: "#378ADD", weight: 4 }} />

          <Marker position={startPoint} icon={makeIcon(markerColors.start)}>
            <Popup>{trip.current_location}</Popup>
          </Marker>
          <Marker position={pickupPoint} icon={makeIcon(markerColors.pickup)}>
            <Popup>Pickup — {trip.pickup_location}</Popup>
          </Marker>
          <Marker position={dropoffPoint} icon={makeIcon(markerColors.dropoff)}>
            <Popup>Dropoff — {trip.dropoff_location}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {stops.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Stops along the route</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stops.map((stop, i) => {
              const style = stopStyles[stop.label] || stopStyles["30-minute break"];
              return (
                <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${style.bg} ${style.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${style.text} bg-white`}>Day {stop.day}</span>
                    <span className={`text-sm font-medium ${style.text}`}>{stop.label}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-600">
                    {stop.start_hour.toFixed(1)}h – {stop.end_hour.toFixed(1)}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}