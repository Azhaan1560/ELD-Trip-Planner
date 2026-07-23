from dataclasses import dataclass

from . import hos_constants as c


@dataclass
class DriveState:
    elapsed_hours: float = 0.0
    driving_since_break: float = 0.0
    driving_in_window: float = 0.0
    window_elapsed: float = 0.0
    miles_since_fuel: float = 0.0
    cycle_used: float = 0.0


def drive(state: DriveState, hours_needed: float, avg_mph: float) -> list[dict]:
    segments = []
    eps = 1e-6

    while hours_needed > eps:
        hours_to_cycle_limit = c.CYCLE_LIMIT_HOURS - state.cycle_used
        hours_to_driving_limit = c.DRIVING_LIMIT_HOURS - state.driving_in_window
        hours_to_window_limit = c.DUTY_WINDOW_HOURS - state.window_elapsed
        hours_to_break = c.BREAK_REQUIRED_AFTER_HOURS - state.driving_since_break
        hours_to_fuel = (c.FUEL_INTERVAL_MILES - state.miles_since_fuel) / avg_mph

        chunk = max(0.0, min(
            hours_needed, hours_to_cycle_limit, hours_to_driving_limit,
            hours_to_window_limit, hours_to_break, hours_to_fuel,
        ))

        if chunk > eps:
            miles = chunk * avg_mph
            segments.append({
                "status": "driving",
                "start_hour": state.elapsed_hours,
                "end_hour": state.elapsed_hours + chunk,
                "label": "Driving",
            })
            state.elapsed_hours += chunk
            state.driving_since_break += chunk
            state.driving_in_window += chunk
            state.window_elapsed += chunk
            state.miles_since_fuel += miles
            state.cycle_used += chunk
            hours_needed -= chunk

        if hours_needed <= eps:
            break

        if state.cycle_used >= c.CYCLE_LIMIT_HOURS - eps:
            segments.append({
                "status": "off_duty",
                "start_hour": state.elapsed_hours,
                "end_hour": state.elapsed_hours + c.RESTART_HOURS,
                "label": "34-hour restart",
            })
            state.elapsed_hours += c.RESTART_HOURS
            state.driving_since_break = 0
            state.driving_in_window = 0
            state.window_elapsed = 0
            state.cycle_used = 0
            continue

        if state.driving_in_window >= c.DRIVING_LIMIT_HOURS - eps or state.window_elapsed >= c.DUTY_WINDOW_HOURS - eps:
            segments.append({
                "status": "off_duty",
                "start_hour": state.elapsed_hours,
                "end_hour": state.elapsed_hours + c.OFF_DUTY_RESET_HOURS,
                "label": "10-hour rest",
            })
            state.elapsed_hours += c.OFF_DUTY_RESET_HOURS
            state.driving_since_break = 0
            state.driving_in_window = 0
            state.window_elapsed = 0
            continue

        if state.miles_since_fuel >= c.FUEL_INTERVAL_MILES - eps:
            segments.append({
                "status": "on_duty_not_driving",
                "start_hour": state.elapsed_hours,
                "end_hour": state.elapsed_hours + c.FUEL_DURATION_HOURS,
                "label": "Fuel stop",
            })
            state.elapsed_hours += c.FUEL_DURATION_HOURS
            state.window_elapsed += c.FUEL_DURATION_HOURS
            state.cycle_used += c.FUEL_DURATION_HOURS
            state.miles_since_fuel = 0
            continue

        if state.driving_since_break >= c.BREAK_REQUIRED_AFTER_HOURS - eps:
            segments.append({
                "status": "off_duty",
                "start_hour": state.elapsed_hours,
                "end_hour": state.elapsed_hours + c.BREAK_DURATION_HOURS,
                "label": "30-minute break",
            })
            state.elapsed_hours += c.BREAK_DURATION_HOURS
            state.window_elapsed += c.BREAK_DURATION_HOURS
            state.driving_since_break = 0
            continue

    return segments