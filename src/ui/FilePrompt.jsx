import { useEffect } from 'react'
import { FILE_SEQUENCE } from '../data/site'
import { getDossier } from '../data/dossiers'
import { useArchive } from '../state/archiveStore'
import { ArchiveButton } from './ArchiveButton'

/**
 * The copy beside the folder during the file sequence.
 *
 * Two beats, same column the landing copy uses, so the room only ever speaks
 * from one place. It renders in the DOM rather than as a drei <Html> inside
 * the scene for the same reason everything else flat does: the ui layer and
 * the scene layer share the store and nothing else.
 *
 * The prompt is also the keyboard path through the sequence, which the 3D
 * folder alone could not be - clicking a mesh is not reachable by tab.
 */
export function FilePrompt() {
  const fileStage = useArchive((s) => s.fileStage)
  const drawerOut = useArchive((s) => s.drawerOut)
  const openDossierId = useArchive((s) => s.openDossierId)
  const liftFolder = useArchive((s) => s.liftFolder)
  const openFile = useArchive((s) => s.openFile)
  const returnFile = useArchive((s) => s.returnFile)

  /* 'moving' and 'opening' show nothing: the closed cover is a beat of its own
     and must not be announced over a folder that is still in the air, and the
     cover turn is the paper's entrance, not a thing to caption. */
  const beat = fileStage === 'drawer' || fileStage === 'desk' ? fileStage : null
  const show = Boolean(beat) && !openDossierId

  /* Escape keeps working through the two beats the panel sits out - the flight
     and the cover turn - because otherwise the sequence has stretches with no
     way back out of it, and the cover turn is long enough to be caught in. */
  const listening = Boolean(fileStage) && !openDossierId

  useEffect(() => {
    if (!listening) return
    function onKeyDown(e) {
      if (e.key === 'Escape') returnFile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [listening, returnFile])

  const copy = FILE_SEQUENCE[beat ?? 'drawer']
  const dossier = getDossier(drawerOut)

  return (
    <div
      /* The copy sits beside the folder in landscape and under it in portrait,
         because the focus framings leave their clear space in different places
         - see PORTRAIT_DROP in scene/CameraRig.jsx. */
      className={`pointer-events-none absolute inset-0 z-30 flex flex-col justify-end px-5 pb-20 transition-opacity duration-500 sm:px-10 lg:px-16 landscape:justify-center landscape:pb-0 ${
        show ? 'opacity-100' : 'opacity-0 [&_*]:pointer-events-none'
      }`}
      /* The panel fades rather than unmounting, so while it is invisible its
         buttons have to stop taking clicks - otherwise they sit on top of the
         landing copy's own button and swallow it. `inert` takes it out of the
         tab order and the a11y tree; the descendant rule is what lets a click
         reach the room behind it. */
      inert={!show}
    >
      {/* --- Way out, from the corner ---------------------------------
          The same action as the text link under the button below, given the
          shape the rest of the room's chrome uses and parked where a back
          control is looked for. The link stays: it is where the eye already
          is, at the end of the copy, and this is where the hand goes.

          Desk beat only. In the drawer beat the file has not been taken out
          yet, so there is nothing to put back - "dismiss" there closes the
          drawer, which is what the link below already says.

          It clears the top bar rather than sitting in the very corner,
          because the monogram is already there. */}
      {beat === 'desk' && (
        <button
          type="button"
          onClick={returnFile}
          className="pointer-events-auto absolute left-5 top-[5.5rem] flex items-center gap-3 border border-cream-400/35 bg-forest-950/50 px-4 py-3 backdrop-blur-sm transition-colors hover:border-brass-400/70 hover:bg-forest-800/60 sm:left-7 sm:top-[6.75rem]"
        >
          <span aria-hidden="true" className="text-cream-400">
            &#8592;
          </span>
          <span className="label text-cream-50">Put file back</span>
        </button>
      )}

      {/* Readability scrim, running from whichever edge the copy is on. The lit
          desk sits directly behind the text and needs its own ground. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden landscape:block"
        style={{
          background:
            'linear-gradient(100deg, rgba(6,13,9,0.94) 0%, rgba(6,13,9,0.8) 34%, rgba(6,13,9,0.25) 62%, transparent 82%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 landscape:hidden"
        style={{
          background:
            'linear-gradient(0deg, rgba(6,13,9,0.96) 0%, rgba(6,13,9,0.92) 42%, rgba(6,13,9,0.3) 72%, transparent 92%)',
        }}
      />

      <div className="max-w-md">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className="text-cream-400">
            +
          </span>
          <span className="label text-cream-400">
            {/* The drawer beat names which cabinet the file lives in, which
                is a fact about the dossier and not about the beat - the desk
                beat's "Unopened" copy has no such per-file variant. */}
            {beat === 'drawer' && dossier?.drawerLabel
              ? dossier.drawerLabel
              : copy.eyebrow}
          </span>
          {beat === 'desk' && dossier && (
            /* The same word that is stamped on the cover three feet away, in
               the same red. */
            <span className="label border border-stamp-500/60 px-2 py-1 text-stamp-400">
              {dossier.stamp}
            </span>
          )}
        </div>

        <h2 className="font-display text-5xl leading-[1.02] text-cream-50 sm:text-6xl">
          {copy.title}
        </h2>

        <div className="mt-6 space-y-1.5">
          {copy.lines.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-cream-200/85">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-9 flex flex-col items-start gap-4">
          <ArchiveButton
            label={copy.cta}
            onClick={beat === 'desk' ? openFile : liftFolder}
          />
          <button
            type="button"
            onClick={returnFile}
            className="label pointer-events-auto text-cream-400 underline decoration-cream-400/30 underline-offset-[6px] transition-colors hover:text-cream-100 hover:decoration-brass-400/70"
          >
            {FILE_SEQUENCE.dismiss}
          </button>
        </div>

        {dossier && (
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="label text-cream-400">
              File No. {dossier.fileNumber}
            </span>
            <span aria-hidden="true" className="h-px w-6 bg-cream-400/40" />
            <span className="label text-cream-400">
              {String(dossier.pages.length).padStart(2, '0')} sheets
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
