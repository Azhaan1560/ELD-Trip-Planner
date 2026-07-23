const GRID_LEFT = 80;
const GRID_RIGHT = 600;
const GRID_TOP = 20;
const GRID_BOTTOM = 180;
const HOUR_WIDTH = (GRID_RIGHT - GRID_LEFT) / 24;

const ROW_Y = {
  off_duty: 40,
  driving: 120,
  on_duty_not_driving: 160,
};

const ROW_LABELS = ["Off duty", "Sleeper berth", "Driving", "On duty"];
const ROW_BOUNDARIES = [20, 60, 100, 140, 180];

function hourToX(hour) {
  return GRID_LEFT + hour * HOUR_WIDTH;
}

function buildPath(segments) {
  if (segments.length === 0) return "";
  const points = [[hourToX(segments[0].start_hour), ROW_Y[segments[0].status]]];

  segments.forEach((seg, i) => {
    const y = ROW_Y[seg.status];
    points.push([hourToX(seg.end_hour), y]);

    const next = segments[i + 1];
    if (next && ROW_Y[next.status] !== y) {
      points.push([hourToX(seg.end_hour), ROW_Y[next.status]]);
    }
  });

  return "M " + points.map(([x, y]) => `${x.toFixed(2)} ${y}`).join(" L ");
}

function totalsByStatus(segments) {
  const totals = { off_duty: 0, driving: 0, on_duty_not_driving: 0 };
  segments.forEach((seg) => {
    totals[seg.status] += seg.end_hour - seg.start_hour;
  });
  return totals;
}

function formatDateForDay(dayNumber) {
  const date = new Date();
  date.setDate(date.getDate() + (dayNumber - 1));
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

export default function LogSheet({ dayNumber, segments, milesToday, fromLocation, toLocation, driverName }) {
  const path = buildPath(segments);
  const totals = totalsByStatus(segments);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-3 text-sm">
        <p className="font-medium text-base">Day {dayNumber} — {formatDateForDay(dayNumber)}</p>
        <p className="text-gray-500">{fromLocation} → {toLocation}</p>
        <p className="text-gray-500">Total miles driving today: {Math.round(milesToday ?? 0)} mi</p>
      </div>

      <svg viewBox="0 0 620 200" className="w-full h-auto">
        {ROW_LABELS.map((label, i) => (
          <text
            key={label}
            x={74}
            y={ROW_BOUNDARIES[i] + 20}
            textAnchor="end"
            style={{ fontSize: 10, fill: "#6b7280" }}
          >
            {label}
          </text>
        ))}

        {ROW_BOUNDARIES.map((y) => (
          <line key={y} x1={GRID_LEFT} y1={y} x2={GRID_RIGHT} y2={y} stroke="#d1d5db" strokeWidth={0.5} />
        ))}

        {Array.from({ length: 25 }, (_, i) => (
          <line
            key={i}
            x1={hourToX(i)}
            y1={GRID_TOP}
            x2={hourToX(i)}
            y2={GRID_BOTTOM}
            stroke="#d1d5db"
            strokeWidth={0.5}
          />
        ))}

        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
          <text
            key={h}
            x={hourToX(h)}
            y={GRID_TOP - 6}
            textAnchor="middle"
            style={{ fontSize: 9, fill: "#9ca3af" }}
          >
            {h === 0 || h === 24 ? "Mid" : h === 12 ? "Noon" : h}
          </text>
        ))}

        <path d={path} fill="none" stroke="#378ADD" strokeWidth={2.5} />
      </svg>

      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">Remarks</p>
        <div className="border rounded h-10 bg-gray-50" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Off duty</p>
          <p className="font-medium">{totals.off_duty.toFixed(1)}h</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Driving</p>
          <p className="font-medium">{totals.driving.toFixed(1)}h</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">On duty</p>
          <p className="font-medium">{totals.on_duty_not_driving.toFixed(1)}h</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">I certify that these entries are true and correct</p>
          <p style={{ fontFamily: "cursive", fontSize: 20 }} className="border-b px-2 pb-1 min-w-[200px]">
            {driverName || " "}
          </p>
        </div>
        <p className="text-xs text-gray-500">{formatDateForDay(dayNumber)}</p>
      </div>
    </div>
  );
}
