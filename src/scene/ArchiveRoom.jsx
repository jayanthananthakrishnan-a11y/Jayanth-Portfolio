import { Vector3 } from 'three'
import { getDossier } from '../data/dossiers'
import { SITE } from '../data/site'
import { LightRig } from './LightRig'
import { DeskLamp } from './DeskLamp'
import {
  ClosedFolder,
  Desk,
  FileCabinet,
  RoomShell,
  Ruler,
} from './Furniture'

const DESK_HEIGHT = 1.05
const DESK_Z = 1.1

const RESUME = getDossier('resume')
const FULL_STACK = getDossier('full-stack-projects')
const MOBILE = getDossier('mobile-applications')
const HACKATHON_EXPERIENCE = getDossier('hackathon-experience')
const RESEARCH = getDossier('research-areas')

/**
 * Where the personnel folder is set down when it leaves its drawer: on the
 * blotter, just clear of the lamp base, angled a few degrees off square so it
 * reads as put down by hand.
 *
 * Given in world space. `CaseFolder` is mounted inside the drawer, so it
 * converts this into the drawer's frame itself - see the note there.
 */
const FOLDER_ON_DESK = {
  position: new Vector3(0.55, DESK_HEIGHT + 0.052, DESK_Z + 0.05),
  rotationY: -0.12,
}

/** The cover typed onto each folder. Content comes from the dossier itself so
    the cover and the first sheet can never disagree. The sheet count is
    added by CaseFolder, from the file's laid-out sheets. */
function coverFor(dossier) {
  return {
    department: SITE.department,
    classification: dossier.classification,
    subject: dossier.subject,
    fileNumber: dossier.fileNumber,
    stamp: dossier.stamp,
  }
}

/** A filed drawer: its dossier's title on the plate, its cover in the tray. */
function plateFor(dossier) {
  return {
    id: dossier.id,
    label: dossier.title,
    cover: coverFor(dossier),
    deskPose: FOLDER_ON_DESK,
  }
}

/* Built once, so the label and cover textures are not repainted per render. */
const HERO_PLATES = {
  0: plateFor(RESUME),
  1: plateFor(FULL_STACK),
  2: plateFor(MOBILE),
}
const SIDE_PLATES = {
  0: plateFor(HACKATHON_EXPERIENCE),
  1: plateFor(RESEARCH),
}

/**
 * Composition of the archive room. Camera framing assumes this layout, so move
 * the presets in CameraRig if you rearrange anything here - the drawer and desk
 * focus poses in particular are framed on the cabinet and the blotter.
 */
export function ArchiveRoom() {
  return (
    <group>
      <LightRig />
      <RoomShell />

      {/* Cabinet bank behind the desk. The centre unit is the hero: its
          top drawer is the resume, with the full stack projects file below
          it and the mobile applications file below that. The side cabinet
          to its right files the hackathon & experience dossier in its top
          drawer and research areas below it. Every other drawer stays blank. */}
      <FileCabinet
        position={[0.5, 0, -2.9]}
        drawers={5}
        plates={HERO_PLATES}
      />
      {/* Side cabinet, to the right of the hero unit. The bottom two drawers
          are blank. */}
      <FileCabinet
        position={[3.4, 0, -2.5]}
        rotation={[0, -0.24, 0]}
        drawers={4}
        height={2.3}
        plates={SIDE_PLATES}
      />
      {/* Left cabinet, behind the desk. All three drawers are blank. */}
      <FileCabinet
        position={[-2.6, 0, -3.1]}
        rotation={[0, 0.18, 0]}
        drawers={3}
        height={1.9}
        width={1.2}
      />

      <Desk position={[0, 0, DESK_Z]} height={DESK_HEIGHT} />

      <ClosedFolder position={[-1.1, DESK_HEIGHT + 0.045, DESK_Z + 0.1]} rotation={[0, 0.12, 0]} />
      <Ruler position={[0.1, DESK_HEIGHT + 0.02, DESK_Z + 0.85]} rotation={[0, -0.06, 0]} />

      <DeskLamp position={[1.35, DESK_HEIGHT, DESK_Z - 0.15]} />
    </group>
  )
}
