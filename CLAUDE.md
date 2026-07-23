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
│       ├── models.py           # Trip model (unused — pure compute, no persistence)
│       ├── serializers.py      # DRF serializer for input/output
│       ├── views.py            # POST /api/trip/plan/
│       ├── urls.py
│       └── services/
│           ├── routing.py       # calls GraphHopper routing (2 leg calls: current→pickup, pickup→dropoff)
│           ├── geocoding.py      # calls GraphHopper geocoding
│           ├── hos_constants.py  # HOS limits/durations as named constants
│           ├── hos_scheduler.py  # low-level drive() simulation engine (the physics)
│           └── hos_planner.py    # trip-level orchestration + day-splitting (the public entry point)
│
├── frontend/                   # React (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                    # VITE_API_URL (Claude is blocked from reading .env — see decisions log)
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # the one page; also computes per-day mileage client-side
│       ├── api.js              # axios wrapper around POST /api/trip/plan/
│       ├── index.css           # @import "tailwindcss"; + body bg override
│       ├── assets/
│       │   └── logo.png        # user-provided logo, used in Header + Footer
│       └── components/
│           ├── Header.jsx      # logo, anchor nav (#assumptions/#tech-stack), GitHub link
│           ├── Footer.jsx      # dark footer: brand blurb / assumptions / tech stack + copyright bar
│           ├── Logo.jsx         # unused legacy hand-drawn SVG mark, superseded by assets/logo.png
│           ├── TripForm.jsx    # 4 required inputs + optional driver name, wrapped in a card
│           ├── RouteMap.jsx    # react-leaflet route + start/pickup/dropoff pins + stop chips
│           ├── TripSummary.jsx # miles, drive time, # of days, cycle used after trip
│           └── LogSheet.jsx    # SVG log grid + drawn timeline + remarks row + signature line
│
├── README.md
├── CLAUDE.md                   # this file
└── .gitignore
```

## Phases (tracked via TaskList in-session; this is the durable reference)

0. **Local setup** — venv, Django project, Vite React app, Tailwind wired. ✅ Done (2026-07-22)
1. **Backend skeleton** — DRF, CORS, `POST /api/trip/plan/` returning a dummy response, input serializer. ✅ Done (2026-07-23)
2. **GraphHopper integration** — geocoding + routing, returns geometry/distance/duration. ✅ Done (2026-07-23) — later refactored to 2 separate leg calls (see decisions log)
3. **HOS planner logic (the core)** — rules engine producing per-day duty-status timelines. ✅ Done (2026-07-23)
4. **Frontend map** — form, react-leaflet route rendering, summary stat tiles, header/footer, logo. ✅ Done (2026-07-23)
5. **LogSheet SVG component** — draw the 24hr x 4-row grid per day, matching `blank-paper-log.png` proportions, plus remarks row + signature line. ✅ Done (2026-07-23)
6. **Deploy** — Render (backend) + Vercel (frontend), README finalized, Loom recorded, repo shared. 🔄 In progress

## Decisions log

Record anything non-obvious decided mid-project here so future sessions don't re-litigate it.

- 2026-07-22: Switched from OpenRouteService to GraphHopper (ORS signup was failing repeatedly).
- 2026-07-22: Single-page layout confirmed over multi-route SPA — time budget doesn't support routing overhead.
- 2026-07-23: Routing calls GraphHopper with `vehicle=car`, not `truck`. GraphHopper's free-tier API key doesn't include the truck routing profile (that's a paid feature). This means distance/duration/geometry come from car-legal roads and don't account for truck-specific restrictions (weight limits, low bridges, hazmat lanes). Accepted as a known simplification — still reasonably accurate for HOS planning purposes, which is what's graded.
- 2026-07-23: Routing switched from one combined 3-point GraphHopper call to two separate leg calls (`current→pickup`, `pickup→dropoff`). A single combined route doesn't expose where the pickup stop falls in the timeline; two calls give exact per-leg distance/duration so the HOS planner can insert the 1-hour pickup stop at the right point, and the frontend can compute per-day mileage without any backend changes.
- 2026-07-23: HOS planner logic split into 3 files instead of one: `hos_constants.py` (named limits), `hos_scheduler.py` (the low-level `drive()` simulation engine — the physics of the 11hr/14hr/8hr-break/cycle rules), `hos_planner.py` (trip-level orchestration: sequences current→pickup→dropoff and splits the result into calendar days).
- 2026-07-23: 10-hour rests and 30-minute breaks are modeled as `off_duty`, not `sleeper_berth` — the Sleeper Berth row on every log sheet is always empty. Real drivers often use the sleeper berth for these; this is a documented simplification, not a bug.
- 2026-07-23: Fuel stop duration assumed at 30 minutes — the assessment brief only specifies the 1,000-mile interval, not a duration. A reasonable estimate, not a given constraint.
- 2026-07-23: Trip start date assumed to be "today" (Day 1 = current date, Day 2 = tomorrow, etc.) since the form only collects current cycle hours, not an actual start date/time. Log sheet dates are computed as `today + day offset` on the frontend.
- 2026-07-23: Added an optional "Driver name" field to the frontend form — not part of the assessment's required inputs, purely to render a signature line on each log sheet. Never sent to the backend; frontend-only state.
- 2026-07-23: "Total miles driving today" is computed entirely on the frontend (`App.jsx`), not the backend. It reconstructs which leg each driving segment belongs to by watching for the `"Pickup"` label as the leg-switch marker in the already-ordered segment list, then multiplies each driving segment's duration by that leg's average speed (`distance_miles / duration_hours`, already available from the routing response). Chosen specifically to avoid a backend change late in the project.
- 2026-07-23: Added `.claude/settings.local.json` deny rules blocking `Read`/`Grep`/`Glob` on any `.env` file project-wide, once real production secrets (rotated `SECRET_KEY`, `GRAPHHOPPER_API_KEY`) started going into them ahead of deployment. Note: this doesn't block reading `.env` via a raw `Bash` command like `cat` — a known gap, accepted rather than over-broadly denying `Bash`.
- 2026-07-23: Rotated `SECRET_KEY` (generated fresh via Django's `get_random_secret_key()`) and `GRAPHHOPPER_API_KEY` ahead of deploy; removed the hardcoded insecure fallback value from `settings.py` so no secret-shaped string ships in committed code.
