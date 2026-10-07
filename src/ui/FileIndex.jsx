import { useEffect, useRef } from 'react'
import { DOSSIERS, PENDING_FILES } from '../data/dossiers'

/**
 * Row in the index. Available files open their dossier; the weekly case files
 * that have not been made yet render as inert rows rather than being hidden,
 * so the index reads as an archive with one drawer filled rather than a list
 * with a single entry.
 */
function IndexRow({ file, available, onOpen }) {
  const Tag = available ? 'button' : 'div'

  return (
    <Tag
      {...(available
        ? { type: 'button', onClick: () => onOpen(file.id) }
        : { 'aria-disabled': 'true' })}
      className={`group flex w-full items-baseline gap-4 border-b border-cream-400/15 px-1 py-5 text-left transition-colors sm:gap-6 ${
        available
          ? 'cursor-pointer hover:border-brass-400/50 hover:bg-cream-50/5'
          : 'opacity-40'
      }`}
    >
      <span className="label w-14 shrink-0 text-cream-400">
        {file.fileNumber}
      </span>

      <span className="min-w-0 grow">
        <span
          className={`block font-display text-xl leading-tight sm:text-2xl ${
            available
              ? 'text-cream-50 group-hover:text-brass-400'
              : 'text-cream-200'
          }`}
        >
          {file.title}
        </span>
        <span className="mt-1 block text-[0.8rem] leading-relaxed text-cream-400">
          {file.summary}
        </span>
      </span>

      <span className="label hidden shrink-0 text-cream-400 sm:block">
        {available ? file.classification : 'Pending'}
      </span>

      <span
        aria-hidden="true"
        className={`shrink-0 transition-transform duration-300 ${
          available
            ? 'text-cream-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass-400'
            : 'text-cream-400/30'
        }`}
      >
        {available ? '↗' : '—'}
      </span>
    </Tag>
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
            <IndexRow
              key={dossier.id}
              file={dossier}
              available
              onOpen={onOpenDossier}
            />
          ))}
          {PENDING_FILES.map((file) => (
            <IndexRow key={file.id} file={file} available={false} />
          ))}
        </div>
      </div>
    </div>
  )
}
