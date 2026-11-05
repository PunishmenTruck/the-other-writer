# AI Story Co-Writer: Build List (ideas only, nothing built yet)
Started Nov 4, 2026 with Kyle. Test with Kyle first, then a few friends using a shared link. Store choice is undecided.

## Core
- Book setup: title, genre (fiction or nonfiction), tone
- Character cards: Kyle's characters vs. ones the AI writes (name, personality, way of talking)
- Write together: Kyle gives a chunk of story, the AI continues with a line, paragraph, page, or chapter
- Story memory: running summary + character cards + last few pages sent with each request
- Edit, keep, or regenerate anything the AI wrote
- Chapters/book view, export to PDF/ebook
- Books saved on the phone

## AI and server
- Web app first, later possibly Google Play
- A small server (Apps Script) holds the AI key; never in the app or in chat
- The model is a setting: Gemini free tier for testing, Claude Sonnet 5.5 when serious
- Smart prompt caching: use it only when several writes per session are likely
- Spending cap set at the provider

## Usage and cost meter
- Top bar: Today / Week / Month cost
- Tap for breakdown: daily bars this week, weekly bars this month
- Optional daily, weekly, and monthly caps; warn at 80%, pause at 100%
- Weeks run Sunday-Saturday
- Cost preview before writing; cost shown per chapter; current model shown
- Per-user monthly token allowance; pause when it runs out, resume at the reset or after a top-up

## Cost reference (Nov 4, 2026 prices)
- One book, about 25 chapters, on Sonnet 5.5: about $2 without cache, about $1.47 with cache; heavy book about $3 vs about $1.94

## Cap reached pop-up
- When a daily, weekly, or monthly cap is hit, AI writing pauses; the book stays saved, and reading and editing by hand still work
- Pop-up shows today's usage: cost so far, tokens, chapters/pages written, plus week and month totals
- Two buttons: "Override for today" (raise the cap for that day) and "Wait till tomorrow"
- Week and month totals in the pop-up and the meter also show what's left before each cap (e.g., "Week $0.95 used, $2.05 left")
- CHANGE (Nov 4): show usage as percentages, not dollars (e.g., "Today 40% · Week 32% used, 68% left · Month 42% used, 58% left"); caps stay set in the background
- CHANGE (Nov 4): show only what's left, no "used" (e.g., "Today 60% left · Week 68% left · Month 58% left")
- CHANGE (Nov 4): the top meter, the cost preview before writing, and the per-chapter cost all use percentages too (e.g., "This chapter will use about 3% of today"), no dollars anywhere
- Meter math uses the real token counts from each response (including cache hits and writes); the preview estimate learns from recent requests, so percentages self-correct
- Scenario mode: Kyle gives a premise, the AI drafts a few chapters (count chosen first, preview shows % before running); reading and hand edits are free; edits are sent with the next AI request so it follows them
- Quick edit: hold to highlight a passage, type a plain-words change ("make him sound tougher"), the AI rewrites only that part (about 1-2% of the day vs. about 15% for a chapter); undo or try again

## Future update (not in first build)
- Audiobook mode: free phone voice first, optional AI voices (per-character), audio saved per chapter, its own % on the meter; get real voice pricing then
- Chapter pictures: 1 still AI image per chapter by default, plus an "Add more shots" option for extra scenes in that chapter; of its big moment, uses character cards for consistent looks, saved once made, own % on the meter (future update, first of the visual options)
- Extra shots capped at 4 per chapter
- Multi-user: each tester has their own usage meter and caps (set by Kyle); the shared server holds Kyle's keys; Kyle pays for everyone's text and images; admin view for Kyle shows each tester's usage % and can raise/lower limits or shut a tester off

