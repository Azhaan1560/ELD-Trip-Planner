import { useState } from "react";
import { planTrip } from "../api";

export default function TripForm({ onPlanReady }) {
  const [currentLocation, setCurrentLocation] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [currentCycleUsed, setCurrentCycleUsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await planTrip({
        currentLocation,
        pickupLocation,
        dropoffLocation,
        currentCycleUsed: Number(currentCycleUsed),
      });
      onPlanReady(data);
    } catch (err) {
      setError("Could not plan this trip. Check your locations and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Plan a trip</h2>
        <p className="text-sm text-gray-500">Enter your locations and current cycle hours to generate a route and daily logs.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current location</label>
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Pickup location</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Dropoff location</label>
            <input
              type="text"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current cycle used (hrs)</label>
            <input
              type="number"
              min="0"
              max="70"
              step="0.1"
              value={currentCycleUsed}
              onChange={(e) => setCurrentCycleUsed(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="self-end bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Planning..." : "Plan trip"}
        </button>
      </form>
    </section>
  );
}