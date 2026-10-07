import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { useArchive } from '../state/archiveStore'

/**
 * The room's one camera system: orbit controls, the responsive home framing,
 * and the reframes that drive the file sequence.
 *
 * They are one component because they are one decision. Only ever one of them
 * may own the camera, and the cheapest way to guarantee that is for the thing
 * that moves the camera to also be the thing that switches the controls off -
 * drei's OrbitControls skips its update() entirely while disabled, so the rig
 * has the camera to itself for the whole of a move and hands it back, settled,
 * at the end.
 */

/** Framing at rest. The room is composed for landscape; see ArchiveRoom. */
const HOME = {
  target: [0.3, 1.5, -0.4],
  landscape: { position: [0.6, 4.3, 10.6], fov: 34 },
  portrait: { position: [0.9, 4.6, 13.5], fov: 46 },
}

/**
 * The framings of the file sequence, each centred on its subject.
 *
 * `shiftX` slides the whole view sideways in landscape, which puts the subject
 * right of centre and leaves the left third of the frame for the prompt copy -
 * the same column the landing copy occupies. Portrait has no such column (the
 * copy goes underneath instead), so it keeps the subject centred.
 *
 * `drawer` is keyed by dossier id rather than being one fixed pose, because
 * each filed drawer lives in a different cabinet: the framing has to reframe
 * on whichever one just slid open, not always the hero unit's. `desk` stays a
 * single pose because every folder lands on the same spot of blotter - see
 * FOLDER_ON_DESK in ArchiveRoom.
 */
const FOCUS = {
  drawer: {
    // Looking down into the open top drawer of the hero cabinet.
    'my-resume': {
      position: [0.5, 4.76, 0.97],
      target: [0.5, 2.36, -2.1],
      fov: 34,
      shiftX: -0.38,
    },
    // Looking down into the open second drawer of the hero cabinet: the
    // top-drawer pose dropped by one drawer height (0.5).
    projects: {
      position: [0.5, 4.26, 0.97],
      target: [0.5, 1.86, -2.1],
      fov: 34,
      shiftX: -0.38,
    },
    // Looking down into the open top drawer of the side cabinet.
    hackathons: {
      position: [2.48, 4.52, 1.26],
      target: [3.21, 2.12, -1.72],
      fov: 34,
      shiftX: -0.38,
    },
    // Looking down into the open second drawer of the side cabinet: the
    // top-drawer pose dropped by one drawer height (2.3 / 4 = 0.575).
    'ui-designs': {
      position: [2.48, 3.945, 1.26],
      target: [3.21, 1.545, -1.72],
      fov: 34,
      shiftX: -0.38,
    },
    // Looking down into the open third drawer of the side cabinet: dropped
    // by one more drawer height (0.575).
    grades: {
      position: [2.48, 3.37, 1.26],
      target: [3.21, 0.97, -1.72],
      fov: 34,
      shiftX: -0.38,
    },
    // Looking down into the open top drawer of the left cabinet: the side
    // cabinet's top-drawer pose, taken relative to its cabinet and carried
    // onto this one (top drawer centre y = 1.9 - 1.9 / 6, turned 0.18).
    articles: {
      position: [-1.91, 4.09, 0.71],
      target: [-2.46, 1.69, -2.31],
      fov: 34,
      shiftX: -0.38,
    },
  },
  // The blotter, where the folder is set down beside the lamp.
  desk: {
    position: [0.55, 2.98, 3.74],
    target: [0.55, 1.1, 1.15],
    fov: 34,
    shiftX: -0.45,
  },
}

/* Portrait crops these hard, so back off along the same sight line rather than
   inventing a second pair of poses that could drift out of agreement, then
   drop the whole view. Dropping the camera and its target together is a pure
   translation - it lifts the subject into the top half of a tall frame without
   changing the angle it is seen from, which is where the prompt copy moving to
   the bottom needs it to be. */
const PORTRAIT_PULL = 1.45
const PORTRAIT_DROP = 0.9
const PORTRAIT_FOV = 44

/** Damping for every camera move. ~1s to settle. */
const MOVE_DAMP = 3.4
/** Distance at which a move is called done and the camera is snapped exact. */
const SETTLE = 0.012

function dampVector(current, goal, lambda, delta) {
  current.x = MathUtils.damp(current.x, goal.x, lambda, delta)
  current.y = MathUtils.damp(current.y, goal.y, lambda, delta)
  current.z = MathUtils.damp(current.z, goal.z, lambda, delta)
}

/** Every beat after the drawer shares one framing: the camera leads the
    folder to the blotter and then holds it while the cover turns back. */
function focusKeyFor(fileStage) {
  if (fileStage === 'drawer') return 'drawer'
  if (fileStage === 'moving' || fileStage === 'desk' || fileStage === 'opening') {
    return 'desk'
  }
  return null
}

