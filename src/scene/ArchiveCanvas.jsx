import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { QUALITY } from '../lib/capabilities'
import { ArchiveRoom } from './ArchiveRoom'
import { CameraRig } from './CameraRig'

/* Initial framing only. Everything after the first frame - the responsive home
   pose and the file sequence's reframes - belongs to CameraRig. */
const CAMERA = { position: [0.6, 4.3, 10.6], fov: 34, near: 0.1, far: 60 }

export function ArchiveCanvas() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={CAMERA}
      dpr={QUALITY.dpr}
      shadows={QUALITY.shadows}
      gl={{
        antialias: QUALITY.antialias,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <Suspense fallback={null}>
        <ArchiveRoom />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
