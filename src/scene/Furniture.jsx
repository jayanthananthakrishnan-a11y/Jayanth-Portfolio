import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { PALETTE } from '../lib/palette'
import { QUALITY } from '../lib/capabilities'
import { useArchive } from '../state/archiveStore'
import { CaseFolder } from './CaseFolder'
import { PLATE_ASPECT, createLabelTexture } from './labelTexture'

const SEG = QUALITY.segments
const CAST = QUALITY.shadows

/* How far a drawer slides out, in world units. Set by the filled drawer: the
   folder has to clear the cabinet's top edge far enough for its cover to be
   read from above, which is most of the folder's own length. */
const DRAWER_OPEN = 0.8
/** Damping rate for that slide - about half a second of travel. */
const DRAWER_DAMP = 9
/** Small forward nudge on hover, so the drawer reads as grabbable. */
const DRAWER_NUDGE = 0.045

/** Tray panel thickness, and the height of the filed stack the folder rests on. */
const TRAY_PANEL = 0.035
const TRAY_STACK = 0.24

/* -------------------------------------------------------------------------- */
/* Filing cabinet                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The inside of a filled drawer: an open-topped tray with a stack of filed
 * paper in it. Only drawers that actually hold something are built this way -
 * a blank drawer stays the solid block it has always been, which is both
 * cheaper and correct, since it never opens far enough to look into.
 */
function DrawerTray({ width, depth, height, children }) {
  const w = width * 0.94
  const halfH = height / 2
  const halfW = w / 2
  const halfD = depth / 2

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -halfH + TRAY_PANEL / 2, 0]} receiveShadow={CAST}>
        <boxGeometry args={[w, TRAY_PANEL, depth]} />
        <meshStandardMaterial color={PALETTE.cabinetDark} roughness={0.85} />
      </mesh>

      {/* Sides */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (halfW - TRAY_PANEL / 2), 0, 0]}
          receiveShadow={CAST}
        >
          <boxGeometry args={[TRAY_PANEL, height, depth]} />
          <meshStandardMaterial color={PALETTE.cabinetDark} roughness={0.85} />
        </mesh>
      ))}

      {/* Back */}
      <mesh position={[0, 0, -halfD + TRAY_PANEL / 2]} receiveShadow={CAST}>
        <boxGeometry args={[w, height, TRAY_PANEL]} />
        <meshStandardMaterial color={PALETTE.cabinetDark} roughness={0.85} />
      </mesh>

      {/* Front panel - the face the plate and pull are fixed to. Its outer
          face sits exactly where the solid drawer's did, so a closed filled
          drawer is indistinguishable from a blank one. */}
      <mesh
        position={[0, 0, halfD - 0.02]}
        castShadow={CAST}
        receiveShadow={CAST}
      >
        <boxGeometry args={[w, height, 0.06]} />
        <meshStandardMaterial
          color={PALETTE.cabinetDrawer}
          roughness={0.72}
          metalness={0.18}
        />
      </mesh>

      {/* The rest of the drawer's contents. The folder rests on this rather
          than on the tray floor, so it sits close enough to the rim to be
          read over the front panel at the zoomed-in framing. */}
      <mesh
        position={[0, -halfH + TRAY_PANEL + TRAY_STACK / 2, -0.02]}
        castShadow={CAST}
        receiveShadow={CAST}
      >
        <boxGeometry args={[w * 0.93, TRAY_STACK, depth * 0.86]} />
        <meshStandardMaterial color={PALETTE.creamDim} roughness={1} />
      </mesh>

      {children}
    </group>
  )
}

/**
 * One drawer face: a proud panel, a cream label plate, and a brass pull.
 *
 * A drawer given a `plate` is a real one: its label is typed onto the plate,
 * it is built as a tray with the folder inside it, and clicking it pulls the
 * drawer and reframes the camera onto it. Drawers without one stay blank and
 * inert, as they were in phase 1 - the weekly case files have not been filed
 * yet.
 */
