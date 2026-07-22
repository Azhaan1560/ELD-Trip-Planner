import os
import requests

ROUTE_URL = "https://graphhopper.com/api/1/route"

class RoutingError(Exception):
    pass

def get_route(waypoints: list[tuple[float, float]]) -> dict:
    params = [("point", f"{lat},{lng}") for lat, lng in waypoints]
    params += [
        ("vehicle", "car"),
        ("key", os.environ["GRAPHHOPPER_API_KEY"]),
        ("points_encoded", "false"),
    ]

    response = requests.get(ROUTE_URL, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()

    if not data.get("paths"):
        raise RoutingError("No route found for the given waypoints")

    path = data["paths"][0]

    return {
        "distance_miles": path["distance"] / 1609.34,
        "duration_hours": path["time"] / 1000 / 3600,
        "geometry": [[lat, lng] for lng, lat in path["points"]["coordinates"]],
    }