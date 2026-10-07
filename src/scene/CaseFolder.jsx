import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { PALETTE } from '../lib/palette'
import { QUALITY } from '../lib/capabilities'
import { useArchive } from '../state/archiveStore'
import { formatSheetCount, useSheetCount } from '../state/paginationStore'
import { COVER_ASPECT, createCoverTexture } from './labelTexture'
import { OVERHANG, Paperclip } from './Paperclip'

const CAST = QUALITY.shadows

/** Folder footprint. Width follows the cover texture so type is never stretched. */
export const FOLDER_LENGTH = 1.05
export const FOLDER_WIDTH = FOLDER_LENGTH * COVER_ASPECT
const FOLDER_THICKNESS = 0.055

/** Flight damping. Tuned to land near FOLDER_TRAVEL_MS in the store. */
const FOLDER_DAMP = 4.6
/** Apex of the arc between drawer and desk, in world units above the midpoint. */
const ARC_LIFT = 0.82
/** Rise on hover, so the folder answers the pointer before it has moved. */
const HOVER_LIFT = 0.035

/* Lying in the drawer the folder is tipped up at the front, the way the top
   file in a full drawer sits. On the blotter it lies flat, and its heading is
   the caller's to choose. */
const REST_TILT_X = -0.1
const REST_TURN_Y = 0.07

/* --- The binding ------------------------------------------------------
   The folder is a bound file, not a stack of loose sheets, so it has a spine
   down its left edge: a rounded band the full height of the stack, stitched,
   with a crease scored into the cover a little inboard of it. The crease is
   what the cover actually folds along, which is why it belongs to the cover
   and travels with it, while the spine belongs to the body and stays put. */
const SPINE_RADIUS = 0.048
/** How far the spine's axis sits inboard of the folder's left edge. */
const SPINE_INSET = 0.022
/** Centre of the stack, from the cover's face down to the back board. */
const SPINE_Y = -0.0245
const STITCH_COUNT = 7
/** Where the stitches sit on the spine, measured round from the outer edge. */
const STITCH_ANGLE = Math.PI * 0.82

/* --- The clip ---------------------------------------------------------
   Clipped over the free edge of the cover - the one opposite the binding.
   Not the head, which is the corner a file is usually clipped at, and not the
   bound edge either: the spine is a raised band running the full height of
   that side and a clip cannot close over it, and the head is buried in the
   drawer for the whole of the first beat, where the drawer's back wall cuts
   the folder off at about a third of the way down. The clip has to be on an
   edge that is in shot both in the drawer and on the desk, and this is the
   one that is.

   Set in the clear band between the subject and the record line, which is the
   one gap on that edge wide enough to take it without landing on type.

   It belongs to the cover rather than to the body, so it is mounted inside
   the cover group: it rides the flight to the desk and turns with the cover
   for free. See scene/Paperclip for why it has to straddle an edge at all. */
const CLIP_Z = 0.02
/** Turns the clip's length across the folder, bend end pointing outboard. */
const CLIP_TURN = -Math.PI / 2

/* --- The cover turn ---------------------------------------------------
   Opening the file turns its front cover back on that spine, which is the
   same gesture the dossier's own page turns use one layer up. */

/**
 * Cover turn time. Purely cosmetic now - the flat dossier mounts the instant
 * the turn starts (see openFile in state/archiveStore) rather than waiting
 * for this to finish, so this only paces how the room's own cover animates
 * underneath the paper.
 */
const COVER_OPEN_MS = 620
/** Just short of flat, the way a stiff cover actually lies when laid back. */
const COVER_OPEN_ANGLE = Math.PI * 0.94

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

/**
 * The personnel folder: the middle beat of the drawer sequence.
 *
 * It lives in the drawer and flies to the desk, so it is mounted as a *child
 * of the drawer group* - that way it rides the drawer in and out for free,
 * with no second copy of the drawer's damping to keep in sync. The desk pose
 * is given in world space and converted into the drawer's frame every frame,
 * so the folder lands on the blotter and stays there however far the drawer
 * happens to be pulled.
 *
 * The one thing it does open is its cover. The pages themselves are never
 * rendered in 3D: the cover turns back while the flat dossier - the only
 * thing in this project that renders actual pages - fades in over the top of
 * it from the first frame of the turn, so the blank underside of this cover
 * is never on screen uncovered for long enough to read as empty.
 */
