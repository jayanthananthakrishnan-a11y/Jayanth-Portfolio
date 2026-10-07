import { SITE } from '../data/site'
import { useArchive } from '../state/archiveStore'

/** Status strip along the bottom edge. Reads differently before and after the pull. */
export function CornerMeta() {
  const lampOn = useArchive((s) => s.lampOn)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 p-5 sm:p-7">
      <div className="flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full transition-colors duration-700 ${
            lampOn ? 'bg-brass-400' : 'bg-cream-400/40'
          }`}
        />
        <span className="label text-cream-400">
          <span className="hidden sm:inline">
            {lampOn
              ? 'Archive online / awaiting your curiosity'
              : 'Archive dark / power at the desk'}
          </span>
          <span className="sm:hidden">{lampOn ? 'Online' : 'Dark'}</span>
        </span>
      </div>

      <span className="label hidden text-cream-400/70 lg:block">
        Click to explore &middot; Drag to look
      </span>

      <div className="flex items-center gap-3">
        <span className="label hidden text-cream-400 sm:inline">
          {SITE.location.coordinates}
        </span>
        <span className="label text-cream-400/60">{SITE.location.label}</span>
      </div>
    </div>
  )
}
