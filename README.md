# ELD Trip Planner

A full-stack app that takes trip details from a driver and produces a compliant route plan and Driver's Daily Log (ELD) sheets, based on FMCSA Hours of Service (HOS) rules.

Built with Django (backend) + React (frontend).

## Live demo

- App: _link pending deployment_
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
│       └── services/ # routing, geocoding, HOS planner logic
├── frontend/          # React (Vite) app
│   └── src/
│       └── components/
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

Response: route geometry/distance/duration plus a list of daily log entries, each containing the duty-status timeline for that day.

_(Exact response schema documented here once Phase 2/3 land.)_

## Deployment

- Backend deployed to Render as a web service (gunicorn, `ALLOWED_HOSTS` set to the Render domain).
- Frontend deployed to Vercel, `VITE_API_URL` pointed at the Render backend URL.

## Author notes

Built as a timed take-home assessment (16-hour budget). See commit history for development order.
