# CLAUDE.md — ELD Trip Planner

This file orients Claude (or any future session) on this project: what it is, why it exists, the plan, and — critically — the boundaries Claude must operate within.

## What this is

A take-home assessment for a Full Stack Developer role. Django + React app that takes trip details as input and outputs a route (map) plus filled-out Driver's Daily Log (ELD) sheets, per FMCSA Hours of Service rules.

**Deadline:** 3 calendar days from 2026-07-22. **Time budget:** 16 hours of actual work, self-tracked.

**Reward:** $100 if accepted. Grading criteria (from the assessment doc):
- Hosted live version (accuracy will be tested against it)
- 3-5 min Loom walking through the app and the code
- GitHub repo shared
- UI/UX quality matters — good design can offset minor output inaccuracies

## Source documents (in project root)

- `new-full-stack-dev-assessment.docx` — the assignment brief
- `blank-paper-log.png` — reference image of the real paper ELD log sheet (24hr grid, 4 duty-status rows: Off Duty / Sleeper Berth / Driving / On Duty)
- `fmsca-image.png` + `fmcsa-hos-395-drivers-guide-to-hos-2022-04-28-0-1-.pdf` — FMCSA Hours of Service rules reference

## Required inputs (the form)

- Current location
- Pickup location
- Dropoff location
- Current Cycle Used (Hrs)

## Required outputs

- Map showing the route, with stops/rests marked (free map API)
- Daily Log Sheets, drawn (not just listed) — multiple sheets for multi-day trips

## Assumptions baked into the logic (given by the assessment, do not relitigate)

- Property-carrying driver, 70 hrs / 8-day cycle, no adverse driving conditions
- Fuel stop at least once every 1,000 miles
- 1 hour allotted for pickup, 1 hour for drop-off

## Role Claude plays — READ THIS BEFORE HELPING

**The user is the developer. Claude is strictly an assistant, not a contributor of end-to-end features.** This is a personal skills assessment — Claude producing the working app defeats its purpose and the user has explicitly forbidden it.

Claude's job, when asked, is limited to:

1. **Boilerplate / scaffolding snippets** — e.g. "give me the DRF serializer boilerplate for this model" or "what's the react-leaflet setup snippet." Small, mechanical, non-creative code the user assembles themselves.
2. **Debugging** — the user pastes an error or describes broken behavior; Claude diagnoses and explains the fix. Claude may show a corrected snippet, but only for the specific bug, not surrounding code the user didn't ask about.
3. **Design** — visual/UX mockups (via the visualize tool), layout decisions, styling guidance. No app logic.
4. **Concept explanations** — Django/React/HOS-rule concepts the user is unfamiliar with, explained in relation to what they already know.
5. **Reviewing code the user wrote** — sanity-checking HOS math, catching bugs, suggesting cleanups — only on code they show Claude, not code Claude wrote itself.

**Do not, unless explicitly asked in that exact moment:**
- Write full features, components, or endpoints unprompted
- Refactor files beyond the specific ask
- Make architecture decisions without presenting options first (see decisions log below)
- Advance to the next phase without the user indicating the current one is done

If a request is ambiguous about scope ("help me with the log sheet"), ask what specifically they want: a snippet, a debug pass, or a review — don't default to writing the whole thing.

## Tech stack decisions (locked in)

| Concern | Choice | Notes |
|---|---|---|
| Backend | Django + Django REST Framework | venv-based, not Docker |
| Frontend | React via Vite | React 19 |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin, no PostCSS config needed |
| Map/routing | **GraphHopper** | User switched to this after OpenRouteService signup issues. Free tier ~500 req/day. Routes use `vehicle=car` — free key has no `truck` profile. |
| Geocoding | GraphHopper Geocoding API (or Nominatim as fallback) | |
| Map rendering | react-leaflet + OpenStreetMap tiles | Free, no key needed for tiles |
| Backend hosting | Render (free web service tier) | Vercel doesn't run Django well; frontend-only on Vercel |
| Frontend hosting | Vercel | |
| Page count | Single page | Form → summary stats → map → log sheets, all on one scroll. Trip inputs optionally mirrored to URL query string for shareable results. |

## Project structure

```
ELD-Trip-Planner/
├── backend/                    # Django (venv-based)
│   ├── .venv/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                    # GRAPHHOPPER_API_KEY, SECRET_KEY (gitignored)
│   ├── config/                 # project settings package
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── trips/                  # single Django app
│       ├── models.py           # Trip model (optional persistence)
│       ├── serializers.py      # DRF serializer for input/output
│       ├── views.py            # POST /api/trip/plan/
│       ├── urls.py
│       └── services/
│           ├── routing.py      # calls GraphHopper routing
│           ├── geocoding.py    # calls GraphHopper/Nominatim geocoding
│           └── hos_planner.py  # HOS rules -> timeline of duty segments
│
├── frontend/                   # React (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                    # VITE_API_URL
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # the one page
│       ├── api.js              # fetch wrapper
│       ├── components/
│       │   ├── TripForm.jsx    # 4 inputs
│       │   ├── RouteMap.jsx    # react-leaflet
│       │   ├── TripSummary.jsx # miles, drive time, # of days
│       │   └── LogSheet.jsx    # SVG log grid + drawn timeline
│       └── styles/
│           └── index.css
│
├── README.md
├── CLAUDE.md                   # this file
└── .gitignore
```

## Phases (tracked via TaskList in-session; this is the durable reference)

0. **Local setup** — venv, Django project, Vite React app, Tailwind wired. ✅ Done (2026-07-22)
1. **Backend skeleton** — DRF, CORS, `POST /api/trip/plan/` returning a dummy response, input serializer
2. **GraphHopper integration** — geocoding + routing, returns geometry/distance/duration
3. **HOS planner logic (the core)** — rules engine producing per-day duty-status timelines
4. **Frontend map** — form, react-leaflet route rendering, summary stat tiles
5. **LogSheet SVG component** — draw the 24hr x 4-row grid per day, matching `blank-paper-log.png` proportions
6. **Deploy** — Render (backend) + Vercel (frontend), README finalized, Loom recorded, repo shared

## Decisions log

Record anything non-obvious decided mid-project here so future sessions don't re-litigate it.

- 2026-07-22: Switched from OpenRouteService to GraphHopper (ORS signup was failing repeatedly).
- 2026-07-22: Single-page layout confirmed over multi-route SPA — time budget doesn't support routing overhead.
- 2026-07-23: Routing calls GraphHopper with `vehicle=car`, not `truck`. GraphHopper's free-tier API key doesn't include the truck routing profile (that's a paid feature). This means distance/duration/geometry come from car-legal roads and don't account for truck-specific restrictions (weight limits, low bridges, hazmat lanes). Accepted as a known simplification — still reasonably accurate for HOS planning purposes, which is what's graded.
