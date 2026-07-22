import os 
import requests
GEOCODE_URL="https://graphhopper.com/api/1/geocode"

class GeocodingError(Exception):
    pass

def geocode(location: str)->tuple[float,float]:
    response=requests.get(GEOCODE_URL,
    params={
        "q":location,
        "key": os.environ["GRAPHHOPPER_API_KEY"],
        "limit":1

    },
    timeout=10,
    )
    response.raise_for_status()
    data=response.json()

    if not data.get("hits"):
        raise GeocodingError(f"No Location Found for '{location}")

    point = data["hits"][0]["point"]
    return point["lat"], point["lng"]