function Drawer({ y, width, depth, height, plate }) {
  // Drawer front sits at depth/2 + 0.01, so plate and bezel must clear that.
  const faceZ = depth / 2 + 0.022

  const interiorH = height * 0.86
  /* Where the folder lies: on top of the filed stack, not on the tray floor.
     0.08 clears the folder's own back cover and sheets below its origin. */
  const folderRestY = -interiorH / 2 + TRAY_PANEL + TRAY_STACK + 0.08

  // Height follows from the texture's aspect rather than the drawer's, so the
  // typed label reads the same on a tall drawer and a short one.
  const plateW = width * 0.66
  const plateH = plateW / PLATE_ASPECT

  const groupRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  const lampOn = useArchive((s) => s.lampOn)
  const motionOn = useArchive((s) => s.motionOn)
  const drawerOut = useArchive((s) => s.drawerOut)
  const pullDrawer = useArchive((s) => s.pullDrawer)

  // Nothing in the room responds until the light is on.
  const interactive = Boolean(plate) && lampOn
  const isOpen = Boolean(plate) && drawerOut === plate.id

  const labelMap = useMemo(
    () => (plate ? createLabelTexture(plate.label) : null),
    [plate],
  )
  useEffect(() => () => labelMap?.dispose(), [labelMap])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target =
      (isOpen ? DRAWER_OPEN : 0) + (hovered && interactive && !isOpen ? DRAWER_NUDGE : 0)

    groupRef.current.position.z = motionOn
      ? MathUtils.damp(groupRef.current.position.z, target, DRAWER_DAMP, delta)
      : target
  })

  // Cursor is owned by the component that set it; clear it if the drawer goes
  // inert (lamp off, or unmounted) while still hovered.
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
          pullDrawer(plate.id)
        },
      }
    : {}

  return (
    <group ref={groupRef} position={[0, y, 0]} {...handlers}>
      {plate ? (
        <DrawerTray width={width} depth={depth} height={interiorH}>
          {plate.cover && plate.deskPose && (
            /* Mounted inside the drawer group so it rides the slide for free;
               it converts its own desk pose out of this frame when it flies. */
            <CaseFolder
              fileId={plate.id}
              cover={plate.cover}
              restY={folderRestY}
              deskPose={plate.deskPose}
            />
          )}
        </DrawerTray>
      ) : (
        <mesh castShadow={CAST} receiveShadow={CAST}>
          <boxGeometry args={[width * 0.94, interiorH, depth + 0.02]} />
          <meshStandardMaterial
            color={PALETTE.cabinetDrawer}
            roughness={0.72}
            metalness={0.18}
          />
        </mesh>
      )}

      {/* Label plate. A typed plate lifts slightly on hover so the drawer
          answers the pointer before it has moved. */}
      <mesh position={[0, height * 0.16, faceZ]}>
        <planeGeometry args={[plateW, plateH]} />
        <meshStandardMaterial
          color={PALETTE.labelPlate}
          map={labelMap ?? undefined}
          roughness={0.9}
          emissive={PALETTE.labelPlate}
          emissiveMap={labelMap ?? undefined}
          emissiveIntensity={hovered && interactive ? 0.22 : 0}
        />
      </mesh>
      {/* Plate bezel */}
      <mesh position={[0, height * 0.16, faceZ - 0.006]}>
        <planeGeometry args={[plateW * 1.07, plateH * 1.32]} />
        <meshStandardMaterial
          color={PALETTE.cabinetDark}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Pull handle */}
      <mesh position={[0, -height * 0.2, faceZ + 0.02]} castShadow={CAST}>
        <boxGeometry args={[width * 0.44, height * 0.07, 0.05]} />
        <meshStandardMaterial
          color={PALETTE.handle}
          roughness={0.35}
          metalness={0.75}
        />
      </mesh>
    </group>
  )
}

/**
 * `plates` maps a drawer index (0 = top) to `{ id, label }`. Any index not in
 * the map gets a blank, inert drawer.
 */
