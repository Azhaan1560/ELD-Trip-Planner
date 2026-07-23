import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function planTrip({ currentLocation, pickupLocation, dropoffLocation, currentCycleUsed }) {
  const response = await axios.post(`${API_URL}/api/trip/plan/`, {
    current_location: currentLocation,
    pickup_location: pickupLocation,
    dropoff_location: dropoffLocation,
    current_cycle_used: currentCycleUsed,
  });
  return response.data;
}