function resolvePose(focusKey, drawerOut, portrait) {
  if (!focusKey) {
    const preset = portrait ? HOME.portrait : HOME.landscape
    return {
      position: new Vector3(...preset.position),
      target: new Vector3(...HOME.target),
      fov: preset.fov,
    }
  }

  // The drawer framing depends on which cabinet's drawer is actually open;
  // every other focus key has just the one pose. Falls back to the hero
  // drawer's pose if an unrecognised id ever reaches here, so a bad id fails
  // safe onto a real framing rather than onto undefined.
  const preset =
    focusKey === 'drawer'
      ? FOCUS.drawer[drawerOut] ?? FOCUS.drawer['my-resume']
      : FOCUS[focusKey]
  const target = new Vector3(...preset.target)
  const position = new Vector3(...preset.position)

  if (!portrait) {
    target.x += preset.shiftX
    position.x += preset.shiftX
    return { position, target, fov: preset.fov }
  }

  position.sub(target).multiplyScalar(PORTRAIT_PULL).add(target)
  position.y -= PORTRAIT_DROP
  target.y -= PORTRAIT_DROP
  return { position, target, fov: PORTRAIT_FOV }
}

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  const fileStage = useArchive((s) => s.fileStage)
  const drawerOut = useArchive((s) => s.drawerOut)
  const motionOn = useArchive((s) => s.motionOn)
  const controlsEnabled = useArchive((s) => s.controlsEnabled)
  const markLookedAround = useArchive((s) => s.markLookedAround)

  const controls = useRef(null)
  /** The orbit target as the rig is currently moving it. */
  const look = useMemo(() => new Vector3(...HOME.target), [])

  const portrait = size.width / size.height < 1
  const focusKey = focusKeyFor(fileStage)
  const focused = focusKey !== null

  const pose = useMemo(
    () => resolvePose(focusKey, drawerOut, portrait),
    [focusKey, drawerOut, portrait],
  )

  /**
   * True while the rig owns the camera.
   *
   * A ref and not state: it is read and cleared inside the frame loop, and the
   * only thing it gates is whether the controls are enabled - which is applied
   * imperatively below for the same reason the camera is. Making it state
   * would re-render the scene on every settle for nothing.
   */
  const driving = useRef(true)

  /* Any change of pose - a new stage, or an orientation flip - is driven, not
     snapped. On mount the home pose already matches the camera's initial
     props, so the first move settles immediately and costs nothing. */
  useEffect(() => {
    driving.current = true
  }, [focusKey, drawerOut, portrait])

  useFrame((_, delta) => {
    // The rig and the user never hold the camera at the same time: while a
    // move is running, or a focus framing is being held, the controls are off
    // and drei skips their update() entirely.
    if (controls.current) {
      controls.current.enabled = controlsEnabled && !driving.current && !focused
    }
    if (!driving.current) return

    const { position, target, fov } = pose

    if (motionOn) {
      dampVector(camera.position, position, MOVE_DAMP, delta)
      dampVector(look, target, MOVE_DAMP, delta)
      camera.fov = MathUtils.damp(camera.fov, fov, MOVE_DAMP, delta)
    } else {
      camera.position.copy(position)
      look.copy(target)
      camera.fov = fov
    }

    const settled =
      camera.position.distanceTo(position) < SETTLE &&
      look.distanceTo(target) < SETTLE

    if (settled) {
      camera.position.copy(position)
      look.copy(target)
      camera.fov = fov
    }

    // Driving the camera imperatively is the r3f way - three.js owns this
    // object's mutation. (react/immutability is off for src/scene.)
    camera.updateProjectionMatrix()
    if (controls.current) controls.current.target.copy(look)
    camera.lookAt(look)

    // Handing back mid-move would let OrbitControls clamp the camera to its
    // orbit limits, which the focus poses sit well inside of.
    if (settled) driving.current = false
  })

  return (
    <OrbitControls
      ref={controls}
      /* Camera controls stay live in the dark - the user is meant to be able
         to look around the unlit room before finding the chain. `enabled` is
         set in the frame loop above, not here, so there is one owner of it.

         No `target` prop either: the rig owns the orbit target and establishes
         it on the first frame of the mount move. A prop here would compete. */
      enablePan={false}
      enableZoom
      minDistance={8}
      maxDistance={16}
      minPolarAngle={Math.PI * 0.2}
      maxPolarAngle={Math.PI * 0.46}
      minAzimuthAngle={-Math.PI * 0.22}
      maxAzimuthAngle={Math.PI * 0.22}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.42}
      zoomSpeed={0.5}
      onStart={markLookedAround}
    />
  )
}
