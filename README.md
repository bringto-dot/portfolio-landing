# bringto

**Language:** 🇬🇧 [English](README.md) · 🇷🇺 [Русский](README.ru.md)

![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Vite](https://img.shields.io/badge/Vite-6-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8)
![Motion](https://img.shields.io/badge/Motion-12-0055FF)
![Sharp](https://img.shields.io/badge/Sharp-image%20pipeline-5C913B)

**[Live Demo](https://bringto-dot.github.io/portfolio-landing/)**

![Hero](docs/preview/01-hero.png)

A personal portfolio where the portfolio itself is part of the work being
presented.

The site brings six different projects into one interface: a brutalist
fashion concept, a Japanese restaurant, a legal practice, a CRM dashboard,
an AI course landing page, and a Telegram bot.

The challenge was not only to display them, but to make very different
visual identities coexist without flattening them into one generic
portfolio template.

## The visual system

The page uses one continuous background layer across the entire document.

As the user moves through the sections, that layer transitions between the
visual identities of the projects. The same mechanism handles the light
opening, the individual project colours, the transition between sections,
and the inverted closing state.

Sections do not own their own page background. Instead, they describe the
stage they need, while a shared controller interpolates the current
background and foreground values.

![Contact](docs/preview/04-contact.png)

## Projects as the interface

The project section is built as an interactive carousel rather than a
conventional grid of portfolio cards.

Each project carries its own visual identity into the surrounding
interface. The cards can be navigated with the keyboard or a swipe, while
cards that are not active are removed from the tab order.

The reverse side of a project card uses an opaque surface derived from the
project's own colour. This keeps the transition visually stable even when
the page moves between very different backgrounds.

![Projects](docs/preview/02-projects.png)

## A background that controls contrast

The foreground is not tied to a fixed black-or-white theme.

The interface calculates the relative luminance of the current background
and uses it to decide whether the primary text should be light or dark.
Secondary and tertiary text values are then mixed with the active
background rather than relying on two fixed grey tones.

This allows the same typography system to remain readable while the page
moves through white, near-black, red, navy, yellow, and blue stages.

The result is a single interface that changes its visual character without
requiring separate themes for every section.

## Turning a visual idea into structure

The "Approach" section uses a canvas field made from 936 points.

It begins as a scattered composition and gradually resolves into a
twelve-column layout grid as the section moves through the viewport.

The animation is deliberately tied to the meaning of the section: an
abstract field becomes a visible structure.

The canvas uses one `requestAnimationFrame` loop, with the cursor
controlling both a local lens effect and a moving light across the field.

![Approach](docs/preview/03-approach.png)

## Motion without breaking the content

Motion is used to reveal structure rather than simply make elements
appear.

The three paragraphs describing the working approach are revealed word by
word. A longer pause follows a full stop than a comma, giving the text a
natural reading rhythm.

The complete text remains in the DOM from the beginning. Only opacity
changes during the animation, so the page does not reflow while the text
is being revealed and assistive technologies still receive the complete
content.

The project also respects `prefers-reduced-motion`. Complex sections
switch to simpler layouts instead of leaving an empty or broken
composition when animation is reduced.

## Project image pipeline

Project screenshots are prepared before they reach the browser.

A build script processes the source renders by:

- removing captions that are already represented by the interface
- normalizing images to a shared 16:10 frame
- generating AVIF and WebP versions
- producing multiple widths for responsive loading
- preserving dimensions in the markup to avoid layout shift

This reduces the project image set from roughly 8.66 MB of source renders
to about 0.60 MB of generated assets.

The browser can then select an appropriate image size through `srcset`
instead of downloading the largest version for every card.

## Typography

Three typefaces are used for three different roles.

Manrope carries the main visual structure and display typography.

Inter is reserved for interface elements and supporting text.

Playfair Display appears selectively inside headings to create a contrast
between the technical structure of the interface and the more human parts
of the copy.

The emphasized words are part of the translation data, so their position
can change with the language rather than being hard-coded into the
component markup.

## Localization

The site supports Russian and English through a typed dictionary system.

A language is selected using the following priority:

1. previously saved choice
2. browser language
3. Russian or English according to the available preference

The selected language is stored in `localStorage` and controls the
interface as well as document-level metadata.

Switching languages updates:

- visible interface text
- `<html lang>`
- document title
- meta description

Because both dictionaries implement the same typed structure, a missing
translation becomes a compile-time problem rather than an empty string
appearing unnoticed in one version.

## Interaction and accessibility

The carousel supports keyboard navigation and touch gestures.

Inactive project cards are marked `inert`, keeping them out of the tab
order while another card is active.

Focus indicators use the current foreground colour instead of a fixed
colour that could disappear against one of the page's background stages.

The page also keeps its content available without JavaScript. Reveal
animations only hide their content after the application initializes, so
the document does not become a sequence of empty sections when scripting
is unavailable.

## Front-end structure

The application is divided into page sections, shared components, content
dictionaries, and the stage system responsible for the global visual
state.

```text
src/
├── components/
├── content/
├── lib/
├── sections/
├── stage/
├── App.tsx
├── i18n.tsx
├── index.css
└── main.tsx
```

The main page composes the sections through a shared `StageProvider`,
while the i18n provider supplies the active language and content
dictionary.

This keeps the page-level composition separate from the mechanisms that
control the global stage, localization, animation, and content.

## Technical foundation

The project uses:

- React 19 for the interface
- TypeScript for typed application structure
- Vite for the build system
- Tailwind CSS 4 for the styling foundation
- Motion for interface animation
- Sharp for the project image pipeline
- self-hosted Manrope, Inter, and Playfair Display fonts

There is no UI kit, component library, or page builder behind the
interface.

The visual system is built specifically for the project, including the
stage transitions, project cards, canvas composition, typography, and
responsive behavior.

## Deployment

The project is deployed to GitHub Pages from `main` through GitHub
Actions.

The production build runs TypeScript checks before Vite creates the final
bundle. Project images can be regenerated through the dedicated
image-processing script when source renders change.

## Project scope

This repository is the portfolio site itself.

The projects displayed inside it are presented as individual portfolio
works, while this application demonstrates how those different visual
systems can be brought together into one coherent interface.

The goal is not to hide the differences between projects, but to build a
shell flexible enough to preserve them.

## Result

The portfolio is designed so that the interface itself demonstrates the
same qualities it presents in the projects.

The page adapts its background, contrast, typography, motion, imagery, and
interaction model as the user moves through the work.

The result is not a neutral container for screenshots. It is another
frontend project in the portfolio, with its own visual system, interaction
design, performance considerations, responsive behavior, localization, and
accessibility built into the experience.
