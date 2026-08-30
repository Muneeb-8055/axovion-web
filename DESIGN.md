# Axovion.io Design System

Canonical spec for the 2026 rebuild. Every page follows this. When this file and any older
guidance disagree, this file wins.

---

## Design Read

Reading this as: a conversion-focused B2B landing and marketing site for operators at
small and mid-size companies who are losing hours to manual work, with a dark, precise,
high-trust language, leaning toward AI-Native UI plus restrained cinematic motion.

The one thing a visitor should remember: **this company automates the boring parts of your
business, and they can prove it in numbers.**

### Dials

| Dial | Value | Why |
|---|---|---|
| DESIGN_VARIANCE | 8 | Premium consumer register. Asymmetric, confident, not chaotic. |
| MOTION_INTENSITY | 8 | The landing page is a scroll cinematic. Motion carries the story. |
| VISUAL_DENSITY | 4 (marketing) / 7 (admin) | Marketing breathes. Admin is a working tool. |

Admin runs a separate density because it is an operator surface, not a pitch. Everything
else in this document applies to both.

---

## Color

Dark only. No light mode. No section inverts. The whole site is one theme.

### Core tokens

```css
--ax-bg:            #0A0A0F;   /* page canvas, and the scroll-world scene background */
--ax-surface:       #12121A;   /* raised surface */
--ax-surface-2:     #161622;   /* second elevation */
--ax-border:        rgba(255,255,255,0.08);
--ax-border-strong: rgba(255,255,255,0.14);
--ax-heading:       #FFFFFF;
--ax-text:          #C0C0C8;
--ax-muted:         rgba(192,192,200,0.72);
--ax-muted-2:       rgba(192,192,200,0.56);
--ax-accent:        #00D4FF;   /* THE accent. Cyan. */
--ax-accent-dim:    #00A8CC;   /* hover/pressed state of the accent */
```

### The single-accent rule

Cyan `#00D4FF` is the only decorative accent on the entire site. It marks the primary CTA,
active nav state, focus rings, links, and key data emphasis. Nothing else.

The old palette carried cyan, blue, orange and amber as interchangeable decoration. That
reads as unfocused. Blue, orange and amber survive **only** as semantic status colors, and
only where status is genuinely being communicated:

```css
--ax-success: #10B981;   /* passed, healthy, completed */
--ax-warn:    #FBBF24;   /* attention, pending */
--ax-error:   #EF4444;   /* failed, destructive */
--ax-info:    #3B82F6;   /* neutral informational state, admin only */
```

Never use a status color for decoration. Never use cyan to mean "success."

Chart series in admin may use the full set, because charts need categorical separation.
That is the one exception, and charts must also carry non-color encoding (labels, shapes,
or direct annotation).

### Contrast floor

Body text against `--ax-bg` must clear 4.5:1. `--ax-text` at `#C0C0C8` on `#0A0A0F` clears
it comfortably. `--ax-muted-2` is for non-essential metadata only, never for body copy.
Cyan on `#0A0A0F` clears 4.5:1 for text; cyan as a **button fill** takes `#04141A` text,
not white.

---

## Typography

Retire Inter. It is the single most common AI-generated-site tell and it is currently the
body font everywhere.

```
Display + body:  Geist        400 / 500 / 600 / 700
Data + code:     JetBrains Mono  400 / 500
```

Load from Google Fonts with `display=swap`. Preconnect to both font hosts. Geist covers
headings and body; there is no third family.

### Scale

| Role | Class | Notes |
|---|---|---|
| Hero headline | `text-5xl md:text-6xl lg:text-7xl` | tracking `-0.03em`, leading `1.02`. Max 2 lines. |
| Section headline | `text-3xl md:text-5xl` | tracking `-0.02em`, leading `1.1` |
| Subsection | `text-xl md:text-2xl` | tracking `-0.01em` |
| Body | `text-base md:text-lg` | leading `1.6`, `max-w-[65ch]` |
| Small / label | `text-sm` | |
| Micro label | `text-xs` | uppercase, tracking `+0.12em`, used sparingly (see eyebrow budget) |

Numbers in any data context get `font-variant-numeric: tabular-nums`. Metrics rendered as
display figures use JetBrains Mono at 500.

Use all four weights. Only 400 and 700 is an AI tell.

Headings take `text-wrap: balance`. Use curly quotes and a real ellipsis character.

---

## Spacing, Shape, Layout

