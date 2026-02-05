# UI Proof of Concepts

This directory contains UI prototypes for the Ski Decision Engine. Each POC targets a specific user-facing surface from the product spec and is designed to be evaluated independently.

## Tech Stack

All POCs use the same stack for consistency:
- **React** + **Next.js** (App Router)
- **Tailwind CSS** for styling
- **Mock data** (no live APIs) — each POC includes its own fixture data
- **Mobile-first** — all layouts designed for phone screens, responsive up to tablet/desktop

## POC Structure

Each POC lives in its own directory:

```
poc/
├── README.md              ← You are here
├── BACKLOG.md             ← Epics, stories, and measurement criteria
├── 01-onboarding/         ← Setup flow (3 questions)
├── 02-main-screen/        ← Core decision screen (Your Resorts + Worth Knowing + Storm Tracker)
├── 03-resort-detail/      ← Tap-through resort detail view
├── 04-storm-chase/        ← Chase mode: national radar → region zoom → trip builder
├── 05-notifications/      ← Notification designs and timing sequences
├── 06-time-toggle/        ← Today / This Weekend / Next 5 Days / Next 10 Days
├── 07-persona-modes/      ← Persona-adaptive views (Powder Hunter vs Family vs Weekend Warrior)
└── 08-settings/           ← Profile, pass, chase preferences
```

## How to Run

Each POC can be run independently or as part of a unified app. Setup instructions will be added once the first POC is scaffolded.

## Evaluation Criteria

Every POC should be measured against:
1. **Clarity** — Can a user understand the information in <5 seconds?
2. **Decision speed** — Does it answer "where should I ski?" faster than OpenSnow?
3. **Trust** — Does the user believe the recommendation?
4. **Delight** — Does the storm tracker / powder day experience feel exciting?
5. **Scannability** — Can you extract the key info without reading every word?

See [BACKLOG.md](./BACKLOG.md) for the full epic breakdown and acceptance criteria.
