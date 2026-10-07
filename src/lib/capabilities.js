/**
 * Device capability probing, run once at module load.
 *
 * Everything the 3D scene scales down (shadows, DPR, light count, geometry
 * segments) is decided here so there is exactly one place to tune quality.
 */

function detectWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) return false
    // Losing the context immediately keeps the probe from holding a GPU slot.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

function detectTier() {
  if (typeof window === 'undefined') return 'low'

  const cores = navigator.hardwareConcurrency ?? 4
  const memory = navigator.deviceMemory ?? 4
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const narrow = window.innerWidth < 768

  if (cores <= 4 || memory <= 4 || (coarse && narrow)) return 'low'
  if (cores <= 8 || memory <= 8) return 'medium'
  return 'high'
}

export const HAS_WEBGL = detectWebGL()

export const TIER = detectTier()

export const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

/** Per-tier render settings consumed by ArchiveCanvas and the scene meshes. */
export const QUALITY = {
  low: {
    dpr: [1, 1.25],
    shadows: false,
    fillLights: false,
    segments: 12,
    antialias: false,
  },
  medium: {
    dpr: [1, 1.5],
    shadows: true,
    shadowMapSize: 1024,
    fillLights: true,
    segments: 20,
    antialias: true,
  },
  high: {
    dpr: [1, 2],
    shadows: true,
    shadowMapSize: 2048,
    fillLights: true,
    segments: 32,
    antialias: true,
  },
}[TIER]
