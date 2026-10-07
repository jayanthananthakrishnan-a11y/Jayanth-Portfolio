# Prashanth's Portfolio: The File Cabinet

A personal portfolio built as an interactive 3D archive room, where visitors pull a lamp chain, open cabinet drawers and read case files.

Repository: https://github.com/coolprash06/Prashanth-Portfolio-Website

## How it works

### The lamp

The room starts almost dark. The only thing that turns it on is the pull chain on the brass desk lamp. You can click the chain or drag it down; it follows the pointer and springs back when you let go. Pulling it:

1. snaps the chain to full travel,
2. brings up the bulb and the green glass shade,
3. ramps the room's ambient, fill and rim lights up to full while the fog thins (`LightRig`).

The landing copy fades in once the room is lit. The camera controls work the whole time, so you can drag to look around even while the room is dark.

### Cabinets and drawers

There are three filing cabinets behind the desk. Six drawers have typed labels and each holds a dossier:

| Drawer       | Cabinet             | File No. |
| ------------ | ------------------- | -------- |
| MY RESUME    | Hero cabinet, 1st   | PR-000   |
| PROJECTS     | Hero cabinet, 2nd   | PR-002   |
| HACKATHONS   | Side cabinet, 1st   | PR-001   |
| UI DESIGNS   | Side cabinet, 2nd   | PR-003   |
| GRADES       | Side cabinet, 3rd   | PR-004   |
| ARTICLES     | Left cabinet, 1st   | PR-005   |

Drawers without a label stay closed and can't be clicked. Each label, and each folder cover (subject, file number, sheet count, stamp), is drawn to a canvas texture from that dossier's own data.

### The file prompt

Opening a file takes three clicks. Each step is tracked as `fileStage` in the store:

1. **Drawer.** Clicking a labelled drawer slides it out, and the camera moves in to look down into it. The prompt shows which cabinet and drawer the file is in, with a **TAKE THE FILE** button.
2. **Desk.** The folder flies out of the drawer and lands, still closed, on the desk blotter next to the lamp. The prompt changes to **OPEN THE FILE** and shows the stamp from the cover.
3. **Open.** The cover swings back on its spine and the flat dossier takes over the screen.

**Put it back** (or Escape) reverses the steps: the folder goes back in its drawer, the drawer shuts and the camera returns to the room. When you close a dossier, you land back where you opened it from.

### The dossier: Spread and Reading View

Each dossier renders its pages in one of two modes:

- **Spread** shows two sheets at a time, like an open file. A page turn is an animated leaf hinged on the centre gutter, with a `X–Y / N` page counter. The arrow keys turn pages. A closing plate takes the slot after the last sheet. On narrow screens the sheets stack into one column.
- **Reading View** stacks every sheet in one scrollable column.

Both modes use the same `DossierPage` component. Escape closes the dossier.

### The File Index

The **File Index** button in the top bar (and the landing CTA) opens a list of every dossier. Clicking one opens it directly, with no drawer or folder steps. Twelve weekly case files (PR-006 to PR-017) are also listed and greyed out as `Pending`.

### Without WebGL

If the browser has no WebGL, the 3D scene is never loaded. A flat CSS backdrop takes its place and the landing copy shows straight away. If the scene crashes, `SceneBoundary` swaps in the same backdrop. The File Index and dossiers work either way. With JavaScript turned off, `index.html` shows a `<noscript>` message with a contact email.

### Other details

- Three.js is lazy-loaded in its own chunk, so it's only downloaded when the room can actually be shown.
- `src/lib/capabilities.js` sorts the device into a quality tier and sets pixel ratio, shadows and geometry detail to match.
- The **Motion** toggle in the top bar starts off when the system asks for reduced motion (`prefers-reduced-motion`). With motion off, the transitions happen instantly.

## Tech stack

