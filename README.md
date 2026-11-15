# make.fun — open calls

A dependency-free, static bounty explorer with a responsive dark interface,
live pots, competition details, leaderboards, and public builder profiles.

Run `node serve.ts` and open http://localhost:8080. There is no install or build
step. Routes are `#/`, `#/bounty/<slug>`, `#/leaderboard/<slug>`, and
`#/profile/<handle>`. Bounty pages link to standings; entrants link to profiles.
All API requests are read-only GETs to https://make.fun/api. Responses are
cached for one minute, then conditionally revalidated using ETags. Concurrent
requests are deduplicated, and stale route requests cannot replace newer views.

## Packaging and screenshots

The starter's `main.ts`, `serve.ts`, and `vendor/` are unchanged. After adding
the three screenshots described in `shots.json`, package with:

```
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots must be actual 1280×800 renders of live data, each ≤256 KiB.
Wait for `window.__shotReady === true` before capturing. It remains false for
loading and error states.

## Live verification

The three screenshots in `screenshots/` are verified 1280×800 live-data renders
(JPEG quality 80), with successful API responses and route DOM checks. The
`#/profile/mochhidayah` account view also passed its live-data check.

Capture tooling lives outside this repository in `../tools/`. Its local CONNECT
relay supplies upstream authentication in memory without logging credentials;
Chromium uses the relay without credentials. The capture script serves the app
on port 8904, waits for screenshot readiness, and stops its server when finished.
The relay must be started separately and stopped by PID after capture.

Packaging with `main.ts` succeeds and produces `out/app/`, three files in
`out/screenshots/`, and `out/dossier.json`.
