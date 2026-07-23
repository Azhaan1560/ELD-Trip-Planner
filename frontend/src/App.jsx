import { useState } from "react";
import TripForm from "./components/TripForm";
import TripSummary from "./components/TripSummary";
import RouteMap from "./components/RouteMap";
import LogSheet from "./components/LogSheet";
import Header from "./components/Header";
import Footer from "./components/Footer";

function computeDailyMiles(trip) {
  const { leg_to_pickup: legToPickup, leg_to_dropoff: legToDropoff } = trip.route;
  const mphToPickup = legToPickup.distance_miles / legToPickup.duration_hours;
  const mphToDropoff = legToDropoff.distance_miles / legToDropoff.duration_hours;

  let onSecondLeg = false;
  const milesByDay = {};

  trip.daily_logs.forEach((day) => {
    let dayMiles = 0;
    day.segments.forEach((seg) => {
      if (seg.label === "Pickup") {
        onSecondLeg = true;
        return;
      }
      if (seg.status === "driving") {
        const mph = onSecondLeg ? mphToDropoff : mphToPickup;
        dayMiles += (seg.end_hour - seg.start_hour) * mph;
      }
    });
    milesByDay[day.day] = dayMiles;
  });

  return milesByDay;
}

function App() {
  const [trip, setTrip] = useState(null);
  const [driverName, setDriverName] = useState("");

  const milesByDay = trip ? computeDailyMiles(trip) : {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Header />

      <TripForm onPlanReady={setTrip} />

      {trip && (
        <>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Driver name (for signature, optional)</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full sm:w-64 border rounded px-3 py-2"
            />
          </div>

          <TripSummary trip={trip} />
          <RouteMap trip={trip} />
          <div className="flex flex-col gap-4">
            {trip.daily_logs.map((day) => (
              <LogSheet
                key={day.day}
                dayNumber={day.day}
                segments={day.segments}
                milesToday={milesByDay[day.day]}
                fromLocation={trip.current_location}
                toLocation={trip.dropoff_location}
                driverName={driverName}
              />
            ))}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

export default App;