- [React 19](https://react.dev/)
- [Three.js](https://threejs.org/) with [React Three Fiber](https://r3f.docs.pmnd.rs/) and [drei](https://github.com/pmndrs/drei) (`OrbitControls`, `Html`)
- [Zustand](https://zustand.docs.pmnd.rs/) for state shared between the DOM UI and the 3D canvas
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [Vite 8](https://vite.dev/)
- [Oxlint](https://oxc.rs/) for linting
- Google Fonts: Instrument Serif and JetBrains Mono

## Getting started

**Prerequisites:** Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8) and npm.

```bash
git clone https://github.com/coolprash06/Prashanth-Portfolio-Website.git
cd Prashanth-Portfolio-Website
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

| Script            | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server             |
| `npm run build`   | Production build into `dist/`         |
| `npm run preview` | Serve the production build locally    |
| `npm run lint`    | Run Oxlint                            |

The repo's `.npmrc` sets `legacy-peer-deps=true`, which `npm install` picks up automatically.

### Dev-only URL flags

These flags only work in dev builds; production builds ignore them.

- `?lit=1` starts in the lit room and skips the lamp pull.
- `?stage=drawer` starts with the resume drawer already open.
- `?stage=desk` starts with the resume folder already closed on the desk.

## Project structure

```
index.html                  Entry HTML, font links, <noscript> fallback
lamp.txt                    Portable export of the pull-string desk lamp
public/
  images/                   Screenshots and certificates used in dossiers (per drawer)
  docs/                     PDF reports linked from dossiers
src/
  App.jsx                   Top-level layout: 3D canvas (or fallback) + flat UI layers
  index.css                 Tailwind theme tokens and global styles
  data/
    dossiers.js             All dossier content: pages, blocks, and the pending files list
    site.js                 Landing copy and file-prompt copy
  state/
    archiveStore.js         Zustand store: lamp, drawer/file sequence, open dossier, toggles
  lib/
    palette.js              Colours shared by the 3D materials and the CSS theme
    capabilities.js         WebGL check, device tier, quality settings, reduced motion
  scene/                    Everything inside the <Canvas>
    ArchiveCanvas.jsx       Canvas setup
    ArchiveRoom.jsx         Room layout: cabinets, drawer plates, desk, lamp
    CameraRig.jsx           Orbit controls, home framing, per-drawer camera poses
    Furniture.jsx           Room shell, desk, filing cabinets and drawers
    CaseFolder.jsx          The folder that flies from drawer to desk and opens
    DeskLamp.jsx            Banker's lamp
    PullChain.jsx           The lamp's pull chain (click or drag)
    LightRig.jsx            Room lighting and the light-up ramp
    labelTexture.js         Canvas textures for drawer labels and folder covers
  ui/                       Everything outside the <Canvas>
    TopBar.jsx              Sound / Motion toggles and the File Index button
    LandingOverlay.jsx      Landing copy shown once the lamp is on
    PullPrompt.jsx          "Pull the string" hint
    FilePrompt.jsx          Copy and buttons for the drawer and desk steps
    FileIndex.jsx           List of all dossiers and pending files
    FlatBackdrop.jsx        Fallback shown when the 3D scene can't be shown
    SceneBoundary.jsx       Error boundary around the 3D scene
    dossier/
      DossierView.jsx       Spread / Reading View, page turns, counter
      DossierPage.jsx       A single sheet
      blocks.jsx            Renderers for each content block type
```

Files in `src/ui/` don't import from `src/scene/`. The two sides only share the store and the palette, so the flat UI works even when the room isn't rendered.

## Adding content

All content lives in `src/data/dossiers.js`. Content files hold no styling; `src/ui/dossier/blocks.jsx` decides how every block looks.

### Add a sheet to an existing dossier

Each dossier has a `*_PAGES` array (for example `PROJECTS_PAGES`). To add a sheet, append a page object:

```js
{
  id: 'my-new-sheet',            // unique within the dossier
  eyebrow: 'Sheet 04',
  title: 'Project · March 2026',
  // titleNote: 'continued',     // optional, shown in brackets after the title
  // fitSpacing: true,           // optional, tightens spacing only if the sheet would scroll
  blocks: [
    { type: 'entry', title: 'My Project', bullets: ['What it does.'] },
    { type: 'fields', items: [{ label: 'Stack', value: 'React' }] },
    { type: 'image', src: '/images/projects/my-project.png', alt: 'Screenshot' },
  ],
}
```

Available block types: `headline`, `fields`, `entry`, `chips`, `chipGroups`, `listGroups`, `image`, `table`, `text`, `contents`. The comment at the top of `dossiers.js` lists the options for each one. Put images in `public/images/<drawer>/` and PDFs in `public/docs/`, then reference them with root paths like `/images/...` and `/docs/...`.

The folder cover and the prompt count the sheets from `pages.length`, so you don't need to update a count anywhere.

A new block type needs a renderer component in `blocks.jsx` and an entry in its `RENDERERS` map.

### Add a new dossier (listed in the File Index)

Add an object to the `DOSSIERS` array:

```js
{
  id: 'certifications',
  title: 'Certifications',        // also used as the drawer label (uppercased)
  subject: 'Certifications',      // typed on the folder cover
  fileNumber: 'PR-006',
  classification: 'Case File',
  stamp: 'Declassified',
  drawerLabel: 'Side cabinet / Drawer 04',
  summary: 'One-line summary for the File Index.',
  pages: CERTIFICATIONS_PAGES,
}
```

That's enough for it to show up in the File Index. If it takes a slot from the weekly case files, update `PENDING_FILES` at the bottom of the file too; they're numbered from PR-006.

### Put a dossier in a drawer

1. In `src/scene/ArchiveRoom.jsx`, look up the dossier with `getDossier('your-id')`, build its cover with `coverFor(...)`, and add an entry to the `plates` prop of a `FileCabinet`. The key is the drawer index, with `0` as the top drawer:

   ```jsx
   3: {
     id: CERTIFICATIONS.id,
     label: CERTIFICATIONS.title,
     cover: CERTIFICATIONS_FOLDER_COVER,
     deskPose: FOLDER_ON_DESK,
   },
   ```

2. In `src/scene/CameraRig.jsx`, add a camera pose for the new id under `FOCUS.drawer`. The existing entries show how each pose is the one above it dropped by one drawer height. If you leave this out, the camera falls back to the MY RESUME drawer's framing.

## Reusable components

The pull-string desk lamp (`DeskLamp.jsx` and `PullChain.jsx`, with the optional `LightRig.jsx`) is exported as a standalone package in [`lamp.txt`](lamp.txt). It contains the full source, the npm dependencies, the store slice the lamp needs, integration notes for dropping it into another React Three Fiber scene, and a list of known quirks.

## Deployment

Deployment is planned for Vercel.

Developer notes on the design and implementation are in [docs/NOTES.md](docs/NOTES.md).
