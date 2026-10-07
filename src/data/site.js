/**
 * Landing + identity copy. Phase 1 only needs the hero; the case-file content
 * model lands in phase 3 (src/data/caseFiles.js).
 */
export const SITE = {
  name: 'Prashanth',
  initials: 'p',
  role: '3rd Year CS Student',
  department: 'Portfolio Website',
  archiveNumber: '001',
  /** The two halves of the line under the CTA, either side of the rule. */
  ledger: ['Open a drawer, read a file', 'Every drawer holds a chapter'],

  intro: [
    'Projects, Hackathons, Grades and Designs.',
    "Everything I've built, filed and on record.",
    'Pull the light and start reading.',
  ],

  location: {
    label: 'AE',
    coordinates: '25.20° N / 55.27° E',
  },

  email: 'coolprash06@gmail.com',

  cta: 'OPEN THE FILES',
  prompt: 'PULL THE STRING TO LIGHTEN UP THE ROOM',
}

/**
 * Copy for the three beats between the drawer and the paper. Each beat is its
 * own click, so each one gets its own line and its own button - see the
 * `fileStage` note in state/archiveStore.js.
 */
export const FILE_SEQUENCE = {
  drawer: {
    /* Fallback only - FilePrompt prefers the open dossier's own
       `drawerLabel`, which names the actual cabinet the drawer belongs to. */
    eyebrow: 'Drawer open',
    title: 'There it is.',
    lines: ['Front of the stack, where it has been the whole time.'],
    cta: 'TAKE THE FILE',
  },
  desk: {
    eyebrow: 'On the desk / Unopened',
    title: 'Still sealed.',
    lines: ['Nothing in here is classified. Open it and the paper does the rest.'],
    cta: 'OPEN THE FILE',
  },
  /** Backs out of the sequence: folder to its drawer, camera to the room. */
  dismiss: 'Put it back',
}
