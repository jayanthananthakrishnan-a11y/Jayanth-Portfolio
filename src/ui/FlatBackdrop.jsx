/**
 * Stand-in for the 3D room when WebGL is unavailable or the scene crashed.
 * Pure CSS: a dark forest ground with a warm pool of light where the lamp
 * would be, so the landing copy still sits on something.
 */
export function FlatBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-forest-900"
      style={{
        backgroundImage:
          'radial-gradient(60% 45% at 72% 42%, rgba(255,217,160,0.16), transparent 70%),' +
          'radial-gradient(90% 70% at 50% 100%, rgba(36,64,47,0.55), transparent 75%)',
      }}
    />
  )
}
