---
name: frontend-design
description: "Design direction for the IT PMO Kanban board in index.html. Use when changing how the board looks or reads, such as layout, colour, type, cards, columns, the Add Task form, filters, toasts, empty states or any interface copy. Keeps the work inside this project's single-file, no-external-resources, corporate-blue constraints."
license: Apache-2.0. Complete terms in LICENSE.txt.
---

# Frontend design for the IT PMO Kanban board

This is the `frontend-design` skill from
[anthropics/skills](https://github.com/anthropics/skills) (commit `683bc88`),
rewritten for this project. The general guidance is kept where it still
applies. Where the original leaves a choice open that this project has already
made, the choice is stated here so it is not reopened by accident.

Use it together with `high-end-visual-design`, which covers finish: depth,
motion and small detail. If the two disagree, the order is: the user's own
words, then the fixed rules below, then this skill, then that one.

## The subject

- **What it is.** A single-page Kanban board for a fictitious bank's IT project
  management office. It is a demo and training tool.
- **Who uses it.** PMO analysts, project managers and trainees. They scan it for
  status many times a day and act on one card at a time.
- **Its job.** Show at a glance where work is stuck, and let someone move, add
  or remove a task in one step.
- **Its vernacular.** Workstreams, UAT sign-off, cutover rehearsals, CVE
  patching, vendor contracts, attestations, overdue items. Sample content should
  sound like this. Draw on it for any new copy or example data.

This is a tool, not a landing page. There is no hero. The first thing a viewer
sees is the masthead: the "IT PMO" wordmark, the live counts, and the bar that
shows how tasks split across the four columns. A design change that pushes the
board down the page to make room for a headline is the wrong change.

## Fixed by the brief

These came from the project owner. Do not trade them away for a design idea.
`node .github/scripts/check-page.mjs` enforces most of them and runs in CI.

| Rule | What it means in practice |
|---|---|
| One file | All markup, one `<style>` block and the script live in `index.html`. It must open by double-click. |
| Vanilla only | No frameworks, no Tailwind, no build step. Write plain CSS classes, not utility strings. |
| No external resources | No CDN scripts, web fonts or image files. Icons are inline SVG or Unicode glyphs. The only outside host is `formsubmit.co`. |
| Corporate blue palette | Navy and blue, with red, amber and grey reserved for priority and overdue. No second accent hue. |
| Neutral identity | The wordmark is the text "IT PMO". No real bank's name, logo, colours or lookalike branding, anywhere. |
| No persistence | State is in memory. No browser storage, no cookies. The note saying a refresh resets the board stays visible. |
| No native dialogs | No `alert()` or `confirm()`. Confirmation happens inline, as with "Delete? Yes / No". |
| No `!important` | Fix the cascade instead. The `[hidden]` rule stays last in the stylesheet for this reason. |
| Four fixed columns | Backlog, In Progress, Blocked, Done, in that order, side by side from 768px up and stacked below. |

## The design system that already exists

Read the `:root` block at the top of the `<style>` in `index.html` before
designing. Extend it; do not start a new one.

- **Colour tokens.** `--navy-900` to `--navy-700` for the masthead and dark
  surfaces. `--blue-700` to `--blue-50` for actions, lanes and tints. `--page`,
  `--surface`, `--line`, `--ink`, `--ink-muted` for the working area. Red, amber
  and grey tokens carry meaning only.
- **Spacing.** `--space-1` (4px) to `--space-7` (48px). Use the tokens, not new
  pixel values.
- **Radii.** `--radius-lg` for containers (lanes, panels), `--radius-md` for
  what sits inside them (cards, inputs, buttons), `--radius-sm` for the smallest
  parts (tags, small buttons), `--radius-pill` for pills and badges. Radius
  marks hierarchy. Do not give everything the same one.
- **Type.** One system font stack in `--font`, and a five-step scale from
  `--text-xs` to `--text-xl`.
- **Semantic colour.** Critical is red, High is amber, Medium is blue, Low is
  grey, on the card's left border and again in words on the pill. Overdue is a
  red badge with the word "Overdue". Colour is never the only signal.
- **The one bold element.** The proportional bar under the summary counts, with
  swatches in the legend that match its segments. "Blocked" is hatched so it
  reads without relying on hue. This is where the page spends its boldness.
  Keep everything around it quiet. A second showpiece competes with it; if a
  new idea deserves the spot, replace the bar rather than adding to it.

If a new colour or size is needed, add it as a token on `:root` with a name
that says its role, then use the token. No literal colours in component rules.

## Where the design freedom is

- New surfaces: a task detail view, an edit form, empty and error states,
  a help panel.
- Hierarchy and density inside cards, columns and the form.
- States: hover, focus, pressed, dragging, drop target, disabled, sending, invalid.
- Small typography: weights, spacing, numerals, wrapping.
- Every word in the interface.

## Typography without choosing a typeface

Web fonts cannot be loaded, so the system stack is fixed. Personality comes
from how the type is set.

- Keep to the scale tokens. Contrast comes from weight and size steps, not from
  extra sizes in between.
- Use `font-variant-numeric: tabular-nums` wherever digits line up or change:
  counts, task IDs, dates, character counters.
- Sentence case for headings, labels and buttons that are new. No all-caps
  labels, and no eyebrow label above a heading unless it tells the reader
  something the heading does not.
- No monospace face for IDs or small data. The system sans with tabular
  numerals is the house style.
- Do not accent one word of a heading in a different weight or colour.
- Running text stays under about 80 characters a line. Long task titles and
  names must wrap inside the card (`overflow-wrap: anywhere`), never overflow it.

## Structure is information

Every border, badge, label and divider on the board encodes something: priority,
overdue, a count, a field name. Before adding a structural device, name what it
tells the reader. If it tells them nothing, leave it out. Numbered markers are
only for content that is a real sequence, which the four columns are not.

## Motion

Use motion to answer an action: a card lifted for dragging, a column accepting a
drop, a menu opening, a toast arriving. Nothing should animate on its own.

One project-specific trap: `renderBoard()` rebuilds the whole board from state
on every change. A CSS entrance animation on `.card` therefore replays on every
card each time anything moves. Animate only elements that persist between
renders (masthead, panel, toasts), or mark the one card that changed through
state and animate that class alone.

Everything animated needs an `@media (prefers-reduced-motion: reduce)` rule
that turns it off. `high-end-visual-design` has the easing and timing details.

## Looks to steer away from

Generated interfaces cluster around a few defaults. The palette and identity
here are fixed, so most of them are already ruled out, but these still creep in:

- Content chopped into identical rounded cards with the same soft grey shadow
  under each, and gradient washes as decoration.
- A tracked-out capitals label above every heading.
- Metadata joined with middle dots ("A · B · C"). The card uses labelled rows.
- An arrow appended to link and button text.
- Near-black (`#111`) standing in for the navy ink token.
- A big number with a small label as the default way to present anything. The
  summary strip earns it because those counts are the point of the header.
  Do not repeat the treatment elsewhere.

## Process

1. **Read first.** The `:root` tokens, the CSS for the component you are
   changing, and the function that renders it. Card markup lives in
   `renderCard()`, columns in `renderColumn()`, the header counts in
   `renderSummary()`.
2. **Plan briefly.** Which existing tokens the change uses, any token it adds,
   and for a layout change an ASCII wireframe at desktop and phone width. State
   the alignment.
3. **Review the plan against this file.** If part of it is what you would
   produce for any dashboard, revise that part for this board. Check it against
   the fixed rules.
4. **Build inside the existing structure.** CSS goes in the one `<style>` block,
   in the numbered section it belongs to. Watch selector specificity so a
   component rule and a modifier do not cancel each other. Any user-supplied text
   placed in HTML goes through `escapeHtml()`.
5. **Check the result.**
   - `node .github/scripts/check-page.mjs` passes.
   - Look at it at 1440px and 390px wide. Nothing scrolls sideways.
   - Tab through it. Focus rings are visible, including on the navy masthead.
   - Drag a card, use **Move ▸**, add a task, trigger a validation error, delete
     a card.
6. **Update the screenshot** at `docs/screenshot.png` if the change is visible in
   the default view. The README shows it.

Before finishing, look at the result once more and remove one thing.

## Writing in the interface

Words are there to make the board easier to use. Write from the user's side.

**Keep these labels exactly.** They are part of the brief:

| Element | Text |
|---|---|
| Header button and form submit | `+ Add Task`, `Add Task` |
| Submit button while the email call runs | `Sending…` |
| Keyboard move control | `Move ▸` |
| Delete confirmation | `Delete?` `Yes` `No` |
| Overdue badge | `Overdue` |
| Email failure toast | `Card added locally — email notification failed` |
| Column names | `Backlog`, `In Progress`, `Blocked`, `Done` |

For new copy:

- Name things as a project manager would: tasks, columns, assignee, due date.
  Not state, array, render or endpoint.
- A control says what it does. An action keeps one name from button to toast:
  the button says "Add Task", the toast says "Task ITPM-0009 added to Backlog".
- Errors say what is wrong and how to fix it, under the field, without
  apologising: "The due date cannot be in the past."
- An empty column tells the user what to do next: "No tasks. Drag a card here,
  or use Move on a card."
- Plain verbs, no filler. Each piece of text does one job.
- Sample people, projects and tasks stay fictitious and plausible. No real
  company names.

## Quality floor

Build to this without announcing it:

- Works from 390px to wide desktop, with at least 16px side gutter.
- Every control reachable and usable by keyboard, with a visible focus ring.
- Icon-only buttons have an `aria-label`. Every input has a `<label for>`.
- Text contrast of at least 4.5:1, including muted text on tinted lanes and
  light text on navy.
- Reduced motion respected.
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<form>`, real headings in order.
