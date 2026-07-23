export default function TripSummary({ trip }) {
  const { route, daily_logs: dailyLogs, current_cycle_used: currentCycleUsed } = trip;

  const onDutyHours = dailyLogs
    .flatMap((day) => day.segments)
    .filter((seg) => seg.status === "driving" || seg.status === "on_duty_not_driving")
    .reduce((sum, seg) => sum + (seg.end_hour - seg.start_hour), 0);

  const cycleAfterTrip = currentCycleUsed + onDutyHours;

  const stats = [
    { label: "Total distance", value: `${route.total_distance_miles.toFixed(0)} mi` },
    { label: "Drive time", value: formatHours(route.total_duration_hours) },
    { label: "Days on the road", value: dailyLogs.length },
    { label: "Cycle after trip", value: `${cycleAfterTrip.toFixed(1)} / 70` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
          <p className="text-xl font-medium">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function formatHours(hours) {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
}