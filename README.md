# The Other Writer — local prototype

Open `src/index.html` in a browser (or run `cd src && python3 -m http.server 8080` and go to http://localhost:8080).
Run tests: `node tests/run.js` (writes TEST-RESULTS.md).

Files: src/core.js (data and logic), src/app.js (UI), src/styles.css, src/words.js (spell dictionary), tests/run.js.

## Running with AI (The Other Writer)
One command serves the app and the AI proxy:

    GEMINI_API_KEY=your_key_here npm start
    # open http://127.0.0.1:8787

Or put `GEMINI_API_KEY=...` in `.env.local` (gitignored) and run `npm start`.
Without a key the app still works; Redo/Quick edit show "GEMINI_API_KEY is not set".
Static-only option still works: `python3 -m http.server 8080` in `src` + `npm start` for the proxy.
Tests (no real Gemini calls): `npm test`.

## Phone version (PWA — no Google Play account needed)
- The app is an installable PWA (manifest.webmanifest, sw.js, icons 192/512). AI calls use same-origin `/ai/...` paths; the Gemini key stays in the proxy (.env.local), never in the client.
- Proxy auto-retries once with `gemini-2.5-flash-lite` when the requested model returns 429/high-demand/503.
- Serve: `npm start` (port 8787) + a public HTTPS tunnel, e.g. `cloudflared tunnel --protocol http2 --url http://127.0.0.1:8787` (or `npx localtunnel --port 8787`). Tunnel URLs are temporary and only live while the box runs.
- Install on Android Chrome: 1) open the HTTPS URL, 2) ⋮ menu → Add to Home screen / Install app, 3) open "Other Writer" from the home screen.
- Status (Nov 4, 2026): box network blocked both cloudflared (edge TLS/QUIC) and localtunnel (503) — needs a different host (e.g. run on Kyle's PC, or a free static+serverless host).
- Future: Play Store APK (TWA) once Kyle has a Google Play developer account.
