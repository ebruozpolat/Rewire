# Rewire — Technical Specification

> Daily neuroplasticity practice app: rewrite the story in your head, repeat it once a day, let the new neural path outcompete the old one.
> This spec describes the **current implementation** (v1, commit `37ad8a7`) so development can continue anywhere (Cursor, etc.).

---

## 1. Overview

- **Type:** Dependency-free single-page web app. No build step, no framework, no server, no accounts.
- **Run:** Open `index.html` in a browser, or `python3 -m http.server 8000`.
- **Persistence:** Browser `localStorage` only.
- **UI language:** Turkish.
- **Status:** Fully implemented and verified end-to-end (plant → repeat → streak → reload persistence → release) via headless Chromium.

## 2. File structure

| File | Role |
|---|---|
| `index.html` | Markup: header, science note, garden SVG, composer form, story cards, repeat modal |
| `style.css` | All styling; night-garden theme via CSS custom properties |
| `app.js` | All logic in a single IIFE, ES5-compatible style, no imports |
| `README.md` | Product/concept documentation (Turkish) |
| `spec.md` | This file |

## 3. Design system

### 3.1 Color tokens (CSS custom properties in `:root`)

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0D0A1C` | Ink purple — night background |
| `--ink-soft` | `#16112B` | Raised surfaces (garden, inputs) |
| `--ink-card` | `#1B1533` | Cards, form, modal |
| `--gold` | `#D9BA79` | Champagne gold — firing synapse, flowers, accents, primary buttons |
| `--gold-dim` | `rgba(217,186,121,.35)` | Step-number chips |
| `--sage` | `#9CC79B` | Sage green — growth, stems, repeat button |
| `--lavender` | `#8F86AE` | Lavender gray — secondary text, old stories |
| `--text` | `#EDE9F4` | Primary text |
| `--danger` | `#C78A8A` | Release (✕) hover |

### 3.2 Typography

- **Fraunces** (serif) — stories, brand mark, modal story. Fallback: Georgia, serif.
- **Karla** (sans) — all UI chrome. Fallback: system-ui, sans-serif.
- Loaded from Google Fonts via `<link>`; the app degrades gracefully offline (fallbacks).

### 3.3 Other

- Radius: `--radius: 14px`; pill buttons `border-radius: 999px`.
- Layout: single centered column `min(720px, 92vw)`.
- Animations: `fire-pulse` (flower glow, 4s), `twinkle` (stars, 5s), `.just-fired` card highlight (1.6s, gold border + glow shadow).
- Responsive: below 520px the top bar and card meta stack vertically.

## 4. Data model

Stored under localStorage key **`rewire-state-v1`**:

```json
{
  "stories": [
    {
      "id": "s-<timestamp>-<rand6>",
      "oldText": "Başladığım hiçbir şeyi bitiremiyorum.",
      "newText": "Ben önemli olanı bitiren biriyim — her gün küçük bir adım.",
      "plantedOn": "2026-07-05",
      "repeats": ["2026-07-05", "2026-07-06"]
    }
  ]
}
```

Rules:
- Dates are **local-time** `YYYY-MM-DD` strings (never UTC/ISO timestamps — a repeat at 23:30 belongs to that local day).
- `repeats` contains at most one entry per day per story (enforced at write time).
- Corrupt/unparseable state → silently reset to `{ stories: [] }`.
- `sessionStorage` key `rewire-note-offset` rotates the science note within a session.

## 5. Core behaviors

### 5.1 Plant (Dik)
Two-step form (old story → new story), both required, `maxlength=280`, trimmed. Submit appends a story with `plantedOn = today`, empty `repeats`, saves, re-renders. Form resets and collapses back to the toggle button.

### 5.2 Repeat today (Bugün tekrarla)
- One conscious firing **per story per day**. `repeatedToday(story)` = `story.repeats` includes today's date string.
- Button opens a modal showing the new story in quotes with the hint "Derin bir nefes al…". Confirm (`⚡ Ateşle`) pushes today into `repeats`, saves, re-renders, and flashes the card (`.just-fired`). Cancel/backdrop-click/Escape closes without effect.
- After firing, the button becomes disabled `✓ Bugün ateşlendi` until the next local day.

