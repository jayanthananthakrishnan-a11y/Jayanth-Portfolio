> Archived developer notes from an earlier version of the project. Some details
> (filled drawers, SITE.location, the twelve-week framing) are out of date; see
> [README.md](../README.md) for the current state.

# Design Archive — Jayanth

A 3D "archive room" portfolio for a twelve-week self-directed UI/UX project.
Each week's design becomes a case file in the archive.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Architecture

The 2D UI and the 3D scene are deliberately independent. `src/ui/*` never
imports from `src/scene/*`; they share only the `archiveStore` and the design
tokens. That means the flat layers (File Index, dossier pages, Reading View)
can be built and reviewed without the room rendering at all.

```
src/
  data/site.js          Landing + identity copy
  data/dossiers.js      Dossier content model (pages + typed blocks)
  lib/palette.js        Colours shared by CSS theme and 3D materials
  lib/capabilities.js   WebGL probe, device tier, per-tier quality settings
  state/archiveStore.js Cross-boundary state (zustand, not context - see below)
  scene/                Everything inside <Canvas>
  ui/                   Everything outside it
  ui/dossier/           The flat paper layer (page, blocks, spread view)
```

**Why zustand and not React context:** `<Canvas>` renders through its own
reconciler, so DOM-tree context does not reach components inside the scene. An
external store crosses that boundary; context would not.

## Dev escape hatches

Stripped from production builds:

```
?lit=1            boot into the lit room, skipping the pull-chain reveal
?stage=drawer     boot into the drawer-zoom beat of the file sequence
?stage=desk       boot with the folder already closed on the desk
```

## Graceful degradation

Three layers, worst case first:

1. **No JS** — `<noscript>` block in `index.html` with name, role, summary, and
   a mailto link.
2. **No WebGL** — `capabilities.js` probes for a context at load. If absent the
   3D chunk is never imported and `FlatBackdrop` (pure CSS) renders instead,
   with the landing copy forced visible since there is no lamp to pull.
3. **WebGL that crashes** — `SceneBoundary` catches it and swaps in the same
   flat backdrop.

Three.js is lazy-loaded, so the initial bundle is ~72 kB gzipped and the 3D
chunk (~247 kB gzipped) only loads when it can actually be used.

## Adaptive quality

`lib/capabilities.js` picks a tier from `hardwareConcurrency`, `deviceMemory`,
and pointer/viewport, then `QUALITY` supplies DPR clamp, shadow on/off, shadow
map size, geometry segment counts, and antialiasing. Low-tier devices get no
shadows, no fill lights, and coarser geometry.

`prefers-reduced-motion` is respected: it initialises the Motion toggle to off,
which makes the light reveal and chain pull snap instantly instead of animating.

## Phase 1 — the reveal sequence

The room starts near-black. A cold back light is the only thing separating the
furniture from the wall. The pull-chain on the lamp is the **only** interactive
object; nothing else in the scene turns the light on, though camera controls
stay live so you can look around in the dark.

Pulling it (click or drag-down; the chain follows your pointer and springs
back) runs a three-stage sequence:

1. Chain snaps to full travel (~260 ms).
2. The bulb and shade come up fast (~0.3 s), leading the room.
3. `LightRig` ramps ambient, hemisphere, fill, and rim to full over ~1.2 s while
   fog thins.

Landing copy then fades and slides in on a stagger.

### Dev flag

`?lit=1` boots straight into the lit room, skipping the reveal. Dev builds only.

## Phase 2 — the paper layer

`src/data/dossiers.js` holds the content. A dossier is a list of pages, and a
page is a list of blocks from a small closed set (`headline`, `fields`,
`entry`, `chips`, `chipGroups`, `listGroups`). Content files carry no styling;
`ui/dossier/blocks.jsx` is the only place that decides how a block looks, so a
legibility change lands on every page at once.

`DossierPage` is the single page primitive. The two views render the same
component, so a page cannot look like two different things:

- **Spread** — two sheets at a time, page-turn controls, `X–Y / N` counter.
- **Reading View** — every sheet stacked and scrollable.

### The page turn

