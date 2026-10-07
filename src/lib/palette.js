/**
 * Single source of truth for colour shared between the 3D scene and the CSS
 * theme in index.css. If you change a value here, mirror it in the @theme
 * block so the paper UI and the lit room stay in agreement.
 */
export const PALETTE = {
  // Room shell
  floor: '#22302a',
  wallBack: '#1a2a21',
  wallSide: '#14231b',

  // Desk
  deskWood: '#3a2a1d',
  deskWoodDark: '#2a1e15',
  blotter: '#2f5c3c',
  blotterEdge: '#1f3f29',

  // Filing cabinets
  cabinet: '#6b7a4b',
  cabinetDark: '#4d5936',
  cabinetDrawer: '#768554',
  labelPlate: '#e8e0cc',
  handle: '#c9b27a',

  // Lamp
  brass: '#c9a24a',
  brassDark: '#8a6c2c',
  shadeGreen: '#2f7d46',
  shadeGreenLit: '#3fa05c',
  shadeInner: '#fff4dc',
  chain: '#bda45f',

  // Paper
  cream: '#efe9db',
  creamDim: '#c9c2b0',
  folderCover: '#e3d9c0',
  folderEdge: '#c4b795',
  /* The one non-archive colour in the room. It exists so a stamp reads as a
     stamp rather than as more brass, and is used nowhere else. Mirrored in
     index.css as --color-stamp-500. */
  stamp: '#a1472f',

  // Light
  lampWarm: '#ffd9a0',
  ambientWarm: '#a8c0a0',
  ambientCold: '#4a6b7a',
}