- Container: `max-w-[1400px] mx-auto`, horizontal padding `px-5 md:px-8 lg:px-12`.
- Spacing scale is 4px-based. Section rhythm on marketing pages: `py-24 md:py-32`. Admin: `py-6 md:py-8`.
- **Shape lock:** one radius system. `--radius: 16px` for cards and panels, `12px` for
  inputs and buttons, `9999px` for pills. Inner radius equals outer minus the gap. No
  other values anywhere.
- Breakpoints: 375 / 768 / 1024 / 1440. Every page is checked at all four.
- Use CSS Grid for layout. Never `w-[calc(33%-1rem)]`.
- Viewport height uses `min-h-[100dvh]`, never `h-screen`.

### Hero discipline (marketing pages)

Headline maximum 2 lines. Subtext maximum 20 words and 4 lines. CTAs visible without
scrolling. Top padding caps at `pt-24` on desktop. Maximum 4 text elements in the stack.
No trust strip, no logo wall, no feature bullets, and no pricing teaser inside the hero.
The logo wall is its own section directly below.

### Navigation

One line at desktop. Height 68px, hard cap 80px. Sticky with `backdrop-blur` (allowed here
because it is fixed, not scrolling). Active route marked with cyan, not just weight.

---

## Banned patterns

These are hard fails. They come from the taste-skill and gstack audit rules and they apply
to every page and every commit.

**Typographic and copy**
- No em-dash or en-dash anywhere in user-visible copy. Use a period, comma, colon,
  parentheses, or a plain hyphen. This includes headings, buttons, alt text, and metadata.
- No AI cliché verbs: elevate, seamless, unleash, next-gen, game-changer, revolutionize,
  delve, tapestry, supercharge, unlock the power of.
- No generic placeholder identities. No Acme Corp, no John Doe, no lorem ipsum.
- No suspiciously round statistics. Real figures carry real precision.
- No duplicate CTA intent on one page. One label per intent.

**Layout**
- No three equal feature cards in a row with an icon in a colored circle. This is the most
  recognizable AI layout in existence.
- No centered-everything sections.
- No split-header (large headline left, small explainer paragraph right) as a section header.
- No more than 2 consecutive image-plus-text-split sections.
- Any layout family appears at most once per page. Eight sections means at least four
  distinct layout families.
- Eyebrow budget: `uppercase tracking` labels are capped at `ceil(sectionCount / 3)` per
  page. The hero counts as one. No section-numbering eyebrows.
- No decorative status dots, no pills overlaid on images, no scroll cues, no version
  labels, no locale or time strips.
- Bento grids carry exactly as many cells as there are content items, and at least two
  cells must differ visually from the rest.

**Visual**
- No purple or indigo gradients. No mesh-gradient glow blobs. The existing `AuroraBg`
  component is exactly this tell and is being replaced.
- No decorative blobs, waves, or SVG dividers.
- No emoji as interface elements. Icons come from `lucide-react` only, one consistent
  `strokeWidth` of 1.5.
- No fake product screenshots built out of divs. Use a generated image or nothing.
- Cards must earn their existence. Where a card adds no hierarchy, use `divide-y`,
  `border-t`, or plain spacing instead.

---

## Motion

Motion must communicate hierarchy, story, feedback, or state. "It looked cool" is not a
reason. Every animation should survive the question "what does this tell the user?"

```css
--ax-ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
--ax-ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
--ax-duration-fast: 160ms;
--ax-duration:      240ms;
--ax-duration-slow: 420ms;
```

- Scroll reveal: `translateY(24px)` plus opacity over 600ms on `--ax-ease-out`. Stagger
  siblings at 60ms.
- Hover: 200ms to 300ms. Pressed: `scale(0.98)` or `translateY(-1px)`.
- Animate `transform` and `opacity` only. Never `width`, `height`, `top`, or `left`.
  Never `transition: all`.
- **Hard ban on `window.addEventListener('scroll', ...)`.** Use IntersectionObserver, GSAP
  ScrollTrigger, or framer-motion's `useScroll`. Continuous scroll and pointer values go
  through `useMotionValue` and `useTransform`, never `useState`.
- Every motion surface honours `prefers-reduced-motion: reduce`. Parallax, the scroll
  cinematic, and any looping animation collapse to a static state.
- One marquee per page maximum. Currently that budget is unspent, and it should stay that way.

---

## The landing page scroll cinematic

The Home hero is a scroll-scrubbed camera flight built with the `scroll-world` technique:
scroll position drives `video.currentTime` through a chain of pre-rendered clips, so the
camera appears to fly continuously through five connected scenes with no cuts.

**Scene narrative** (five beats, in order):

1. **The backlog.** A cluttered operations floor at night. Stacked ticket trays, a phone
   ringing off the hook, a whiteboard dense with unfinished work.
