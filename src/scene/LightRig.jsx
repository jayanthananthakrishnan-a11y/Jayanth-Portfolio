import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { PALETTE } from '../lib/palette'
import { QUALITY } from '../lib/capabilities'
import { useArchive } from '../state/archiveStore'

/* Ramp shaped so the room reaches ~98% brightness about 1.2s after the pull. */
const RAMP_LAMBDA = 3.25
/* Held dark for a beat after the chain snaps, so the bulb visibly leads. */
const REVEAL_DELAY = 0.15

/** Intensities at the two ends of the reveal: [unlit, lit]. */
const AMBIENT = [0.1, 0.4]
const HEMI = [0.05, 0.34]
const SILHOUETTE = [0.5, 0.14]
const KEY_FILL = [0, 0.75]
const RIM = [0, 0.32]
const FOG_DENSITY = [0.045, 0.022]

/**
 * All room lighting other than the lamp's own bulb.
 *
 * Before the pull the room sits at a hair above black with one cold light
 * behind it, which is just enough to read the desk and cabinets as silhouettes.
 */
export function LightRig() {
  const lampOn = useArchive((s) => s.lampOn)
  const motionOn = useArchive((s) => s.motionOn)

  const level = useRef(0)
  const waited = useRef(0)

  const ambientRef = useRef(null)
  const hemiRef = useRef(null)
  const silhouetteRef = useRef(null)
  const keyFillRef = useRef(null)
  const rimRef = useRef(null)
  const fogRef = useRef(null)

  useFrame((_, delta) => {
    if (!motionOn) {
      level.current = lampOn ? 1 : 0
    } else if (lampOn) {
      waited.current += delta
      if (waited.current >= REVEAL_DELAY) {
        level.current = MathUtils.damp(level.current, 1, RAMP_LAMBDA, delta)
      }
    } else {
      waited.current = 0
      level.current = MathUtils.damp(level.current, 0, RAMP_LAMBDA, delta)
    }

    const t = level.current
    const at = (range) => MathUtils.lerp(range[0], range[1], t)

    if (ambientRef.current) ambientRef.current.intensity = at(AMBIENT)
    if (hemiRef.current) hemiRef.current.intensity = at(HEMI)
    if (silhouetteRef.current) silhouetteRef.current.intensity = at(SILHOUETTE)
    if (keyFillRef.current) keyFillRef.current.intensity = at(KEY_FILL)
    if (rimRef.current) rimRef.current.intensity = at(RIM)
    if (fogRef.current) fogRef.current.density = at(FOG_DENSITY)
  })

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={[PALETTE.wallBack, FOG_DENSITY[0]]} />

      <ambientLight ref={ambientRef} color={PALETTE.ambientWarm} intensity={AMBIENT[0]} />
      <hemisphereLight
        ref={hemiRef}
        color={PALETTE.ambientWarm}
        groundColor={PALETTE.floor}
        intensity={HEMI[0]}
      />

      {/* Cold back light: the only thing separating the furniture from the
          wall while the room is dark. */}
      <directionalLight
        ref={silhouetteRef}
        position={[-5, 7, -4]}
        color={PALETTE.ambientCold}
        intensity={SILHOUETTE[0]}
      />

      {QUALITY.fillLights && (
        <>
          {/* Warm fill from camera-left, lifting the desk front once lit. */}
          <directionalLight
            ref={keyFillRef}
            position={[-3.5, 4.5, 6]}
            color={PALETTE.lampWarm}
            intensity={0}
            castShadow={QUALITY.shadows}
            shadow-mapSize-width={QUALITY.shadowMapSize ?? 512}
            shadow-mapSize-height={QUALITY.shadowMapSize ?? 512}
            shadow-camera-near={1}
            shadow-camera-far={22}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-4}
            shadow-bias={-0.0018}
          />
          {/* Cool rim along the cabinet tops. */}
          <directionalLight
            ref={rimRef}
            position={[6, 5, -5]}
            color={PALETTE.ambientCold}
            intensity={0}
          />
        </>
      )}
    </>
  )
}
