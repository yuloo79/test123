---
name: high-end-visual-design
description: "Finish and polish for the IT PMO Kanban board in index.html. Use when the board should feel more refined, for depth and shadows, nested surfaces, button and card states, drag-and-drop feedback, transitions and easing, or a final quality pass before publishing. Translates agency-style techniques into vanilla CSS within this project's corporate-blue, system-font, single-file rules."
license: MIT. See LICENSE in this folder.
---

# High-end finish for the IT PMO Kanban board

This is the `high-end-visual-design` skill from
[leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill)
(`skills/soft-skill`, commit `ce26fc2`), rewritten for this project.

The original is written for marketing sites built in React and Tailwind, with
premium web fonts, huge whitespace and scroll animation. This project is a dense
internal tool in one vanilla HTML file with no external resources. So each idea
below has been translated: what it becomes here, in plain CSS with this
project's tokens, or why it is left out.

Read `frontend-design` first. It sets direction, the fixed rules and the copy.
This skill only covers finish. If the two disagree, the order is: the user's own
words, the fixed rules in `frontend-design`, `frontend-design`, then this skill.

## 1. What "high-end" means for this board

For a tool people use all day, an expensive feel comes from precision, not
spectacle:

- Surfaces that sit at clear, consistent depths.
- Curves that are concentric where one surface nests in another.
- Every control answering a hover, a press and a drag.
- Motion that is short, eased and never in the way.
- Alignment and spacing that hold at every width.

It does not come from novelty. The board has one established look. Do not vary
the aesthetic from one change to the next; a new surface should look as if it
was always part of the page.

## 2. What to avoid, and what to do instead

| The original bans | Here |
|---|---|
| Inter, Roboto, Arial and other common fonts, in favour of premium web fonts | Web fonts cannot be loaded. The system stack in `--font` stays. Get refinement from weight contrast, the type scale tokens, `tabular-nums`, and the letter-spacing already on the wordmark. |
| Thick-stroked icon libraries | No icon library can be loaded at all. Use the Unicode glyphs already in use (`×`, `▸`, `+`, `✓`) or small inline SVG with a 1.5px stroke and `currentColor`. Icon-only buttons need an `aria-label`. |
| Generic 1px grey borders and harsh dark shadows | Hairlines use `--line`, which is tinted blue. Shadows are tinted navy, soft and wide, never pure black. Recipes are in section 4. |
| Sticky edge-to-edge navbars and plain symmetric grids | There is no navigation. The four equal columns are a requirement, not a default to break. Do not rotate, overlap or resize them. |
| `linear` and default `ease-in-out` transitions, and instant state changes | Agreed. Use the easing and duration tokens in section 5. |

Also avoid, because they clash with this project specifically:

- Glass and blur over content. `backdrop-filter` on lanes or cards costs
  performance and lowers text contrast on a page that is all text.
- Noise or grain overlays, mesh gradients and glowing orbs. They need image
  data or a second hue, and neither is allowed.
- Dark "OLED" or warm cream themes. The palette is corporate blue on a light page.
- Uppercase eyebrow pills above headings. The "Demo" pill in the masthead is the
  only one and it carries real information.
- Arrows in buttons. Labels are fixed by the brief.

## 3. Look and layout

**The look is fixed.** Of the original's three archetypes, the closest is
"soft structuralism": a light page, airy surfaces and very soft shadows. Here
that means the `--page` ground, white cards on `--blue-50` lanes, and the navy
masthead as the single dark surface. The other two archetypes are off-palette.

**The board layout is fixed.** The original's layout archetypes can inform
secondary surfaces only:

- *Asymmetric grid.* Suitable for a future task detail view: a wide main column
  beside a narrow facts column. Collapse to one column below 768px.
- *Split.* Suitable for the page layout that already exists: the form panel
  beside the board from 1100px up, stacked below that.
- *Overlapping or rotated cards.* Not suitable. Cards are drag targets and must
  stay square to the grid.

Every layout collapses to a single column with 16px side gutters below 768px,
which is the project's one breakpoint for the board.

## 4. Depth and surfaces

### Elevation tokens

The page currently uses borders for most separation and one shadow on toasts.
When a change needs depth, add these to `:root` the first time and reuse them.
They are not in the file yet.

```css
--shadow-rest: 0 1px 2px rgba(10, 35, 66, 0.06);
--shadow-raised: 0 2px 6px rgba(10, 35, 66, 0.08), 0 8px 24px rgba(10, 35, 66, 0.08);
--shadow-lifted: 0 6px 12px rgba(10, 35, 66, 0.10), 0 18px 40px rgba(10, 35, 66, 0.16);
--highlight-top: inset 0 1px 0 rgba(255, 255, 255, 0.7);
```

Use three levels and no more:

| Level | Used for | Shadow |
|---|---|---|
| Rest | Cards in a lane, the filter bar, the form panel | `--shadow-rest`, or border only |
| Raised | A card on hover, an open Move menu, toasts | `--shadow-raised` |
| Lifted | The card being dragged, a future modal | `--shadow-lifted` |

Shadows are for things that are above the page. Do not put a shadow on
everything; a lane full of equally shadowed cards reads as flat again.

### Nested surfaces (the "double bezel")

The original wraps every card in an outer shell with an inner core. Applied to
every card here, that would double the visual weight of a dense board. Use it
where nesting already exists or where one surface deserves emphasis:

- **Lanes and cards already are one.** The lane is the tray (`--blue-50`,
  `--radius-lg`), the cards are the core (`--surface`, `--radius-md`). Keep the
  relationship: inner radius = outer radius minus the gap between them.
- **Good candidates:** the form panel, the filter bar, toasts, a future modal
  or task detail view.