export function CaseFolder({ fileId, cover, restY, deskPose }) {
  const groupRef = useRef(null)
  const coverRef = useRef(null)
  /** 0 = in the drawer, 1 = on the desk. */
  const flight = useRef(0)
  /** 0 = cover shut, 1 = cover laid back. */
  const coverTurn = useRef(0)
  const hoverLift = useRef(0)

  const [hovered, setHovered] = useState(false)

  const fileStage = useArchive((s) => s.fileStage)
  const drawerOut = useArchive((s) => s.drawerOut)
  const motionOn = useArchive((s) => s.motionOn)
  const liftFolder = useArchive((s) => s.liftFolder)
  const openFile = useArchive((s) => s.openFile)

  const mine = drawerOut === fileId
  const onDesk =
    mine && (fileStage === 'moving' || fileStage === 'desk' || fileStage === 'opening')
  const opening = mine && fileStage === 'opening'
  // Neither mid-flight nor mid-turn is the folder a target: the sequence is
  // three clicks, and by then the third one has been spent.
  const interactive = mine && (fileStage === 'drawer' || fileStage === 'desk')

  /* The sheet count is typed onto the cover from the file's laid-out
     sheets, which are only known once they have been measured and change
     with the window - so the cover is repainted when it does. */
  const sheets = formatSheetCount(useSheetCount(fileId))
  const coverMap = useMemo(
    () => createCoverTexture({ ...cover, sheets }),
    [cover, sheets],
  )
  useEffect(() => () => coverMap.dispose(), [coverMap])

  /* Scratch vectors, reused every frame rather than allocated in the loop. */
  const vec = useMemo(
    () => ({
      rest: new Vector3(),
      desk: new Vector3(),
      control: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
    }),
    [],
  )

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group?.parent) return

    const target = onDesk ? 1 : 0
    flight.current = motionOn
      ? MathUtils.damp(flight.current, target, FOLDER_DAMP, delta)
      : target

    const lift = interactive && hovered ? HOVER_LIFT : 0
    hoverLift.current = motionOn
      ? MathUtils.damp(hoverLift.current, lift, 12, delta)
      : lift

    const t = smoothstep(MathUtils.clamp(flight.current, 0, 1))

    vec.rest.set(0, restY, 0)
    // The drawer is still sliding while the folder is in the air, so the desk
    // pose has to be re-resolved into the drawer's frame on every frame.
    vec.desk.copy(deskPose.position)
    group.parent.worldToLocal(vec.desk)

    // Quadratic arc, so the folder is lifted out and set down rather than
    // dragged through the drawer's front panel in a straight line.
    vec.control.addVectors(vec.rest, vec.desk).multiplyScalar(0.5)
    vec.control.y += ARC_LIFT

    const inv = 1 - t
    vec.a.copy(vec.rest).multiplyScalar(inv * inv)
    vec.b.copy(vec.control).multiplyScalar(2 * inv * t)
    group.position.copy(vec.a).add(vec.b).addScaledVector(vec.desk, t * t)
    group.position.y += hoverLift.current

    group.rotation.x = MathUtils.lerp(REST_TILT_X, 0, t)
    group.rotation.y = MathUtils.lerp(REST_TURN_Y, deskPose.rotationY, t)
    // A little roll through the middle of the arc; zero at both ends.
    group.rotation.z = Math.sin(t * Math.PI) * 0.09

    /* The cover is driven on a clock rather than damped, because the store is
       counting the same milliseconds before it hands the screen to the paper -
       an exponential approach would still be visibly moving when it did. Same
       smoothstep as the flight, so both beats are eased the same way. */
    if (motionOn) {
      const step = (delta * 1000) / COVER_OPEN_MS
      coverTurn.current = MathUtils.clamp(
        coverTurn.current + (opening ? step : -step),
        0,
        1,
      )
    } else {
      coverTurn.current = opening ? 1 : 0
    }
    if (coverRef.current) {
      coverRef.current.rotation.z = smoothstep(coverTurn.current) * COVER_OPEN_ANGLE
    }
  })

  useEffect(() => {
    if (!interactive && hovered) document.body.style.cursor = 'auto'
  }, [interactive, hovered])
  useEffect(() => () => { document.body.style.cursor = 'auto' }, [])

  const handlers = interactive
    ? {
        onPointerOver: (e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        },
        onClick: (e) => {
          e.stopPropagation()
          if (fileStage === 'drawer') liftFolder()
          else openFile()
        },
      }
    : {}

  const half = FOLDER_THICKNESS / 2
  const hinge = -FOLDER_WIDTH / 2
  const spineX = hinge + SPINE_INSET

  /* Stitches, spaced down the spine and short of both ends the way a sewn
     binding is. Positioned round the spine's radius so they sit on its
     surface and turn with it. */
  const stitches = useMemo(() => {
    const x = Math.cos(STITCH_ANGLE) * (SPINE_RADIUS + 0.001)
    const y = Math.sin(STITCH_ANGLE) * (SPINE_RADIUS + 0.001)
    const span = FOLDER_LENGTH * 0.76
    return Array.from({ length: STITCH_COUNT }, (_, i) => ({
      key: i,
      position: [
        spineX + x,
        SPINE_Y + y,
        -span / 2 + (span * i) / (STITCH_COUNT - 1),
      ],
    }))
  }, [spineX])

  return (
    <group ref={groupRef} {...handlers}>
      {/* --- Cover -------------------------------------------------------
          Hinged on the spine, so it turns back rather than lifting off. The
          pivot sits on the folder's left edge and its contents are pushed
          back out by the same amount, which leaves the shut cover exactly
          where it was before the hinge existed. */}
      <group ref={coverRef} position={[hinge, 0, 0]}>
        <group position={[-hinge, 0, 0]}>
          <mesh castShadow={CAST} receiveShadow={CAST}>
            <boxGeometry args={[FOLDER_WIDTH, FOLDER_THICKNESS, FOLDER_LENGTH]} />
            <meshStandardMaterial color={PALETTE.folderCover} roughness={0.94} />
          </mesh>

          {/* The typed face. A plane laid over the cover rather than a
              six-material box: only one face is ever read, and the texture's
              top edge wants to be the folder's far edge, the way a file lies
              when you read it. */}
          <mesh position={[0, half + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[FOLDER_WIDTH, FOLDER_LENGTH]} />
            <meshStandardMaterial
              map={coverMap}
              roughness={0.95}
              emissive="#ffffff"
              emissiveMap={coverMap}
              emissiveIntensity={hovered && interactive ? 0.14 : 0}
            />
          </mesh>

          {/* Score line the cover folds along, a thumb's width in from the
              spine - the crease that tells you which edge is bound. */}
          <mesh position={[hinge + SPINE_INSET * 2.4, half + 0.003, 0]}>
            <boxGeometry args={[0.005, 0.002, FOLDER_LENGTH * 0.94]} />
            <meshStandardMaterial color={PALETTE.folderEdge} roughness={1} />
          </mesh>

          {/* Sat on the cover face, with its bend hanging past the edge so
              the wire has somewhere to cross to the underside. */}
          <Paperclip
            position={[FOLDER_WIDTH / 2 + OVERHANG, half + 0.002, CLIP_Z]}
            rotation={[0, CLIP_TURN, 0]}
          />
        </group>
      </group>

      {/* --- Binding -----------------------------------------------------
          A rounded band down the bound edge, the full height of the stack, so
          the folder has a spine in silhouette instead of reading as a slab of
          loose paper. Half of it is buried in the folder; the outer half is
          what shows. */}
      <mesh
        position={[spineX, SPINE_Y, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow={CAST}
        receiveShadow={CAST}
      >
        <cylinderGeometry
          args={[SPINE_RADIUS, SPINE_RADIUS, FOLDER_LENGTH, QUALITY.segments]}
        />
        <meshStandardMaterial color={PALETTE.folderEdge} roughness={0.98} />
      </mesh>

      {stitches.map((s) => (
        <mesh key={s.key} position={s.position} rotation={[0, 0, STITCH_ANGLE]}>
          <boxGeometry args={[0.004, 0.016, 0.02]} />
          <meshStandardMaterial color={PALETTE.deskWoodDark} roughness={1} />
        </mesh>
      ))}

      {/* Sheets inside, sitting proud of the cover on one edge */}
      <mesh position={[0.012, -half - 0.016, 0.018]} castShadow={CAST}>
        <boxGeometry args={[FOLDER_WIDTH * 0.97, 0.03, FOLDER_LENGTH * 0.96]} />
        <meshStandardMaterial color="#fffaf0" roughness={1} />
      </mesh>

      {/* Back cover */}
      <mesh position={[0, -half - 0.038, 0]} castShadow={CAST} receiveShadow={CAST}>
        <boxGeometry args={[FOLDER_WIDTH, 0.022, FOLDER_LENGTH]} />
        <meshStandardMaterial color={PALETTE.folderEdge} roughness={0.95} />
      </mesh>

      {/* Index tab on the far edge */}
      <mesh position={[FOLDER_WIDTH * 0.24, 0, -FOLDER_LENGTH / 2 - 0.035]} castShadow={CAST}>
        <boxGeometry args={[FOLDER_WIDTH * 0.36, FOLDER_THICKNESS * 0.9, 0.07]} />
        <meshStandardMaterial color={PALETTE.folderEdge} roughness={0.95} />
      </mesh>
    </group>
  )
}
