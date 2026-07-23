# ELD Trip Planner

A full-stack app that takes trip details from a driver and produces a compliant route plan and Driver's Daily Log (ELD) sheets, based on FMCSA Hours of Service (HOS) rules.

Built with Django (backend) + React (frontend).

## Live demo

- App: [eld-trip-planner-six-dusky.vercel.app](https://eld-trip-planner-six-dusky.vercel.app/)
- Backend API: [eld-trip-planner-api-yame.onrender.com](https://eld-trip-planner-api-yame.onrender.com)
- Loom walkthrough: _link pending recording_

## What it does

Given:
- Current location
- Pickup location
- Dropoff location
- Current cycle used (hours, 70hr/8-day rule)

It returns:
- A map of the route with pickup, dropoff, fuel, and rest stops marked
- One or more filled-in Daily Log Sheets (drawn as the standard 24-hour, 4-duty-status grid) covering the full trip

## Assumptions

Per the assessment brief, the planner assumes:
- Property-carrying driver, 70 hrs / 8-day cycle, no adverse driving conditions
- A fuel stop at least once every 1,000 miles
- 1 hour allotted for pickup, 1 hour for drop-off

HOS limits applied: 11-hour driving limit, 14-hour on-duty window, 30-minute break required after 8 hours of driving, 10 consecutive hours off duty between shifts, 70-hour/8-day cycle cap.

## Known limitations

- **Routing uses GraphHopper's `car` profile, not `truck`.** The free-tier GraphHopper API key doesn't include truck routing. Distance, duration, and route geometry are computed on car-legal roads and don't account for truck-specific restrictions (weight limits, low clearances, hazmat lanes). Numbers are still reasonably accurate for HOS planning purposes.
- **The Sleeper Berth row is always empty.** 10-hour rests and 30-minute breaks are modeled as regular off-duty time, not sleeper berth time — a simplification, since the app has no way to know whether a given truck has (or the driver used) a sleeper berth.
- **Trip start is assumed to be "now."** The form doesn't collect a start date/time, so Day 1 of every log sheet is dated to the current date, Day 2 to the next day, and so on.
- **Fuel stops are assumed to take 30 minutes.** The assessment specifies the 1,000-mile interval but not a duration — 30 minutes is a reasonable estimate, not a given constraint.
- **The 70-hour/8-day cycle is not modeled as a true rolling window.** Since the app only receives a single "current cycle used" number (not a day-by-day history), hours accumulate forward from that starting value rather than "rolling off" after 8 days. This can only make the schedule more conservative than reality, never less compliant.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Django + Django REST Framework |
| Frontend | React (Vite) |
| Styling | Tailwind CSS v4 |
| Routing / geocoding | GraphHopper API |
| Map rendering | react-leaflet + OpenStreetMap tiles |
| Backend hosting | Render |
| Frontend hosting | Vercel |

## Project structure

```
ELD-Trip-Planner/
├── backend/          # Django project + trips app
│   └── trips/
│       └── services/
│           ├── routing.py       # GraphHopper routing (2 leg calls)
│           ├── geocoding.py     # GraphHopper geocoding
│           ├── hos_constants.py # HOS limits as named constants
│           ├── hos_scheduler.py # low-level drive() simulation engine
│           └── hos_planner.py   # trip orchestration + day-splitting
├── frontend/          # React (Vite) app
│   └── src/
│       ├── api.js
│       ├── assets/logo.png
│       └── components/
│           ├── Header.jsx, Footer.jsx
│           ├── TripForm.jsx, TripSummary.jsx
│           ├── RouteMap.jsx, LogSheet.jsx
└── README.md
```

## Running locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
SECRET_KEY=your-django-secret-key
GRAPHHOPPER_API_KEY=your-graphhopper-key
```

```bash
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`.

### Frontend

```bash
cd frontend
npm install
npm install axios react-leaflet leaflet
```

Create `frontend/.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173/`.

## API

### `POST /api/trip/plan/`

Request body:

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 24
}
```

Response:

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 24,
  "route": {
    "leg_to_pickup": { "distance_miles": 297.0, "duration_hours": 4.57, "geometry": [[lat, lng], ...] },
    "leg_to_dropoff": { "distance_miles": 633.5, "duration_hours": 10.0, "geometry": [[lat, lng], ...] },
    "total_distance_miles": 930.5,
    "total_duration_hours": 14.57
  },
  "daily_logs": [
    {
      "day": 1,
      "segments": [
        { "status": "driving", "label": "Driving", "start_hour": 0.0, "end_hour": 4.57 },
        { "status": "on_duty_not_driving", "label": "Pickup", "start_hour": 4.57, "end_hour": 5.57 },
        { "status": "off_duty", "label": "30-minute break", "start_hour": 9.0, "end_hour": 9.5 },
        { "status": "off_duty", "label": "10-hour rest", "start_hour": 12.5, "end_hour": 22.5 }
      ]
    }
  ]
}
```

`status` is one of `driving`, `off_duty`, `on_duty_not_driving` (the `sleeper_berth` row on the log sheet exists visually but is never populated — see Known limitations). `start_hour`/`end_hour` are decimal hours from midnight of that day's sheet (e.g. `9.5` = 9:30am). Per-day mileage and driver-signature data are computed entirely on the frontend, not returned by this endpoint.

## Deployment

- Backend deployed to Render as a web service (gunicorn + whitenoise, `ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS` set to the live domains).
- Frontend deployed to Vercel, `VITE_API_URL` pointed at the Render backend URL at build time.
- **Note:** the backend is on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idling can take 30-60 seconds to respond while the service wakes up — this is expected, not a bug.

## Author notes

Built as a timed take-home assessment (16-hour budget). See commit history for development order.
