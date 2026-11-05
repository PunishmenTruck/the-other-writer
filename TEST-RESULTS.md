# Test Results — AI Story Co-Writer local prototype

Run: 11/5/2026, 7:03:39 AM (CT) · Node v20.19.2 · jsdom for UI/state tests · command: `node tests/run.js`

**Overall: 90 passed, 0 failed (90 tests, 22 categories)**

| Category | Result | Passed | Failed |
|---|---|---|---|
| A) SPEED | PASS | 6 | 0 |
| B) ACCURACY | PASS | 15 | 0 |
| C) SPELL CHECK | PASS | 24 | 0 |
| 1) No hanging / unresponsive buttons | PASS | 6 | 0 |
| 2) Dark mode on every screen | PASS | 2 | 0 |
| 3) Sound effects: no overlap / no cut-out | PASS | 3 | 0 |
| 4) Data persistence across reload | PASS | 3 | 0 |
| 5) Multi-select genre & tone tags | PASS | 2 | 0 |
| 6) Nested genre drill-down | PASS | 2 | 0 |
| 7) Character builder saves & shows tags | PASS | 3 | 0 |
| 8) First chapter title step — both flows | PASS | 2 | 0 |
| 9) Reference panel | PASS | 2 | 0 |
| 10) Auto-save indicator | PASS | 1 | 0 |
| 11) Trash / archive / restore | PASS | 3 | 0 |
| 12) Search across books | PASS | 2 | 0 |
| 13) Background picker — 11 papers | PASS | 2 | 0 |
| 14) Font picker bold/italic | PASS | 2 | 0 |
| 15) Font color paper-aware locking | PASS | 2 | 0 |
| 16) Reading speed → reading time | PASS | 2 | 0 |
| 17) Leather-bound theme | PASS | 1 | 0 |
| 18) Page-turn on all navigation | PASS | 3 | 0 |
| 19) Typewriter & pencil toggles independent | PASS | 2 | 0 |

## SPEED timings (avg ms per op; threshold 500 ms)

| Operation | ms | Over 500ms? |
|---|---|---|
| spellcheck 1,040-word clean sample | 0.326 | no |
| spellcheck 330 words w/ 120 typos + suggestions | 5.114 | no |
| paper-aware color lookup ×11 papers | 0.183 | no |
| auto-save serialize+persist (~3 MB state) | 5.469 | no |
| navigation state change (go) | 0.006 | no |
| UI render: settings screen (jsdom) | 10.153 | no |

## A) SPEED — PASS (6/6)

- PASS — spellcheck ~1,000 words of clean text
- PASS — spellcheck 300 words with 30 typos (suggestions)
- PASS — paper color lookup (all 11 papers)
- PASS — auto-save serialize (20 books × 25 chapters)
- PASS — navigation state change
- PASS — full UI render of settings screen

## B) ACCURACY — PASS (15/15)

- PASS — 11 papers in the locked order
- PASS — every paper has ≥3 colors
- PASS — color counts match build list (7,6,6,6,6,6,6,5,6,5,6)
- PASS — blank locks soft white, warm cream, light gray, pale yellow, muted blue
- PASS — blueprint has light colors (incl. light cyan) and locks ink black
- PASS — pale yellow locked on blueprint? no — available; locked on carbon copy
- PASS — all available colors pass WCAG ≥3:1 contrast on their paper
- PASS — length goals exact
- PASS — genre subgroups exact (8)
- PASS — every subgroup has an info tip
- PASS — added genres in right groups (Noir, Supernatural, Military fiction)
- PASS — origin sidebars only on washi/vellum/typewriter
- PASS — character choice + roles + voices per build list
- PASS — skip-setup flow still routes to chapter title step
- PASS — default WPM within 200–250

## C) SPELL CHECK — PASS (24/24)

- PASS — correct prose not flagged
- PASS — contractions/possessives/numbers not flagged
- PASS — flags "teh" and suggests "the"
- PASS — flags "writting" and suggests "writing"
- PASS — flags "recieve" and suggests "receive"
- PASS — flags "seperate" and suggests "separate"
- PASS — flags "definately" and suggests "definitely"
- PASS — flags "becuase" and suggests "because"
- PASS — flags "wierd" and suggests "weird"
- PASS — flags "freind" and suggests "friend"
- PASS — flags "untill" and suggests "until"
- PASS — flags "tommorow" and suggests "tomorrow"
- PASS — flags "thier" and suggests "their"
- PASS — flags "adn" and suggests "and"
- PASS — flags "wiht" and suggests "with"
- PASS — flags "lettr" and suggests "letter"
- PASS — flags "chaptr" and suggests "chapter"
- PASS — flags "castel" and suggests "castle"
- PASS — flags "knigth" and suggests "knight"
- PASS — flags "dragn" and suggests "dragon"
- PASS — capitalized typo flagged with fix (Teh→the)
- PASS — reports index positions
- PASS — checker works across all 11 papers × 16 fonts × bold/italic (settings don’t break it)
- PASS — UI writing screen shows misspelling + fix button that corrects text

