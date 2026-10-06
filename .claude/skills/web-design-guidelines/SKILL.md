---
name: web-design-guidelines
description: "Audit the IT PMO Kanban board (index.html) against the Vercel Web Interface Guidelines for accessibility, focus, forms, animation, touch, drag and drop, content handling and copy. Use when asked to review the UI, check accessibility, audit the design or UX, or run a final check before publishing. Reports terse index.html:line findings and applies this project's fixed rules, so it never recommends something the brief forbids."
metadata:
  author: vercel (adapted for this project)
  version: "1.0.0"
  argument-hint: "[file-or-pattern, default index.html]"
---

# Web interface audit for the IT PMO Kanban board

This is the `web-design-guidelines` skill from
[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
(commit `063bee9`), rewritten for this project. The upstream skill is generic and
written for React and Tailwind apps. It fetches the rule list from the internet
on every run and reports everything it finds. Here the rule list is kept in this
folder, translated to plain HTML, CSS and JS, and filtered through what this
board is and what the brief forbids.

This skill **audits**. It does not set direction (`frontend-design`) or polish
(`high-end-visual-design`). Fixes go through those two. If a finding conflicts
with them, the order is: the user's own words, the fixed rules in
`frontend-design`, then this skill.

## The subject

A single-file Kanban board for a bank's IT project management office: four
columns, task cards, drag and drop, a **Move ▸** keyboard control, an Add Task
form that emails a notification through `formsubmit.co`, inline delete
confirmation, toasts, and a masthead with live counts and a proportional bar.
Used all day by PMO analysts and trainees, on desktop and phone.

## How to run an audit

1. Read `index.html` in full. Note the line numbers of the markup, the
   `<style>` block and the script.
2. Read [`rules.md`](rules.md) in this folder. It holds the rules, grouped, with
   how each applies here.
3. Read [Not applicable here](#not-applicable-here) below, so you do not report
   something that is deliberate.
4. Check every applicable rule. For anything involving rendered behaviour (focus
   rings on the navy masthead, the 390px layout, drag feedback, reduced motion),
   look at the running page with the `run` skill or Playwright. Do not judge it
   from the source alone.
5. Report in the format below. Then stop. Do not edit the file unless the user
   asked for fixes.

If the user names no file, audit `index.html`. It is the only app file.

Optionally compare with the current upstream list at
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
(WebFetch). Treat anything new there as a candidate only. Filter it through
this file before reporting.

## Output format

Group findings by file. One line each, `file:line - problem`, with the fix only
when it is not obvious. No preamble, no praise. Order by severity within the file:
things that block a keyboard or screen reader user first, then layout and touch,
then polish. Mark each finding **A** (accessibility or data loss), **B** (a
broken or confusing behaviour), or **C** (polish).

```text
## index.html

index.html:412 - A - Move ▸ button has no accessible name for the card it moves; add aria-label "Move ITPM-0004"
index.html:233 - B - .card transition: all → list transform, box-shadow
index.html:871 - C - "..." → "…"

✓ pass: Forms, Focus States
```

Finish with one line listing the rule groups that passed, and one line listing
any rule you could not check and why.

## Not applicable here

Do not report these. They are deliberate, or the brief rules them out.

| Upstream rule | Why it does not apply |
|---|---|
| Preload or preconnect fonts, CDNs, asset domains; `font-display` | No web fonts, CDNs or image files are allowed. The system stack is fixed. The one outside host is `formsubmit.co`, called on submit only. |
| URL reflects state, deep-link all stateful UI | State is in memory by design, with the note that a refresh resets the board. No browser storage, no cookies. Query-string state would be persistence by another route. Report only if a user asks for it. |
| Warn before navigation with unsaved changes | The reset note is the warning. Revisit only if the Add Task form ever holds a long draft. |
| Destructive actions need a confirmation modal | Delete already confirms inline (`Delete?` `Yes` `No`). Native `alert()` and `confirm()` are forbidden. Do not suggest a modal. |
| Title Case for headings and buttons | The house style is sentence case for new copy. The brief fixes `+ Add Task`, `Add Task`, `Move ▸`, `Overdue` and the column names exactly. |
| Virtualize lists over 50 items | A demo board holds tens of cards. Report only if sample data grows past about 200. |
| Images need width and height, lazy loading | There are no image files. Icons are inline SVG or Unicode. Do check that decorative glyphs are `aria-hidden`. |
| Hydration, `useState`, `onChange` and similar | React and SSR terms. The vanilla equivalent is a controlled value in `renderBoard()`, covered in `rules.md`. |
| `autoFocus` is fine in one place | Focusing the first field when the Add Task panel opens is expected. Report it only when it fires on page load, or on a phone for no reason. |
| Dark theme, `color-scheme`, `theme-color` | The board is light, corporate blue. Report only if a dark theme is added. |
| Detect language from `Accept-Language` | The board is English only. Date and number formatting still should use `Intl`. |

## Checks specific to this board

These come from how the board is built. Run them on top of `rules.md`.

- **`renderBoard()` rebuilds everything.** After a move, add or delete, focus is
  lost with the old nodes. Check that focus returns somewhere sensible: the moved
  card, the next card, or the column heading. Check that the toast live region is
  not rebuilt with the board, or it will not be announced.
- **Drag has a keyboard twin.** Every drag action must also work with **Move ▸**,
  by keyboard, with a visible focus ring and a toast that says where the card
  went. Dragging must not be the only way to do anything.
- **Colour is never the only signal.** Priority is a border and a word on the
  pill. Overdue is a badge with the word "Overdue". "Blocked" in the bar is
  hatched. Check any new state the same way.
- **Focus rings on the navy masthead.** The default ring colour disappears on
  navy. Check the header button and any link in it.
- **Long content.** A very long task title, assignee name or description must
  wrap inside the card (`overflow-wrap: anywhere`) and not push a column wider.
  Flex children need `min-width: 0`.
- **Escaping.** Any user text placed in HTML must go through `escapeHtml()`.
  Report a gap as **A**: it is a security fault, not only a style one.
- **The email call.** The submit button stays enabled until the request starts,
  then shows `Sending…` and is disabled. A failure shows the fixed toast
  `Card added locally — email notification failed`, and the card is still added.
- **Layout at 390px.** Columns stack below 768px. Nothing scrolls sideways.
  Touch targets are at least 44px tall, or have enough spacing around them.
- **Reduced motion.** Every `animation` and `transition` has a matching
  `@media (prefers-reduced-motion: reduce)` rule. `check-page.mjs` does not test
  this, so look.
- **Repo gate.** Run `node .github/scripts/check-page.mjs`. Report a failure as
  **A**. This skill never contradicts it.

## After the audit

- If the user asks for fixes, make them minimal and inside the existing
  structure, following `frontend-design` for tokens and `high-end-visual-design`
  for states and motion.
- Re-run the failing checks and the repo gate. Say which findings are now fixed.
- If a fix changes the default view, update `docs/screenshot.png`.
