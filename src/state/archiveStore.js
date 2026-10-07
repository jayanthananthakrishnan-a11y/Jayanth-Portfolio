import { create } from 'zustand'
import { PREFERS_REDUCED_MOTION } from '../lib/capabilities'

/**
 * Shared state between the DOM overlay and the R3F scene.
 *
 * These live in a zustand store rather than React context because <Canvas>
 * renders through a separate reconciler - context from the DOM tree does not
 * cross that boundary, but an external store does.
 */
/**
 * Dev-only escape hatches, stripped from production builds:
 *   ?lit=1            boot straight into the lit room, skipping the reveal
 *   ?stage=drawer     boot into the drawer-zoom stage of the file sequence
 *   ?stage=desk       boot with the folder already closed on the desk
 *
 * The `stage` hatch exists so the three beats of the sequence can be opened
 * and screenshotted directly instead of being replayed by hand every reload.
 */
const PARAMS =
  import.meta.env.DEV && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null

const START_STAGE = ['drawer', 'desk'].includes(PARAMS?.get('stage'))
  ? PARAMS.get('stage')
  : null
const START_LIT = Boolean(PARAMS?.has('lit')) || Boolean(START_STAGE)

/** The one drawer in the room that is filled. See ArchiveRoom. */
const HERO_FILE = 'resume'

/**
 * Folder flight time, drawer to desk. Mirrors FOLDER_DAMP in scene/CaseFolder.
 * The flight is continuous in the scene; this timer only decides when the
 * closed-cover prompt is allowed to appear, so the copy never lands on a
 * folder that is still in the air.
 */
const FOLDER_TRAVEL_MS = 900

