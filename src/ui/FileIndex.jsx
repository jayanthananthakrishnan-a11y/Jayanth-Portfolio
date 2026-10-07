import { useEffect, useRef } from 'react'
import { DOSSIERS } from '../data/dossiers'

/** Row in the index. Clicking it opens that dossier directly. */
function IndexRow({ file, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(file.id)}
      className="group flex w-full cursor-pointer items-baseline gap-4 border-b border-cream-400/15 px-1 py-5 text-left transition-colors hover:border-brass-400/50 hover:bg-cream-50/5 sm:gap-6"
    >
      <span className="label w-14 shrink-0 text-cream-400">
        {file.fileNumber}
      </span>

      <span className="min-w-0 grow">
        <span className="block font-display text-xl leading-tight text-cream-50 group-hover:text-brass-400 sm:text-2xl">
          {file.title}
        </span>
        {file.summary && (
          <span className="mt-1 block text-[0.8rem] leading-relaxed text-cream-400">
            {file.summary}
          </span>
        )}
      </span>

      <span className="label hidden shrink-0 text-cream-400 sm:block">
        {file.classification}
      </span>

      <span
        aria-hidden="true"
        className="shrink-0 text-cream-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass-400"
      >
        ↗
      </span>
    </button>
  )
}

/** The archive's table of contents, opened from the TopBar. */
export function FileIndex({ onClose, onOpenDossier }) {
  const panelRef = useRef(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="File Index"
      tabIndex={-1}
      className="absolute inset-0 z-40 flex flex-col bg-forest-950/94 backdrop-blur-sm outline-none"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-cream-400/15 px-5 py-4 sm:px-8">
        <div>
          <p className="label text-cream-400">The Archive</p>
          <h1 className="font-display text-2xl italic leading-tight text-cream-50">
            File Index
          </h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close file index"
          className="flex size-11 items-center justify-center border border-cream-400/35 bg-forest-950/50 text-cream-200 transition-colors hover:border-brass-400/70 hover:text-cream-50"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            &times;
          </span>
        </button>
      </header>

      <div className="grow overflow-y-auto px-5 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          {DOSSIERS.map((dossier) => (
            <IndexRow key={dossier.id} file={dossier} onOpen={onOpenDossier} />
          ))}
        </div>
      </div>
    </div>
  )
}
