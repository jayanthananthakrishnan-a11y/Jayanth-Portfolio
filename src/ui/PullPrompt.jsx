import { SITE } from '../data/site'
import { useArchive } from '../state/archiveStore'

/**
 * The only instruction shown while the room is dark. It fades out the moment
 * the chain is pulled, before the light has finished coming up.
 */
export function PullPrompt() {
  const lampOn = useArchive((s) => s.lampOn)
  const pulling = useArchive((s) => s.pulling)
  const hasLookedAround = useArchive((s) => s.hasLookedAround)

  const hidden = lampOn || pulling

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-[18%] z-20 flex flex-col items-center gap-3 px-6 text-center transition-opacity duration-500 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden={hidden}
    >
      <p className="label text-cream-100/90 animate-[breathe_3.2s_ease-in-out_infinite]">
        {SITE.prompt}
      </p>
      <p
        className={`label text-cream-400/60 transition-opacity duration-500 ${
          hasLookedAround ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Drag to look around
      </p>
    </div>
  )
}
