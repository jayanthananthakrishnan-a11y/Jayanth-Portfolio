import { SITE } from '../data/site'
import { useArchive } from '../state/archiveStore'
import prashanthPhoto from '../assets/prashanth-photo.png'

function Toggle({ label, on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="label pointer-events-auto text-cream-400 transition-colors hover:text-cream-50"
    >
      {label}{' '}
      <span className={on ? 'text-cream-50' : 'text-cream-400/50'}>
        {on ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

/**
 * Always visible, including while the room is dark - the archive's chrome sits
 * outside the light-reveal sequence.
 */
export function TopBar({ onOpenIndex }) {
  const soundOn = useArchive((s) => s.soundOn)
  const motionOn = useArchive((s) => s.motionOn)
  const toggleSound = useArchive((s) => s.toggleSound)
  const toggleMotion = useArchive((s) => s.toggleMotion)

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="size-11 shrink-0 overflow-hidden rounded-full border border-cream-400/35 bg-forest-950/40 backdrop-blur-sm">
          <img
            src={prashanthPhoto}
            alt={SITE.name}
            className="size-full object-cover"
          />
        </div>
        <div className="hidden sm:block">
          <p className="label text-cream-50">{SITE.name}</p>
          <p className="label text-cream-400">{SITE.department}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden items-center gap-2 lg:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-brass-400" />
          <span className="label text-cream-400">Visitor Access</span>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <Toggle label="Sound" on={soundOn} onClick={toggleSound} />
          <Toggle label="Motion" on={motionOn} onClick={toggleMotion} />
        </div>

        <button
          type="button"
          onClick={onOpenIndex}
          className="pointer-events-auto flex items-center gap-3 border border-cream-400/35 bg-forest-950/40 px-4 py-3 backdrop-blur-sm transition-colors hover:border-brass-400/70 hover:bg-forest-800/60"
        >
          <span className="label text-cream-50">File Index</span>
          <span aria-hidden="true" className="flex flex-col gap-[3px]">
            <span className="block h-px w-4 bg-cream-400" />
            <span className="block h-px w-2.5 bg-cream-400" />
            <span className="block h-px w-4 bg-cream-400" />
          </span>
        </button>
      </div>
    </header>
  )
}
