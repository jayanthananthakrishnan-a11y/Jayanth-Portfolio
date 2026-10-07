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

const RESUME = getDossier('my-resume')
const HACKATHONS = getDossier('hackathons')
const PROJECTS = getDossier('projects')
const UI_DESIGNS = getDossier('ui-designs')
const GRADES = getDossier('grades')
const ARTICLES = getDossier('articles')

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
    the cover and the first sheet can never disagree. */
function coverFor(dossier) {
  return {
    department: SITE.department,
    classification: dossier.classification,
    subject: dossier.subject,
    fileNumber: dossier.fileNumber,
    sheets: String(dossier.pages.length).padStart(2, '0'),
    stamp: dossier.stamp,
  }
}

const RESUME_FOLDER_COVER = coverFor(RESUME)
const HACKATHONS_FOLDER_COVER = coverFor(HACKATHONS)
const PROJECTS_FOLDER_COVER = coverFor(PROJECTS)
const UI_DESIGNS_FOLDER_COVER = coverFor(UI_DESIGNS)
const GRADES_FOLDER_COVER = coverFor(GRADES)
const ARTICLES_FOLDER_COVER = coverFor(ARTICLES)

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

      {/* Cabinet bank behind the desk. The centre unit is the hero, and its
          top drawer is the personnel file, with the projects file in the
          drawer below it. The side cabinet to its right files the second
          dossier in its own top drawer. Every other drawer stays blank until
          the weekly case files are filed. */}
      <FileCabinet
        position={[0.5, 0, -2.9]}
        drawers={5}
        plates={{
          0: {
            id: RESUME.id,
            label: RESUME.title,
            cover: RESUME_FOLDER_COVER,
            deskPose: FOLDER_ON_DESK,
          },
          1: {
            id: PROJECTS.id,
            label: PROJECTS.title,
            cover: PROJECTS_FOLDER_COVER,
            deskPose: FOLDER_ON_DESK,
          },
        }}
      />
      {/* Side cabinet, to the right of the hero unit. Its top drawer holds
          the hackathons file, with the UI designs file in the drawer below
          it and the grades file below that; the bottom drawer stays blank
          until the weekly case files are filed. */}
      <FileCabinet
        position={[3.4, 0, -2.5]}
        rotation={[0, -0.24, 0]}
        drawers={4}
        height={2.3}
        plates={{
          0: {
            id: HACKATHONS.id,
            label: HACKATHONS.title,
            cover: HACKATHONS_FOLDER_COVER,
            deskPose: FOLDER_ON_DESK,
          },
          1: {
            id: UI_DESIGNS.id,
            label: UI_DESIGNS.title,
            cover: UI_DESIGNS_FOLDER_COVER,
            deskPose: FOLDER_ON_DESK,
          },
          2: {
            id: GRADES.id,
            label: GRADES.title,
            cover: GRADES_FOLDER_COVER,
            deskPose: FOLDER_ON_DESK,
          },
        }}
      />
      {/* Left cabinet, behind the desk. Its top drawer files the articles;
          the two below it stay blank. */}
      <FileCabinet
        position={[-2.6, 0, -3.1]}
        rotation={[0, 0.18, 0]}
        drawers={3}
        height={1.9}
        width={1.2}
        plates={{
          0: {
            id: ARTICLES.id,
            label: ARTICLES.title,
            cover: ARTICLES_FOLDER_COVER,
            deskPose: FOLDER_ON_DESK,
          },
        }}
      />

      <Desk position={[0, 0, DESK_Z]} height={DESK_HEIGHT} />

      <ClosedFolder position={[-1.1, DESK_HEIGHT + 0.045, DESK_Z + 0.1]} rotation={[0, 0.12, 0]} />
      <Ruler position={[0.1, DESK_HEIGHT + 0.02, DESK_Z + 0.85]} rotation={[0, -0.06, 0]} />

      <DeskLamp position={[1.35, DESK_HEIGHT, DESK_Z - 0.15]} />
    </group>
  )
}
