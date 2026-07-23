from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripRequestSerializers
from .services.geocoding import geocode, GeocodingError
from .services.routing import get_route, RoutingError
from .services.hos_planner import build_trip_timeline, split_into_days

# Create your views here.
class TripPlanView(APIView):
    def post(self,request):
            serializer=TripRequestSerializers(data=request.data)
            serializer.is_valid(raise_exception=True)
            data=serializer.validated_data

            try: 
                  current= geocode(data["current_location"])
                  pickup = geocode(data["pickup_location"])
                  dropoff = geocode(data["dropoff_location"])
                  leg_to_pickup = get_route([current,pickup])
                  leg_to_dropoff= get_route([pickup,dropoff])

            except(GeocodingError, RoutingError) as exc:
                 return Response({"error": str(exc)},status=status.HTTP_400_BAD_REQUEST)

            timeline=build_trip_timeline(leg_to_pickup,leg_to_dropoff,data["current_cycle_used"])
            daily_logs=split_into_days(timeline)  
                
            return Response(
                  {
                    "current_location": data["current_location"],
                    "pickup_location": data["pickup_location"],
                    "dropoff_location": data["dropoff_location"],
                    "current_cycle_used": data["current_cycle_used"],
                    "route": {
                    "leg_to_pickup": leg_to_pickup,
                    "leg_to_dropoff": leg_to_dropoff,
                    "total_distance_miles": leg_to_pickup["distance_miles"] + leg_to_dropoff["distance_miles"],
                    "total_duration_hours": leg_to_pickup["duration_hours"] + leg_to_dropoff["duration_hours"],
                     },
                    "daily_logs": daily_logs,
                  },
                  status=status.HTTP_200_OK,
            )