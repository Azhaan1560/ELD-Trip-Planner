from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripRequestSerializers
from .services.geocoding import geocode, GeocodingError
from .services.routing import get_route, RoutingError

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
                  route = get_route([current, pickup, dropoff])
            except(GeocodingError, RoutingError) as exc:
                 return Response({"error": str(exc)},status=status.HTTP_400_BAD_REQUEST)
                  
            return Response(
                  {
                    "current_location": data["current_location"],
                    "pickup_location": data["pickup_location"],
                    "dropoff_location": data["dropoff_location"],
                    "current_cycle_used": data["current_cycle_used"],
                    "route": route,
                    "daily_logs": [],
                  },
                  status=status.HTTP_200_OK,
            )