- **Not candidates:** individual cards, pills, tags, inputs.

Vanilla recipe, using the tokens:

```css
.shell {
  padding: var(--space-2);
  background: var(--blue-50);
  border: 1px solid var(--line);
  border-radius: calc(var(--radius-lg) + var(--space-2));
}
.shell__core {
  background: var(--surface);
  border-radius: var(--radius-lg);          /* outer radius minus the padding */
  box-shadow: var(--highlight-top), var(--shadow-rest);
}
```

### Buttons

Buttons keep their current shape (`--radius-md`) and their exact labels. Pills
are reserved for badges and counts, so a pill-shaped button would blur that
distinction. The original's "button inside a button" icon applies to at most
one control, the primary `+ Add Task`, where the `+` may sit in its own small
circle. Do not add trailing arrows.

Give every button all of these states: rest, hover, `:active`, `:focus-visible`
and `:disabled`. The disabled "Sending…" state must still be readable.

### Spacing

The original asks for very large section padding. On a working tool that
pushes the board off the screen. Instead:

- Between regions (masthead, filters, board, form panel): `--space-5` or `--space-6`.
- Inside a lane or panel: `--space-3` or `--space-4`.
- Inside a card: `--space-2`, tight, so more cards fit in view.

The contrast between loose regions and tight cards is what makes it feel
considered. Use only the spacing tokens.

## 5. Motion

### Tokens

Add these to `:root` the first time motion is added. They are not in the file yet.

```css
--ease-out: cubic-bezier(0.32, 0.72, 0, 1);
--dur-fast: 120ms;   /* hover, press */
--dur-base: 200ms;   /* menus, highlights, toasts */
```

The original uses 700ms and longer. That suits a landing page seen once. On a
board used all day, anything over about 250ms feels slow.

### What to animate

| Moment | Treatment |
|---|---|
| Hover on a card | Shadow steps from rest to raised over `--dur-fast`. |
| Press on a button | `transform: scale(0.98)` on `:active`. |
| Drag start | The dragged card's source dims (already done with opacity). The lift comes from the browser's drag image. |
| Column becomes a drop target | Background and dashed border ease in over `--dur-base`. |
| Move menu or delete confirmation opens | See the re-render note below before animating. |
| Toast arrives | Fade and rise, already present as `toast-in`. Move it onto the tokens if touched. |
| Distribution bar changes | Segments ease to their new widths, already present. |

### The re-render trap

`renderBoard()` replaces the board's HTML from state on every change. Two
consequences:

1. A CSS animation on `.card`, `.column` or anything inside them replays on
   every element after every action. Do not add entrance animations there.
2. A CSS transition on those elements never runs across a re-render, because
   the old element is gone.

To animate one card after a move or an add, record its ID in `state.ui`, have
`renderCard()` add a class to that card only, and clear the ID after the
animation. Elements outside the board (masthead, form panel, filter bar,
toasts) persist and can be animated normally.

### Left out on purpose

- Scroll-triggered entrance animations. The board must be complete the moment it
  loads; nothing waits for an observer.
- Floating navigation, hamburger morphs and full-screen menu overlays. There is
  no navigation.
- Magnetic or parallax effects.

### Reduced motion

Every transition and animation gets a matching rule in the existing
`@media (prefers-reduced-motion: reduce)` block that removes it.

## 6. Performance guardrails

These carry over from the original unchanged in spirit:

- Animate `transform` and `opacity`. Shadow and colour changes on hover are
  acceptable on single small elements. Do not animate `width`, `height`, `top`
  or `left`. The distribution bar's `flex-grow` transition is the one existing
  exception, on a handful of tiny elements.
- No `backdrop-filter` on anything that scrolls. If blur is ever used, it is
  only on the fixed toast region, and the text on it must still meet contrast.
- `will-change` only on an element that is animating right now.
- Keep z-index for real layers. Today there is one: the toast region. A modal
  would be the second. No arbitrary large values.

## 7. How to apply a polish pass

1. Read the `:root` tokens and the CSS of the surface you are refining.
2. Decide the level of each surface involved: rest, raised or lifted.
3. Add any missing elevation or motion tokens to `:root`, then use them.
4. Write plain CSS classes in the one `<style>` block. No utility-class strings,
   no `!important`, no literal colours in component rules.
5. Add the states: hover, pressed, focus, disabled, dragging.
6. Add the reduced-motion rule.
7. Verify as in `frontend-design`: run `node .github/scripts/check-page.mjs`,
   look at 1440px and 390px, tab through with the keyboard, drag a card.
8. Update `docs/screenshot.png` if the default view changed.

## 8. Checklist before finishing

- [ ] No web fonts, icon libraries, image files or outside hosts were added.
- [ ] Colours stay in the blue family; red, amber and grey still mean priority
      or overdue and nothing else.
- [ ] Every new colour, shadow, easing and duration is a token on `:root`.
- [ ] No more than three elevation levels are in use, and shadows are navy-tinted.
- [ ] Nested surfaces have concentric radii.
- [ ] Buttons and cards have hover, pressed, focus and disabled states.
- [ ] No animation was added to elements that `renderBoard()` rebuilds, unless
      it is keyed to one changed card through state.
- [ ] Transitions use `--ease-out` and run for 250ms or less.
- [ ] A reduced-motion rule covers everything animated.
- [ ] Text contrast is at least 4.5:1 on every surface that was touched.
- [ ] The board is still fully visible and usable at 390px wide.
- [ ] Labels fixed by the brief are unchanged.
- [ ] `node .github/scripts/check-page.mjs` passes.
- [ ] The result reads as a precise, calm internal tool, not a marketing page.