export const useArchive = create((set, get) => ({
  /** false until the pull-chain has been pulled. Gates all landing copy. */
  lampOn: START_LIT,

  /** True while the chain is mid-animation, so it cannot be re-triggered. */
  pulling: false,

  /** Disabled while the user is dragging the chain so OrbitControls stays put. */
  controlsEnabled: true,

  soundOn: false,
  motionOn: !PREFERS_REDUCED_MOTION,

  /** Set once the user has moved the camera - hides the "drag to look" hint. */
  hasLookedAround: false,

  /* --- Flat layers over the room ------------------------------------- */

  /** True while the File Index is open. */
  indexOpen: false,

  /** Id of the dossier being read, or null. Drives the flat dossier route. */
  openDossierId: null,

  /**
   * Id of the drawer currently slid open in the 3D room.
   *
   * Tracked separately from `openDossierId` because the drawer leads: it pulls
   * out first, and the paper only takes over the screen two beats later. It
   * also stays out for as long as the dossier is being read, so closing the
   * dossier reveals the room exactly as it was left.
   */
  drawerOut: START_STAGE ? HERO_FILE : null,

  /* --- The file sequence ---------------------------------------------
     Three beats between the drawer and the paper, each one its own click:

       'drawer'  camera has zoomed onto the open drawer, folder inside
       'moving'  folder is in the air between drawer and desk
       'desk'    folder has landed, closed, cover up, waiting to be opened
       'opening' the front cover is turning back on its spine

     'opening' is not a click of its own - it is the tail of the third one.
     The paper mounts the instant it starts rather than at the end of it, so
     by the time anything else can observe this stage `openDossierId` is
     already set alongside it; the stage itself just keeps the room's cover
     turning underneath for as long as the dossier stays open.

     null means the room is at rest. `openDossierId` is the fifth state and
     lives apart from this one, because the flat dossier has to be reachable
     with no room at all - the File Index opens it directly. */
  fileStage: START_STAGE,

  pullLamp: () => {
    if (get().lampOn || get().pulling) return
    set({ pulling: true })
    // Chain snaps, then the room comes up. LightRig reads lampOn to drive the
    // actual 1.2s ramp; this delay is just the mechanical chain travel.
    const chainTravel = get().motionOn ? 260 : 0
    window.setTimeout(() => set({ lampOn: true, pulling: false }), chainTravel)
  },

  openIndex: () => set({ indexOpen: true }),
  closeIndex: () => set({ indexOpen: false }),

  /** Opens a dossier directly - used by the File Index, which has no drawer. */
  openDossier: (id) => set({ indexOpen: false, openDossierId: id }),

  /**
   * Beat one. The drawer slides out and the camera reframes onto it; nothing
   * else happens. What used to route straight into the dossier now stops here,
   * because the folder inside the drawer is the next thing to click.
   */
  pullDrawer: (id) => {
    if (get().drawerOut === id) return
    set({ drawerOut: id, fileStage: 'drawer', indexOpen: false })
  },

  /**
   * Beat two. The folder leaves the drawer and lands on the desk, still shut.
   * The cover state is a pause of its own, not a frame of the transition, so
   * the prompt waits out the full flight.
   */
  liftFolder: () => {
    if (get().fileStage !== 'drawer') return
    set({ fileStage: 'moving' })
    const travel = get().motionOn ? FOLDER_TRAVEL_MS : 0
    window.setTimeout(() => {
      // Bail if the folder was sent back mid-flight.
      if (get().fileStage === 'moving') set({ fileStage: 'desk' })
    }, travel)
  },

  /**
   * Beat three. The front cover turns back on its spine, and the paper takes
   * the screen at once rather than waiting out the swing.
   *
   * The cover turn still plays in the room - it is the same gesture the
   * dossier's own page turns use - but nothing in 3D ever renders the actual
   * sheets (see the note on CaseFolder), so holding the paper back until the
   * swing finished used to leave the screen showing blank stand-in geometry
   * for the length of it. Mounting the flat dossier in the same tick instead
   * lets its own fade-in (.dossier-open) carry the transition, with Sheet 01
   * underneath it from the first frame - the room keeps turning the cover
   * behind that overlay, purely as texture now rather than as the thing the
   * paper waits on.
   */
  openFile: () => {
    const { fileStage, drawerOut } = get()
    if (fileStage !== 'desk' || !drawerOut) return
    set({ fileStage: 'opening', openDossierId: drawerOut })
  },

  /**
   * Unwinds the sequence: folder back to its drawer first, then the drawer
   * shuts and the camera returns to the room. Doing both at once would drag
   * the folder home inside a drawer that is already closing.
   */
  returnFile: () => {
    const stage = get().fileStage
    if (!stage) return

    // 'opening' is never reachable here: openDossierId is set in the same
    // tick as the stage, which is what FilePrompt gates this control on -
    // closing that dossier goes through closeDossier instead, which shuts
    // the cover behind it and lands on 'desk' the same way this does.

    if (stage === 'drawer') {
      set({ fileStage: null, drawerOut: null })
      return
    }

    set({ fileStage: 'drawer' })
    const travel = get().motionOn ? FOLDER_TRAVEL_MS : 0
    window.setTimeout(() => {
      if (get().fileStage === 'drawer') set({ fileStage: null, drawerOut: null })
    }, travel)
  },

  /**
   * Closing the paper returns to wherever it was opened from: the closed cover
   * on the desk if the room sequence led here, or the room at rest if the File
   * Index did (in which case no drawer was ever pulled).
   */
  closeDossier: () =>
    set((s) =>
      s.fileStage
        ? // The cover turns shut again behind the paper, which is why the
          // stage goes back to 'desk' rather than staying 'opening'.
          { openDossierId: null, fileStage: 'desk' }
        : { openDossierId: null, drawerOut: null },
    ),

  setControlsEnabled: (controlsEnabled) => set({ controlsEnabled }),
  markLookedAround: () => {
    if (!get().hasLookedAround) set({ hasLookedAround: true })
  },
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  toggleMotion: () => set((s) => ({ motionOn: !s.motionOn })),
}))