## Play Store revenue (future)
- Free download + short free trial, then monthly subscription tiers
- Free tier: small daily allowance; watch an ad (AdMob) for more time that day, max 2–3 ads/day, each adds about 10% back to today; heavy use needs paid sub
- Rough monthly tiers (draft): Free (ads) · $4.99 Small (~10 chapters) · $9.99 Medium (~1 book) · $19.99 Large (~3 books + extras); Google takes ~15% after year 1
- Free tier details: ~20% of a paid day base; 2–3 ads/day add ~10% each (max ~50%/day ≈ 1 chapter); no chapter pics (or 1/week); no AI quick edits (hand only); weekly/monthly caps still apply; TIME LIMIT TBD with Kyle
- Free session clock: ~20 min/day of AI writing time (timer only while AI is working/waiting); reading & hand edits free; ads add ~5 min each (max 2–3); subscribers have no session clock
- CHANGE free tier (Nov 4): 1 free paragraph/day; 1 ad unlocks 1 more paragraph (max 1 ad/day); AI writing locks after 2 chapters until subscribe; no pics / no AI quick edits on free; target ~$0–$25 net for ~100 free users
- LOCKED (Nov 4): Gemini free first, Claude later; chapter pictures later with Claude; Google account sign-in; friends testing later (Kyle first); app name: The Other Writer (locked Nov 4); first genre TBD
- Meter: % left turns red at 20% left (80% used) as warning
- UI: "The Other Writer" app name; first-open + home mockups exist
- First-open to home: page-turn transition (book pages flipping)
- Settings: Account, Daily/Weekly/Monthly caps, AI model, Show dollars (owner), Sign out, notify at 20% left, Export book, Theme light/dark
- Theme: follow phone OS (auto light/dark), not a manual pick only
- Settings: Delete account + Unsubscribe
- New book: setup prompts first (Genre, Tone, Scenario, Length goal, Character choice) then Continue to write opens book Write screen
- Genre chips: Fiction, Sci-fi, Fantasy, Mystery, Thriller, Romance, Horror, Historical, Western, War, Memoir, Nonfiction
- Genre: full shelf in expandable drop-down groups (Fiction, Speculative, Crime & Suspense, Romance, Historical & Western, Real life, Other)
- Genre multi-select across groups; selected genres show as removable chips/tags
- Genres added: Noir (Crime & Suspense), Supernatural (Speculative), Military fiction (Historical & Western)
- Genre shelf worldwide (multi-select groups): Fiction (Literary General Psychological Coming-of-age Family saga Satire Absurdist Drama Poetry); Speculative (Sci-fi Fantasy Horror Supernatural Magical realism Urban fantasy Space opera Gothic Post-apocalyptic Alternate history Biopunk Solarpunk Afrofuturism); Crime & Suspense (Mystery Thriller Crime Noir True crime Political thriller Legal thriller); Romance (Romance Contemporary Historical romance Erotica); Historical & Western (Historical Western War Military fiction); Real life (Memoir Nonfiction Biography Religious Inspirational Sports Travel); Kids & YA (Kids Middle-grade YA Fairy tale Folklore); World & Other (Indigenous literature Translated fiction Adventure Comedy Dystopian Medical drama)
- Genre groups: info icon on left of each drop-down with plain-language tip (Fiction / Speculative / Crime & Suspense / Romance / Historical & Western / Real life / Kids & YA / World & Other)
- Genre group rows: info icon + name + expand arrow only; example genres live in the info tip, not in parentheses on the row
- Tone multi-select: Dark Gritty Fast-paced Lighthearted Serious Humorous Romantic Tense Calm Epic Melancholy Hopeful Cynical Whimsical Suspenseful Emotional Action-packed Introspective Soft Bleak Uplifting
- Tone: expandable multi-select groups (Dark & Heavy / Light & Warm / Pace & Energy / Emotion & Mood) with info icons; selected tones as removable tags
- CHANGE (Nov 4): Genre = one expandable "Genre" tab (info icon left) showing full worldwide genre chip list in one view; Tone = one expandable "Tone" tab (info icon left) showing all tones in one view; remove subgroup structure (Fiction/Speculative/etc and Dark & Heavy/Light & Warm/etc); multi-select removable tags stay
- CHANGE (Nov 4): New book setup = five expandable tabs each with info (i) left: Genre, Tone, Scenario (box: Describe your story world), Length goal (Short / Novella / Full), Character choice (Scenario fills them / Add my own / Copy from book); genre & tone multi-select removable tags; Continue to write
- CHANGE (Nov 4): Length goal options = Flash fiction, Short, Novelette, Novella, Full, Chapter book
- CHANGE (Nov 4): Genre tab reverts to nested groups inside one Genre tab (Fiction, Speculative, Crime and Suspense, Romance, Historical and Western, Real life, Kids and YA, World and Other); each group row has info (i) + name + expand; tap group to show that group's genres; flat all-genres chip grid removed; Tone stays one flat tab
- CHANGE (Nov 4): Genre navigation = Genre (one top-level tab) → subgroup tabs (Fiction, Speculative, Crime and Suspense, Romance, Historical and Western, Real life, Kids and YA, World and Other, each with info tip) → genre list for that subgroup; drill-down tabs not accordion rows and not flat all-genres grid; Tone stays one flat tab
- CHANGE (Nov 4): Character choice → Add my own opens Character builder (name, short description, role: Protagonist / Sidekick / Antagonist / Other); Save adds character to the book as a removable tag like genre/tone tags; Scenario fills them and Copy from book unchanged
- CHANGE (Nov 4): Character builder fields = Name, Age, Appearance, Short description, Role (Protagonist / Sidekick / Antagonist / Other); all fillable; Save → character tag on the book
- CHANGE (Nov 4): Character builder roles = Protagonist, Sidekick, Antagonist, Mentor, Love interest, Rival, Ally, Villain, Antihero, Narrator, Supporting, Minor, Custom
- CHANGE (Nov 4): New book setup + Character builder mockups shown in dark mode (dark bg, light text, dark chips/tabs, orange accents); theme still follows phone OS light/dark
- CHANGE (Nov 4): Character builder adds Backstory or motivation (free text); Voice or personality dropdown (Bold, Shy, Sarcastic, Stoic, Charismatic, Mysterious, Hot-headed, Gentle, Custom); Relationship dropdown (None or link to another character already on the book)
- CHANGE (Nov 4): Scenario fills them — if book has no characters, generate starter cast from scenario text as removable/swappable tags; if characters already on the book, suggest from those instead; Add my own and Copy from book unchanged
- CHANGE (Nov 4): New book setup has Book title field at top above Genre; editable; placeholder "Untitled" when empty
- CHANGE (Nov 4): New book Save draft button near Continue to write; saves mid-setup progress (book title, genres, tones, scenario, length goal, character choices) so user can return later with fields still filled
- CHANGE (Nov 4): New book Skip setup button → blank writing screen (bypasses genre/tone/scenario/length/characters); warning near button e.g. "You can always add genres, tones, and scenarios later in settings"; Settings includes option that reopens same New book setup to add/edit those after skipping
- CHANGE (Nov 4): Subtle typewriter/pencil sound feedback on New book setup + related UI; soft brief sounds on main taps (open tabs, select genre/tone, save), not every micro-interaction; feel like the story is being written as user goes
- CHANGE (Nov 4): Soft realistic paper page-turn sound when flipping pages on the writing screen; quiet non-annoying like typewriter taps, not cartoonish
- CHANGE (Nov 4): Page-turn sound plays on ALL screen-to-screen navigation (home, settings, writing, any transition), not only writing-page flips; still soft realistic non-cartoonish
- CHANGE (Nov 4): Settings mockup (dark) — Edit book setup row reopens New book setup (title, genres, tones, scenario, length, characters); other settings TBD
- CHANGE (Nov 4): Main Settings (home bottom tab Home/Characters/Settings): Account (Google), Age confirmation 18+, Edit book setup, Daily/Weekly/Monthly caps, AI model, Theme follow phone, Notify at 20% left, Export book, Show dollars (owner), Unsubscribe, Delete account, Sign out; dark mode mockup
- CHANGE (Nov 4): Settings Sound section — toggles for typewriter/pencil feedback and page-turn sound, both ON by default
- CHANGE (Nov 4): Settings Sound — separate toggles for typewriter sound and pencil writing sound (either or both; both ON by default); page-turn toggle unchanged
- CHANGE (Nov 4): Settings Font option for writing screen — serif, sans-serif, monospace, handwritten-style; small preview of each
- CHANGE (Nov 4): Settings Font picker expanded scrollable list with name + preview: Serif (Georgia, Times, Palatino); Sans (Arial, Helvetica, Verdana, Open Sans); Mono (Courier, Monaco, Consolas); Display (Impact, Playfair, Garamond); Script (Pacifico, Dancing Script, Indie Flower)
- CHANGE (Nov 4): Settings Font color for writing screen — soft white (default), warm cream, light gray, pale yellow, muted blue; each with swatch + sample text preview
- CHANGE (Nov 4): Optional app-wide Leather-bound theme — dark brown raised texture + gold trim accents; applies home, settings, writing, characters; selectable alongside dark mode (and OS follow theme)
- CHANGE (Nov 4): Writing screen background picker — lined paper, parchment, dot grid, watercolor, blank cream, washi (old Japanese handmade paper); each with preview; default blank cream or lined
- CHANGE (Nov 4): Writing backgrounds add Vellum (smoother animal-skin paper, refined vs parchment); picker = lined, parchment, dot grid, watercolor, blank cream, washi, vellum
- CHANGE (Nov 4): Writing backgrounds add rice paper (light translucent), newsprint (old-newspaper grit), blueprint (blue-tinted); full picker = lined, parchment, dot grid, watercolor, blank cream, washi, vellum, rice paper, newsprint, blueprint
- CHANGE (Nov 4): Writing backgrounds add carbon copy (purple-ink duplicate) and construction paper (bold colorful); onion skin out; twelve total = lined, parchment, dot grid, watercolor, blank cream, washi, vellum, rice paper, newsprint, blueprint, carbon copy, construction paper
- CHANGE (Nov 4): Font color is paper-aware — each writing background has its own readable/tone-matched font color set; clashing colors locked/hidden for that paper; blank cream default keeps soft white, warm cream, light gray, pale yellow, muted blue
- CHANGE (Nov 4): Writing backgrounds — replace dot grid with typewriter paper (classic white slight texture, optional binder holes); twelve = lined, parchment, watercolor, blank cream, washi, vellum, rice paper, newsprint, blueprint, carbon copy, construction paper, typewriter paper
- CHANGE (Nov 4): Each writing background has short sidebar blurb + preview: lined "classic notebook structure"; parchment "old manuscript feel"; watercolor "soft artistic wash"; blank cream "zero distraction"; washi "handmade Japanese paper"; vellum "medieval scrolls and documents"; rice paper "light and translucent"; newsprint "old newspaper grit"; blueprint "architectural plans"; carbon copy "duplicate office look"; construction paper "bold and colorful craft feel"; typewriter paper "classic retro typing"
- CHANGE (Nov 4): Writing background sidebars = origin only (not feel blurbs): lined 19th century notebooks; parchment medieval Europe; watercolor Renaissance art; blank cream no origin; washi Japan; vellum animal skin medieval era; rice paper ancient China; newsprint 1800s newspapers; blueprint 19th century engineering; carbon copy early 1900s offices; construction paper early 1900s schools; typewriter paper 20th century offices
- CHANGE (Nov 4): Origin sidebars only on unfamiliar papers: washi (Japan), vellum (animal skin, medieval era), typewriter paper (20th century offices); no sidebars on lined, parchment, watercolor, blank cream, rice paper, newsprint, blueprint, carbon copy, construction paper; all still have previews
- CHANGE (Nov 4): Rename writing background "blank cream" → "blank" (same plain off-white page); paper-aware font default set for blank still uses original five shades
- CHANGE (Nov 4): Paper-aware font colors (contrast-checked). Lined 7: ink black, dark brown, warm charcoal, deep sepia, navy, forest green, burgundy. Parchment 6: ink black, dark brown, deep sepia, warm charcoal, forest green, burgundy. Watercolor 6: ink black, warm charcoal, dark brown, navy, forest green, burgundy. Blank 6: ink black, dark brown, warm charcoal, deep sepia, navy, burgundy (old soft white/cream/pale yellow/light gray fail on off-white; muted blue too weak — locked). Washi 6 / Vellum 6: ink black, dark brown, deep sepia, warm charcoal, forest green, burgundy. Rice paper 6: ink black, dark brown, warm charcoal, navy, forest green, burgundy. Newsprint 5: ink black, dark brown, navy, forest green, burgundy. Blueprint 6: soft white, warm cream, light gray, pale yellow, muted blue, light cyan. Carbon copy 5: ink black, dark brown, warm charcoal, deep purple, navy. Construction paper 5: ink black, soft white, warm cream, warm charcoal, navy. Typewriter paper 6: ink black, dark brown, warm charcoal, navy, forest green, burgundy. No paper under 3 colors.
- CHANGE (Nov 4): Font picker — Bold and Italic toggles/sub-options under each font where available (Georgia, Times, Palatino, Arial, Helvetica, Verdana, Open Sans, Courier, Monaco, Consolas, Impact, Playfair, Garamond, Pacifico, Dancing Script, Indie Flower); scrollable name + preview unchanged
- CHANGE (Nov 4): After New book Continue to write → first chapter title step (text field, placeholder "Chapter 1" or "Untitled Chapter"); Continue then opens writing screen with chapters sidebar; New book setup fields unchanged
- CHANGE (Nov 4): Skip setup still goes through first chapter title step (placeholder Chapter 1 / Untitled Chapter) before writing screen; skip-setup warning unchanged
- CHANGE (Nov 4): Settings Reading speed (WPM) near Font / Font color — number field or slider; default ~200–250 WPM; writing screen reading-time estimate (e.g. "about twenty minutes to read") uses this personal pace
- CHANGE (Nov 4): Writing screen reference panel — corner icon opens slide-over showing active scenario, genres, tones, characters the AI is using; editable in-panel without leaving write page; dark mode
- CHANGE (Nov 4): Writing screen auto-save while typing + subtle "saved" indicator; no manual save required
- CHANGE (Nov 4): Home My books — long-press or swipe to trash or archive a book; archived books can be restored later
- CHANGE (Nov 4): Home — New book always pinned top-left (never scrolls away); user's books in horizontal swipeable row/grid (e.g. six books); dark mode; bottom tabs Home / Characters / Settings
- CHANGE (Nov 4): Writing screen built-in spell check — flags misspellings as user types, offers fix suggestions; works across all paper backgrounds and font choices
- CHANGE (Nov 4): Expanded automated test suite required — buttons responsive; dark mode all screens; sounds no overlap; settings/drafts persist; multi-select genre/tone tags; nested genre drill-down; character builder → tags; chapter title after Continue and Skip; reference panel edit; auto-save indicator; trash/archive/restore; search books; 12 paper backgrounds; font bold/italic; paper-aware font color locks; reading speed → estimate; leather-bound all screens; page-turn on all nav; typewriter & pencil toggles independent — plus speed, accuracy, spell check
- LOCKED (Nov 4): Local prototype at /workspace/story-app/ (src/index.html); TEST-RESULTS.md 88/88 pass; AI Keep/Redo/Quick edit not wired to real model yet; construction paper contrast only borderline — Kyle to decide keep or drop light/dark inks

