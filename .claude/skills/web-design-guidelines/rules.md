# Rules for auditing the IT PMO Kanban board

Source: Vercel Web Interface Guidelines
(`vercel-labs/web-interface-guidelines`, `command.md`), kept here as a snapshot
and translated from React and Tailwind into the plain HTML, CSS and JS this
board uses. Rules the brief rules out are listed in `SKILL.md` under "Not
applicable here" and are left out below.

## Accessibility

- A button with only an icon or glyph needs `aria-label`. On this board that is
  at least the delete button and the **Move ▸** control, which must name the card
  ("Move ITPM-0004") because every card has the same visible text.
- Every form control needs a `<label>` or `aria-label`. Placeholder text is not a
  label.
- Use `<button>` for actions and `<a>` for navigation. Never a `<div>` or
  `<span>` with a click handler. Cards that are draggable still need real
  buttons inside them for the keyboard.
- Interactive elements work from the keyboard (Enter and Space on buttons,
  Escape closes the Add Task panel).
- Decorative glyphs and swatches get `aria-hidden="true"`.
- Async updates need a live region: toasts and form errors use
  `aria-live="polite"` (or `role="status"`; `role="alert"` for the email
  failure). The region must exist before the message is put into it.
- Prefer semantic HTML before ARIA. Headings run in order, `h1` once. A skip link
  to the board is worth having because the masthead comes first.
- Column counts and the proportional bar need a text alternative: the bar's
  meaning must be readable without seeing it.

## Focus states

- Every interactive element has a visible focus ring. Never `outline: none`
  without a replacement.
- Use `:focus-visible`, not `:focus`, so mouse clicks do not leave a ring.
- Use `:focus-within` for compound controls such as a card with its menu.
- A sticky masthead or toast must not cover the focused element.
- The ring must be visible on navy as well as on the light surface.

## Forms (Add Task)

- Inputs have a meaningful `name` and, where it applies, `autocomplete`. Use
  `autocomplete="off"` on fields that are not personal data, such as task title.
- Use the right `type` and `inputmode`: `email` for the notification address,
  `date` for the due date.
- Never block paste.
- Labels are clickable (`for`/`id` or wrapping).
- Turn off `spellcheck` on email addresses and codes.
- The submit button stays enabled until the request starts, then shows
  `Sending…`.
- Errors appear inline under the field and say how to fix it. On submit with
  errors, focus the first invalid field.
- Placeholders show an example and end with `…`.
- Dates are validated: the due date cannot be in the past.

## Animation

- Honour `prefers-reduced-motion` for everything that animates.
- Animate `transform` and `opacity` only.
- Never `transition: all`. List the properties.
- Set a correct `transform-origin`.
- Animations can be interrupted by user input.
- Nothing animates on its own. Motion answers an action.
- `renderBoard()` rebuilds the cards, so a CSS entrance animation on `.card`
  replays on every change. Report it.

## Typography

- `…` not `...`. Straight quotes in visible text become curly quotes.
- Non-breaking space between a number and its unit, and inside a task ID if it
  could wrap.
- Loading states end with `…`: `Sending…`.
- `font-variant-numeric: tabular-nums` for counts, IDs, dates and counters.
- `text-wrap: balance` on headings that can wrap.

## Content handling

- Text containers handle long content: wrap with `overflow-wrap: anywhere`, or
  truncate or clamp where a card must stay compact.
- Flex and grid children that hold text need `min-width: 0`.
- Empty states are handled: an empty column says what to do next, and a filter
  with no match says so.
- Anticipate short, average and very long titles, names and descriptions, and
  empty strings.

## Performance

- Do not read layout (`getBoundingClientRect`, `offsetHeight`, `scrollTop`)
  inside `renderBoard()` or any per-card loop. Batch reads before writes.
- Prefer uncontrolled inputs. Anything run on each keystroke must be cheap, such
  as a search filter or a character counter.
- Use CSS grid and flex for layout, not JavaScript measurement.

## Touch and interaction

- `touch-action: manipulation` on buttons and controls to remove the double-tap
  delay.
- Set `-webkit-tap-highlight-color` on purpose.
- Drag, swipe and pinch gestures need a tap, click and keyboard alternative. The
  alternative here is **Move ▸**.
- During a drag, disable text selection on the dragged card and mark the drop
  target.
- Use `overscroll-behavior: contain` on any panel or menu that scrolls inside the
  page, such as the Add Task panel on a phone.
- Use `autofocus` sparingly. Never on page load.

## Safe areas and layout

- If any element is full-bleed or fixed to a screen edge (a toast, a bottom
  bar), use `env(safe-area-inset-*)` so a notch does not cover it.
- No unwanted scrollbars and no sideways scroll at 390px. Fix the content, not
  `overflow-x: hidden` on the page.

## Theming and native controls

- A native `<select>` (priority, assignee, **Move ▸** menu) sets an explicit
  `background-color` and `color`, so it stays legible in forced-colour and
  Windows high-contrast modes.

## Locale

- Format dates with `Intl.DateTimeFormat` and numbers with `Intl.NumberFormat`.
  Do not hardcode month names or separators.
- Wrap identifiers such as task IDs and the "IT PMO" wordmark in
  `translate="no"` so browser translation does not mangle them.

## Hover and interactive states

- Every button and link has a hover state.
- Hover, active and focus are each more prominent than the resting state.

## Content and copy

- Active voice, second person, numerals for counts ("3 tasks", not "three").
- Specific button labels: "Add Task", not "Submit" or "Continue".
- Errors say what is wrong and how to fix it.
- Sentence case for new copy. The fixed labels in `frontend-design` stay exactly
  as written.

## Anti-patterns to flag

- `user-scalable=no` or `maximum-scale=1` in the viewport meta tag.
- `onpaste` with `preventDefault`.
- `transition: all`.
- `outline: none` with no `:focus-visible` replacement.
- A `<div>` or `<span>` with a click handler.
- A form input with no label.
- An icon-only button with no `aria-label`.
- Hardcoded date or number formats.
- `autofocus` with no clear reason.
- An action available only by dragging.
- Native `alert()`, `confirm()` or `prompt()`, and any `!important`. These break
  the brief, not only the guidelines.
