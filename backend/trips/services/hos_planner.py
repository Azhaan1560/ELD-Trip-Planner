from . import hos_constants as c
from .hos_scheduler import DriveState, drive


def build_trip_timeline(leg_to_pickup: dict, leg_to_dropoff: dict, current_cycle_used: float) -> list[dict]:
    state = DriveState(cycle_used=current_cycle_used)
    segments = []

    avg_mph_to_pickup = leg_to_pickup["distance_miles"] / leg_to_pickup["duration_hours"]
    segments += drive(state, leg_to_pickup["duration_hours"], avg_mph_to_pickup)

    segments.append({
        "status": "on_duty_not_driving",
        "start_hour": state.elapsed_hours,
        "end_hour": state.elapsed_hours + c.PICKUP_DURATION_HOURS,
        "label": "Pickup",
    })
    state.elapsed_hours += c.PICKUP_DURATION_HOURS
    state.window_elapsed += c.PICKUP_DURATION_HOURS
    state.cycle_used += c.PICKUP_DURATION_HOURS

    avg_mph_to_dropoff = leg_to_dropoff["distance_miles"] / leg_to_dropoff["duration_hours"]
    segments += drive(state, leg_to_dropoff["duration_hours"], avg_mph_to_dropoff)

    segments.append({
        "status": "on_duty_not_driving",
        "start_hour": state.elapsed_hours,
        "end_hour": state.elapsed_hours + c.DROPOFF_DURATION_HOURS,
        "label": "Dropoff",
    })
    state.elapsed_hours += c.DROPOFF_DURATION_HOURS
    state.window_elapsed += c.DROPOFF_DURATION_HOURS
    state.cycle_used += c.DROPOFF_DURATION_HOURS

    return segments


def split_into_days(segments: list[dict]) -> list[dict]:
    days = []

    for seg in segments:
        start, end = seg["start_hour"], seg["end_hour"]

        while start < end:
            day_index = int(start // 24)
            day_start_hour = day_index * 24
            piece_end = min(end, day_start_hour + 24)

            while len(days) <= day_index:
                days.append({"day": len(days) + 1, "segments": []})

            days[day_index]["segments"].append({
                "status": seg["status"],
                "label": seg["label"],
                "start_hour": start - day_start_hour,
                "end_hour": piece_end - day_start_hour,
            })

            start = piece_end

    return days