Paging state is one object — `{ spread, counter, turning }` — because a turn is
not instantaneous and its three parts do not move at the same moment. The leaf
lifts, the counter flips as the leaf passes the vertical, and the spread
commits as the leaf lands. Deriving all three from a single index is what
produced the original page-order bug: spread and counter both jumped on the
first frame while a stale sheet stayed painted on top of them, so mid-turn the
screen could read `3–4 / 7` above Sheet 05 and Sheet 04.

The leaf is **two-sided** and **hinged on the gutter**, not on its own edge.
The gutter is the file's spine, so the leaf is an absolutely positioned child
of the grid rather than of either cell, and `transform-origin` is pulled half a
gutter outside its own edge onto the grid's centre line — which is what makes a
180° turn land it exactly over the opposite cell instead of a gutter's width
short of it. Its front face is the sheet lifting off and its back face is
pre-rotated 180°, so `backface-visibility` swaps them at the vertical and the
flip is continuous end to end. (The old single-sided leaf simply vanished at
90° and left the back half of the turn empty.)

That geometry is what keeps the page order honest. At every instant the leaf
covers exactly the side it has not yet uncovered, so the sheet under the
*uncovered* side can be the destination one from the first frame — revealed by
the leaf lifting off it, which is what paper does — while the side the leaf is
falling towards keeps the old sheet until the leaf's back face lands over it.
Read left to right, the sheet numbers on screen are strictly increasing on
every frame of every turn, and the sheet the leaf lands on is already identical
to the one underneath it when it unmounts, so there is nothing left to settle.

The counter is moved by the paper itself. A frame watcher reads the leaf's
live transform and flips the counter on the frame its back face takes over —
the sign of `m11`, which is `cos` of the turn angle and the same sign
`backface-visibility` switches on. A timer at `TURN_MS / 2` looks equivalent
and is not: the turn is eased, and under
`cubic-bezier(0.37, 0.02, 0.25, 1)` the leaf is already about 140 of its 180
degrees round when half the milliseconds have gone, so a half-duration timer
left the footer reporting the old spread for ~70ms after the screen had moved
on. Watching the element has no constant to keep in sync — retune the curve or
the duration and the counter still moves exactly when the paper does. The flip
is `flushSync`ed because an rAF callback runs before the frame is painted but
a scheduled update would not render until the task after it, which put the new
counter on screen one frame late.

A turn starts from where the paper is *going*, not from where it is: clicking
faster than the animation snaps the in-flight turn to its destination and
begins the next one from there, so no spread can be lost or repeated. Each
turn carries a `seq`, which is the leaf's React `key`: cutting in on a turn
mid-swing remounts the leaf so its CSS animation starts again at the flat.
Sharing the element let the new turn inherit the old one's angle — the paper
lay past the vertical before the turn it belonged to had begun, so the
destination spread appeared with no movement at all.

Below `md` the sheets stack into one column and no leaf is laid out, because
there is no gutter to hinge one on. With no paper in the air there is nothing
to keep step with, so a turn there commits at once rather than holding a pair
that belongs to neither spread on screen for the length of an animation that
is not being drawn. Whether a leaf exists is measured off the grid rather than
by re-declaring the breakpoint in JS, so the stylesheet stays the only place
that decides where the layout changes shape.

Duration lives in two places that must stay in sync: `TURN_MS` in
`DossierView.jsx`, which schedules the commit, and `--dossier-turn` in
`index.css`, which drives the animation.

### Legibility floor

The resume pages are far denser than the placeholder case files, so the paper
holds to a floor: body copy no smaller than `0.9rem` and no tighter than
`leading-[1.8]`, bullets hanging off their marker so wrapped lines stay
aligned, and list-shaped content always broken up by a tracked label. Measured
on `cream-50`: `ink-900` ~15.7:1, `ink-700` ~9.8:1, `ink-500` ~5.3:1.
`ink-300` is ~2.3:1 and is therefore rules and borders only, never text.

Below `md` the two sheets stack and the column scrolls rather than each sheet
shrinking to half width — halving the measure on a phone would break that
floor. A page whose content outgrows its sheet scrolls within the sheet, so
content is never silently clipped.

### Drawers