2. **The audit.** A diagnostic room. The mess is being measured: scanning rigs over the
   ticket trays, readouts, a technician tracing a workflow.
3. **The build.** A workshop where the agents get assembled. Modular racks, a bench with
   half-built units, cabling running to a central spine.
4. **The deployment.** An integration hub. The finished agents slot into the business
   systems, conveyor lines feeding into inboxes, calendars, CRM terminals.
5. **The result.** A calm, quiet operations floor at dawn. Empty ticket trays, clean
   surfaces, one operator supervising a wall of green readouts.

**Art direction contract.** Every scene still is generated with a byte-identical style
preamble. The preamble is the only thing keeping the world coherent, so it is never
paraphrased between scenes:

> Isometric low-poly 3D diorama floating as a small rounded island on a plain solid #0A0A0F
> background with a soft contact shadow. Soft matte clay 3D render, rounded toy-model
> shapes, cool moonlight studio lighting with cyan #00D4FF practical accents, tilt-shift
> miniature look. Cohesive palette of near-black, gunmetal grey, cool white and a single
> cyan accent. Highly detailed, centered composition, absolutely no text, no letters, no
> numbers, no logos. Subject: [scene-specific description].

**Technical contract.** Stills at 3:2 and 2K. Clips at 16:9, 1080p, 8 seconds per scene
dive, 5 seconds per connector. Connector endpoints use frames extracted from the actual
rendered neighbouring clips, never a re-render of the still. All clips re-encoded with
`-g 8 -keyint_min 8 -sc_threshold 0 -an -movflags +faststart` so scrubbing is
frame-accurate. Total video budget for the page: 45 MB desktop, and clips lazy-load per
band rather than upfront.

**Asset hosting.** The cinematic media (nine clips, nine mobile variants, nine poster
images, 33 MB total) is committed to the repo under `public/world/` and served from the
same origin. A fresh clone works with no configuration, which is the point: the hero is
the landing page, and it should not depend on infrastructure that can be misconfigured.

Moving the media to a CDN later costs one environment variable and no code change. Set
`REACT_APP_WORLD_CDN` to the bucket root and every asset path re-resolves through
`worldUrl()` in `src/lib/assetUrl.js`. Create React App inlines the value at build time,
so a change needs a rebuild rather than just a redeploy. The tradeoff is worth naming:
33 MB sits in git history permanently and every clone pays for it, in exchange for a
project that always works from a clone.

When a CDN base is set, the scrub engine uses `loadMode: 'src'` (assigns the URL directly
to `video.src`, no fetch) so no CORS configuration is needed on the bucket. Without a CDN
the engine uses `loadMode: 'blob'` (fetches the clip and plays from an object URL), which
is the proven same-origin path. The static reduced-motion fallback resolves poster images
through the same helper, so it works correctly in both configurations.

**Fallback.** Under `prefers-reduced-motion: reduce`, on save-data connections, or if any
clip fails to load, the hero renders the five stills as a conventional static sequence with
the same copy. The page must be fully usable and fully readable with zero video bytes
downloaded. This is not a degraded experience to be tolerated. It is a designed state.

---

## Accessibility floor

Non-negotiable, checked on every page before it is considered done.

- Every interactive element has a visible `:focus-visible` ring in cyan. Never a bare
  `outline: none`.
- Touch targets are at least 44 by 44 px with 8px of separation.
- Form inputs have real visible labels. A placeholder is never a label. Validation messages
  sit next to the field they describe and say what happened and how to fix it.
- Heading levels never skip. One `h1` per page.
- All imagery carries meaningful alt text, and decorative imagery is marked `aria-hidden`.
- Color is never the only carrier of meaning.
- Full keyboard traversal, including the mobile nav and every dialog.
- `prefers-reduced-motion` is honoured everywhere.

---

## Component conventions

- shadcn/ui primitives stay. They are restyled through tokens, not forked.
- Tailwind utilities reference semantic tokens (`bg-background`, `text-foreground`). No raw
  hex in component files. Any hex found outside `index.css` is a defect.
- Forms use `react-hook-form` plus `zod`, which are already dependencies.
- Every async surface defines four states: loading (skeleton matching the real layout),
  empty (message plus an action), error (cause plus recovery), and populated.

---

## What must not change

The redesign is visual and structural. It is not a re-architecture, and the following are
frozen without explicit approval:

- Route paths and URL slugs, including `/audit-report/:id` and every `/admin/*` route.
- Primary navigation labels.
- The backend API contract. `src/lib/api.js` request and response shapes stay as they are.
- Form field names on the audit and contact forms.
- `public/sitemap.xml` entries and existing page meta titles, which carry SEO history.