### 5.3 Streak (🔥)
- Practice days = union of every story's `plantedOn` + all `repeats` entries (planting counts as that day's practice).
- Streak = count of consecutive days walking backward from **today**, or from **yesterday** if today has no practice yet (so an unbroken streak isn't shown as 0 before today's rep).
- Day arithmetic via `new Date(y, m-1, d + delta)` — local time, DST-safe.

### 5.4 Release (✕)
`confirm()` dialog quoting the story, then removes it from state. The old story is *not* archived (v1 decision — see §8).

### 5.5 Science notes (🧠)
Six hardcoded notes (Hebb's rule, myelination, spaced repetition, writing, attention, "old paths don't get deleted"). Index = `daysSinceEpoch + sessionOffset` mod 6 — rotates per day and per open within a session. Rendered via `innerHTML` (content is a hardcoded constant; never interpolate user input here).

## 6. Mind garden (SVG rendering)

`viewBox="0 0 800 300"`, ground line at y=262, re-rendered from scratch on every state change.

- **Strength** per story: `min(1, repeats.length / 21)` — saturates at 21 repeats (habit metaphor).
- **Stars:** 40 gold circles, deterministic positions (seeded mulberry32 PRNG, fixed seed) so the sky doesn't reshuffle between renders; staggered twinkle delays.
- **Plants:** evenly spaced (`gap = 800 / (n+1)`). Per story:
  - Stem: quadratic path from ground to `topY = 262 − (70 + strength × 130)` — grows taller with repeats. Slight deterministic sway seeded by story id hash. Stroke `#9CC79B`, width `1.5 + strength × 2`.
  - Two leaves (ellipses) at ~45% height.
  - Golden flower at the top: radius `4 + strength × 12`, dark center dot, plus a pulsing glow circle (`r × 2.2`) — glow opacity 0.30 if repeated today, else 0.12.
  - `<title>` tooltip: new story text + repeat count.
- **Synapse arcs:** one quadratic arc between each adjacent pair of flowers; opacity `0.15 + avgStrength × 0.55`, width `0.8 + avgStrength × 3` — connections thicken as stories strengthen.
- **Empty state:** overlay text "Bahçen henüz boş. İlk hikâyeni dik. 🌱".

## 7. Accessibility & edge cases

- Modal: `role="dialog"`, `aria-modal`, Escape closes, backdrop click closes, confirm button focused on open.
- Garden SVG: `role="img"` + aria-label; per-plant `<title>`.
- All user text rendered via `textContent` (XSS-safe). Long words: none truncated — 280-char cap keeps cards sane.
- Multiple tabs: last write wins (acceptable for v1).
- Day rollover while the page is open: a `setTimeout` fires ~50ms after local midnight and calls `renderAll()` so repeat locks, streak, and flower glow update without interaction. `visibilitychange` / `focus` re-check the calendar day in case the timer was throttled in a background tab. Science note is not rotated on midnight (only on open).

## 8. Known v1 decisions / backlog ideas

Deliberately out of scope in v1, natural next steps:

1. **Release archive** — released stories vanish; could keep a "serbest bırakılanlar" list instead.
2. ~~**Day-rollover timer**~~ — done: local-midnight `setTimeout` + visibility/focus re-check.
3. **Export/import** — JSON download/upload of `rewire-state-v1` for device migration.
4. **Longest-streak stat** and per-story milestones (7/21/66 days).
5. **Reduced motion** — honor `prefers-reduced-motion` by disabling twinkle/pulse.
6. **PWA** — manifest + service worker for offline install (fonts already degrade).
7. **Repeat reminder** — optional notification.
8. i18n — strings are inline Turkish; extract to a dict if English is ever needed.

## 9. Verification

Verified with Playwright + headless Chromium (script not committed):
empty state → plant story 1 → streak becomes 1 → plant story 2 (synapse arc appears) → repeat story 1 via modal → button locks (`✓ Bugün ateşlendi`), stats show 1 tekrar → reload → everything persists → release story 2 with confirm → card count drops. Only console errors were blocked Google Fonts requests in the sandbox (expected; fonts fall back).

## 10. Git state

- Branch: `claude/rewire-daily-practice-b2nn90`, commit `37ad8a7` ("Build Rewire daily practice app").
- Not yet on GitHub: pushes were rejected with 403 until the Claude GitHub App gets write access to `ebruozpolat/Rewire`. If you push from Cursor with your own credentials, a plain `git push -u origin claude/rewire-daily-practice-b2nn90` (or merge to `main`) will work.