export function FileCabinet({
  position,
  rotation = [0, 0, 0],
  drawers = 4,
  width = 1.35,
  height = 2.5,
  depth = 1.1,
  plates = {},
}) {
  const drawerHeight = height / drawers

  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, height / 2, 0]} castShadow={CAST} receiveShadow={CAST}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={PALETTE.cabinet}
          roughness={0.78}
          metalness={0.2}
        />
      </mesh>

      {Array.from({ length: drawers }, (_, i) => (
        <Drawer
          key={i}
          y={height - drawerHeight * (i + 0.5)}
          width={width}
          depth={depth}
          height={drawerHeight}
          plate={plates[i]}
        />
      ))}

      {/* Top cap - catches the lamp light and reads as a highlight edge */}
      <mesh position={[0, height + 0.02, 0]} castShadow={CAST}>
        <boxGeometry args={[width + 0.04, 0.05, depth + 0.04]} />
        <meshStandardMaterial
          color={PALETTE.cabinetDark}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Desk                                                                       */
/* -------------------------------------------------------------------------- */

function Leg({ x, z, height }) {
  return (
    <mesh position={[x, height / 2, z]} castShadow={CAST}>
      <boxGeometry args={[0.13, height, 0.13]} />
      <meshStandardMaterial color={PALETTE.deskWoodDark} roughness={0.85} />
    </mesh>
  )
}

export function Desk({
  position = [0, 0, 0],
  width = 5.0,
  depth = 2.2,
  height = 1.05,
}) {
  const topThickness = 0.1
  const legInsetX = width / 2 - 0.28
  const legInsetZ = depth / 2 - 0.28

  return (
    <group position={position}>
      {/* Top */}
      <mesh
        position={[0, height - topThickness / 2, 0]}
        castShadow={CAST}
        receiveShadow={CAST}
      >
        <boxGeometry args={[width, topThickness, depth]} />
        <meshStandardMaterial color={PALETTE.deskWood} roughness={0.68} />
      </mesh>

      {/* Green leather blotter */}
      <mesh position={[0, height + 0.006, 0.02]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={CAST}>
        <planeGeometry args={[width * 0.78, depth * 0.72]} />
        <meshStandardMaterial color={PALETTE.blotter} roughness={0.9} />
      </mesh>
      {/* Blotter border */}
      <mesh position={[0, height + 0.003, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.81, depth * 0.76]} />
        <meshStandardMaterial color={PALETTE.blotterEdge} roughness={0.95} />
      </mesh>

      <Leg x={-legInsetX} z={-legInsetZ} height={height} />
      <Leg x={legInsetX} z={-legInsetZ} height={height} />
      <Leg x={-legInsetX} z={legInsetZ} height={height} />
      <Leg x={legInsetX} z={legInsetZ} height={height} />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Desk props                                                                 */
/* -------------------------------------------------------------------------- */

/** A closed manila folder - the phase-3 entry point into a case file. */
export function ClosedFolder({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow={CAST} receiveShadow={CAST}>
        <boxGeometry args={[1.25, 0.035, 0.9]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.95} />
      </mesh>
      {/* Tab */}
      <mesh position={[0.32, 0, -0.5]} castShadow={CAST}>
        <boxGeometry args={[0.42, 0.032, 0.12]} />
        <meshStandardMaterial color={PALETTE.creamDim} roughness={0.95} />
      </mesh>
      {/* Pages peeking out, slightly offset */}
      <mesh position={[0.02, -0.012, 0.01]}>
        <boxGeometry args={[1.18, 0.02, 0.84]} />
        <meshStandardMaterial color="#fffaf0" roughness={1} />
      </mesh>
    </group>
  )
}

/** Brass ruler lying on the blotter. */
export function Ruler({ position, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow={CAST}>
      <boxGeometry args={[1.5, 0.018, 0.075]} />
      <meshStandardMaterial
        color={PALETTE.handle}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  )
}

/* -------------------------------------------------------------------------- */
/* Room shell                                                                 */
/* -------------------------------------------------------------------------- */

export function RoomShell() {
  return (
    <group>
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={CAST}
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={PALETTE.floor} roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 6, -6]} receiveShadow={CAST}>
        <planeGeometry args={[40, 16]} />
        <meshStandardMaterial color={PALETTE.wallBack} roughness={1} />
      </mesh>

      {/* Side walls, angled in to keep the room feeling enclosed */}
      <mesh position={[-9, 6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color={PALETTE.wallSide} roughness={1} />
      </mesh>
      <mesh position={[9, 6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color={PALETTE.wallSide} roughness={1} />
      </mesh>
    </group>
  )
}

export { SEG }