- CHANGE (Nov 4): Construction paper dropped (contrast too tight). Eleven papers remain: Lined, Parchment, Watercolor, Blank, Washi, Vellum, Rice paper, Newsprint, Blueprint, Carbon copy, Typewriter paper. Tests now expect 11 papers (supersedes the "12 papers" test requirement).
- LOCKED (prototype note, Nov 4): Construction paper decision resolved — dropped. Google AI test model = `gemini-3.8-flash` (free-tier testing; shown in Settings as "Gemini 3.8 Flash (free test)"). App name locked: The Other Writer.

- CHANGE (Nov 4): app name locked as The Other Writer (Play-checked; no matching Google Play app found).

## CHANGE (Nov 4, 2026) — Local Gemini wired
- Keep/Redo/Quick edit now use a local Node proxy (`server/ai-proxy.js`, port 8787) that calls Gemini.
- Key via env `GEMINI_API_KEY` only (or gitignored `.env.local`) — never in the app, browser, or chat.
- Default model: `gemini-3.8-flash`.
- Production path is still an Apps Script (or similar) backend holding the key.

## Phone version (PWA — no Google Play account needed)
- The app is an installable PWA (manifest.webmanifest, sw.js, icons 192/512). AI calls use same-origin `/ai/...` paths; the Gemini key stays in the proxy (.env.local), never in the client.
- Proxy auto-retries once with `gemini-2.5-flash-lite` when the requested model returns 429/high-demand/503.
- Serve: `npm start` (port 8787) + a public HTTPS tunnel, e.g. `cloudflared tunnel --protocol http2 --url http://127.0.0.1:8787` (or `npx localtunnel --port 8787`). Tunnel URLs are temporary and only live while the box runs.
- Install on Android Chrome: 1) open the HTTPS URL, 2) ⋮ menu → Add to Home screen / Install app, 3) open "Other Writer" from the home screen.
- Status (Nov 4, 2026): box network blocked both cloudflared (edge TLS/QUIC) and localtunnel (503) — needs a different host (e.g. run on Kyle's PC, or a free static+serverless host).
- Future: Play Store APK (TWA) once Kyle has a Google Play developer account.
