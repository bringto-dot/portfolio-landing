# bringto

**[Live demo](https://bringto-dot.github.io/portfolio-landing/)**

*[Читать на русском](README.ru.md)*

A portfolio site where the site itself is the piece of work being shown. It has
to hold six earlier projects — a brutalist fashion brand, a red Japanese
restaurant, a navy-and-brass law practice, a blue CRM dashboard, a white AI
course and a Telegram bot — without the shell picking a fight with any of them.

No component library, no page builder, no UI kit. React, TypeScript and CSS.

![Hero](docs/preview/01-hero.png)

## What this project demonstrates

- **One background for the whole document, not one per section.** There is no
  `background` on any section here. A single fixed layer sits under the page and
  one controller repaints it from scroll position, blending between whatever the
  sections above and below ask for. That one mechanism produces the white-to-ink
  turn under "Мой подход", the six brand colours in the carousel, the red-to-navy
  drift under the two ways of working, and the inverted closing screen. Adding a
  seventh colour is one line in a section, not a seventh copy of a transition.

- **Scrolling the whole page costs zero React renders.** The controller writes
  CSS custom properties — `--stage`, `--stage-fg`, the glass tint — straight onto
  the document element and never touches state. Everything that needs to know
  what colour the page currently is reads those in CSS. It also skips the write
  entirely when the value has not changed, so a full-viewport background repaint
  only happens while the colour is genuinely moving.

- **A foreground that is derived rather than hard-coded.** Which of black or
  white the text takes is decided from the background's WCAG relative luminance,
  with the switch centred on L≈0.18 — the point where white text and black text
  have exactly equal contrast, not the "50% grey" that intuition suggests and
  that picks the wrong colour on everything in between. The secondary and
  tertiary text tiers are then mixed *back into* the current background instead
  of being two fixed greys, which is what makes one page legible on white, on
  ink, on deep red, on navy, on yellow and on light blue. Two fixed greys tuned
  for a near-black page put tertiary text at about 1.6:1 on the red one.

- **8.66 MB of project renders down to 0.60 MB.** A build script crops the
  caption baked into each source render — it duplicates the title the page
  already shows and, being pixels, cannot follow the language switch — normalises
  everything to a single 16:10 frame so the card never letterboxes, and emits
  AVIF and WebP at three widths behind `srcset`. One card at 1280px costs about
  22 KB. Dimensions ship in the markup, so there is no layout shift.

- **A figure that argues the same thing its caption does.** The decorative half
  of "Мой подход" is a field of 936 points that begins scattered and resolves,
  as the section crosses the viewport, into a twelve-column layout grid with real
  gutters — an idea becoming a structure. An even lattice would have been a dot
  texture; the grid is the thing a developer actually means by structure. Canvas,
  one rAF loop, and the cursor carries both a lens and a light through it.

- **Text that is written rather than faded in.** The three paragraphs about how
  I work arrive a word at a time, with a longer pause after a full stop than
  after a comma. Deliberately not character by character: at 750 characters, any
  speed slow enough to read as typing is six seconds of watching a cursor. Every
  word is in the DOM from the first frame and only its opacity changes, so
  nothing reflows while it runs and a screen reader gets the whole text at once.

- **An accordion whose control is its own divider.** No rotating chevron, no
  plus-minus. The hairline under a question draws itself across in full ink as
  the row opens, and shows a short leading stroke on hover so the mechanism is
  visible before you commit to it. The seam opening is a better description of
  what is happening than an icon standing next to it.

- **A card fan solved from the text outwards.** Five contact cards overlap in a
  fan, and the overlap is load-bearing: a card's backdrop blur has the card
  behind it to work on, which is the only honest way to do glass on a white
  page. A card's name sits in a top corner, so left-aligning all five hid the
  names of the two on the right behind the middle one. The pair on the right is
  mirrored — symmetric composition, symmetric contents.

- **Real i18n, not a plugin.** One typed dictionary per language, so a missing
  string is a compile error rather than a blank spot in whichever language nobody
  thinks to check. The choice is detected on first visit, kept in
  `localStorage`, and drives `<title>`, `lang` and the meta description. Both
  font families ship one `@font-face` per unicode range, so an English reader
  never downloads the Cyrillic subset.

## Screens

| | |
|---|---|
| ![Projects](docs/preview/02-projects.png) | ![Approach](docs/preview/03-approach.png) |

![Contact](docs/preview/04-contact.png)

## Notes on behaviour

`prefers-reduced-motion` is honoured everywhere and is not a switch that turns
animation off and leaves the layout broken: the two-way approach section drops
its sticky travel and becomes a plain two-column comparison, the point field
draws its resolved grid once, the typed paragraphs are simply present, and the
services list sits at full contrast. Without JavaScript the page is ordinary
visible content rather than a column of empty sections — `.reveal` only hides
itself under a class added at boot.

The carousel answers arrow keys while it is the thing on screen, takes a swipe,
and keeps every card that is not showing out of the tab order with `inert`.
Focus rings are drawn in the current foreground, because a fixed blue ring
disappears on two of the six project colours.

## Stack

React 19 + TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`, tokens in
`@theme`), `motion` for animation, `sharp` for the image pipeline. Self-hosted
Manrope and Inter — a display face and an interface face, rather than one
grotesk asked to do both jobs.

The whole page — every project render, both font families, all the JavaScript —
transfers about 300 KB over fifteen requests. Gzipped, that is 60 KB of React,
46 KB of `motion`, 20 KB of application code and 8 KB of CSS, in separate chunks
so a copy edit does not invalidate the cached vendor code.

```bash
npm install
npm run dev       # localhost:5173
npm run build     # tsc --noEmit && vite build
npm run images    # regenerate public/projects from assets/projects
```

Deployed to GitHub Pages from `main` by `.github/workflows/deploy.yml`.