A drawer given a `plate` (`{ id, label, cover, deskPose }` via the `plates`
prop on `FileCabinet`) is a real one: its label is drawn to a canvas texture in
`scene/labelTexture.js`, it is built as an open-topped tray with the folder
inside it, and clicking it starts the file sequence below. Drawers without a
plate stay blank, inert, and solid - cheaper, and correct, since they never
open far enough to look into. A canvas is used rather than a 3D text helper
because those fetch a font at runtime, and the plate has to be readable the
instant the lamp comes up.

Only the hero cabinet's top drawer (`RESUME`) is filled.

### The file sequence

Three clicks between the drawer and the paper, tracked by `fileStage` in the
store as `'drawer' | 'moving' | 'desk' | 'opening'`:

1. **Drawer** - the drawer slides out and `CameraRig` reframes onto it. The
   folder inside is now visible, cover up, resting on the filed stack.
2. **Desk** - clicking the folder (or `TAKE THE FILE`) flies it out of the
   drawer along an arc and sets it down on the blotter beside the lamp, *still
   closed*. The cover is its own beat, not a frame of the transition, so the
   prompt waits out the whole flight before it changes.
3. **Open** - `OPEN THE FILE` turns the front cover back on its spine in the
   room, and the flat dossier takes the screen as it lands.

`'opening'` is not a fourth click; it is the tail of the third one, held long
enough for the cover to actually turn. The file is opened the same way its
pages are turned, so the handover to the paper is a continuation of the
gesture rather than a cut — `COVER_OPEN_MS` in the store and in
`scene/CaseFolder.jsx` are the two ends of it, and `.dossier-open` in
`index.css` carries the last of the movement into the flat layer.

`returnFile` unwinds it in the same order: an open cover shuts first, so the
folder is never carried back lying open, then the folder goes home, then the
drawer shuts and the camera returns to the room. Escape does the same. Closing
the dossier returns to whichever state opened it - the closed cover if the room
sequence led there, the room at rest if the File Index did.

The File Index still opens the dossier directly, with no drawer and no folder,
so the paper stays reachable with no WebGL at all.

**Why the folder is a child of the drawer.** `CaseFolder` is mounted inside the
drawer group, so it rides the slide for free rather than keeping a second copy
of the drawer's damping in sync. Its desk pose is given in world space and
converted into the drawer's frame every frame, which is what lets it land on
the blotter and stay there however far the drawer happens to be pulled.

**The binding.** The folder is a bound file, not a stack of loose sheets, so it
has a spine down its left edge: a rounded band the full height of the stack,
stitched, with a score line in the cover a thumb's width inboard of it. The
spine belongs to the body and stays put; the crease belongs to the cover and
travels with it, because that is the edge the cover folds along. The cover
itself is hinged on that spine - a pivot group on the folder's left edge whose
contents are pushed back out by the same amount, so the shut cover sits exactly
where it did before the hinge existed.

**The cover.** Painted by the same canvas module as the drawer plates, from the
dossier's own `classification`, `subject`, `fileNumber` and page count - so the
cover and the first sheet cannot disagree. `PALETTE.stamp` is the one
non-archive colour in the room; it exists so a stamp reads as a stamp rather
than as more brass, and is mirrored in `index.css` as `--color-stamp-500` for
the chip on the prompt beside it.

### The camera

`scene/CameraRig.jsx` is the room's only camera system: the orbit controls, the
responsive home framing, and the sequence's reframes are one component because
they are one decision. Only ever one of them may own the camera, and the
cheapest way to guarantee that is for the thing that moves the camera to also
be the thing that switches the controls off - drei's `OrbitControls` skips its
`update()` entirely while disabled, so the rig has the camera to itself for a
whole move, orbit limits included, and hands it back settled at the end.

Portrait backs off along the same sight line rather than defining a second pair
of poses that could drift out of agreement, then drops the whole view so the
subject sits in the top half of a tall frame - which is where the prompt copy
moving to the bottom needs it to be.

## Known gaps / next phases

- The twelve weekly case files have no content yet. They are listed in the File
  Index as `Pending` rather than hidden, and their drawers stay blank.
- Sound toggle is state-only; no audio is loaded yet.
- `SITE.location` in `src/data/site.js` is a placeholder — swap in the real city
  and coordinates.
- The dossier route is state-only; it has no URL, so a dossier cannot be linked
  to or reached with the back button yet.