## 1) No hanging / unresponsive buttons — PASS (6/6)

- PASS — every data-action on every screen has a handler and clicking each does not throw
- PASS — primary flow click-through: New book → Save draft → Continue → Chapter Continue → Keep/Redo/Quick edit
- PASS — AI redo: proxy error shows error text, no pending set
- PASS — AI quick edit rewrites pending draft only
- PASS — Settings toggles respond (checkbox change updates state)
- PASS — every click handler completes < 50 ms (not hanging)

## 2) Dark mode on every screen — PASS (2/2)

- PASS — each of 7 screens renders with theme-dark class and dark background rule
- PASS — default theme is dark; follow-os resolves to dark when OS is dark

## 3) Sound effects: no overlap / no cut-out — PASS (3/3)

- PASS — same channel cannot overlap (busy rejected, playing sound not cut)
- PASS — typewriter, pencil, page-turn play independently at same instant
- PASS — rapid typing (100 keys @10ms) throttled, never stacks

## 4) Data persistence across reload — PASS (3/3)

- PASS — settings survive app close/reload
- PASS — saved draft survives reload and refills setup fields
- PASS — book text survives reload; jsdom localStorage round-trip

## 5) Multi-select genre & tone tags — PASS (2/2)

- PASS — select multiple across subgroups, tags render, remove works
- PASS — tapping a selected chip toggles it off

## 6) Nested genre drill-down — PASS (2/2)

- PASS — Genre → 8 subgroup tabs → genre list → back
- PASS — each subgroup row has an info (i) tip

## 7) Character builder saves & shows tags — PASS (3/3)

- PASS — Add my own → builder with all fields → Save → tag on setup
- PASS — relationship dropdown lists existing characters; remove tag works
- PASS — Scenario fills them generates starter cast; Copy from book copies

## 8) First chapter title step — both flows — PASS (2/2)

- PASS — Continue to write → chapter title step → custom title used
- PASS — Skip setup → chapter title step → blank defaults to Chapter 1; warning shown

## 9) Reference panel — PASS (2/2)

- PASS — icon opens panel showing scenario/genres/tones/characters; edits persist; closes
- PASS — add character from panel returns to writing with tag

## 10) Auto-save indicator — PASS (1/1)

- PASS — typing shows Saving… then Saved ✓ and persists without a save button

## 11) Trash / archive / restore — PASS (3/3)

- PASS — long-press reveals menu; archive & trash hide from shelf; restore brings back
- PASS — contextmenu (long-press on touch) opens book menu
- PASS — New book stays pinned outside the scrolling shelf

## 12) Search across books — PASS (2/2)

- PASS — finds titles and chapter text across multiple books; trashed excluded
- PASS — home search box renders results

## 13) Background picker — 11 papers — PASS (2/2)

- PASS — picker shows 11 options with previews; each switches writing page bg
- PASS — origin sidebars rendered only on washi, vellum, typewriter paper

## 14) Font picker bold/italic — PASS (2/2)

- PASS — 16 fonts listed; B/I toggles only where available
- PASS — toggling bold/italic applies to writing page; unavailable style rejected & cleared on font switch

## 15) Font color paper-aware locking — PASS (2/2)

- PASS — settings shows locked swatches per paper (unclickable) for every paper
- PASS — choosing a locked color throws; switching paper auto-replaces a now-locked color

## 16) Reading speed → reading time — PASS (2/2)

- PASS — estimate changes with WPM (4,500 words: 225→20 min, 450→10 min)
- PASS — slider/number field updates writing screen label

## 17) Leather-bound theme — PASS (1/1)

- PASS — leather class applied on all 7 screens + gold trim/brown texture CSS present

## 18) Page-turn on all navigation — PASS (3/3)

- PASS — every screen-to-screen transition plays page-turn once
- PASS — no page-turn when staying on same screen; chapter flips also turn page
- PASS — page-turn toggle off silences navigation

## 19) Typewriter & pencil toggles independent — PASS (2/2)

- PASS — all four on/off combos behave independently (UI typing)
- PASS — both ON by default

## Notes
- UI tests run against the real `src/app.js` rendering in jsdom (no real browser); audio is simulated through the SoundManager player hook, so overlap/cut-out is verified by scheduling logic, not by listening.
- Spell check uses a bundled ~20k-word English list + common-typo map; rare/proper nouns may be flagged.
- Construction paper was dropped Nov 4 (contrast too tight); 11 papers remain.
- AI writing (Redo/Quick edit) calls the local Gemini proxy (server/ai-proxy.js); tests mock fetch and never call Gemini.
