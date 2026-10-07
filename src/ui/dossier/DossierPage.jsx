import { useLayoutEffect, useRef, useState } from 'react'
import { Block } from './blocks'

const SPACING_STEPS = ['normal', 'compact', 'tight']

/**
 * A `fitSpacing` page keeps normal spacing wherever it fits and steps down to
 * `compact`, then `tight`, only while its body would otherwise scroll - so a
 * short window closes the gaps rather than growing a scrollbar, and a tall
 * one keeps the page at its most comfortable. Every other page keeps the
 * spacing its data asks for.
 *
 * Measured before paint, so a step never shows as a flash of scrollbar. The
 * steps restart from `normal` whenever the sheet's height changes, which is
 * what lets a window grown taller relax the spacing again.
 */
function useSpacing(page, bodyRef) {
  const [fit, setFit] = useState({ height: 0, step: 0 })

  /* Runs after every render: each step re-renders, and is checked again. */
  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!page.fitSpacing || !body) return
    const height = body.clientHeight
    if (height !== fit.height) {
      setFit({ height, step: 0 })
    } else if (
      body.scrollHeight > height &&
      fit.step < SPACING_STEPS.length - 1
    ) {
      setFit({ height, step: fit.step + 1 })
    }
  })

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!page.fitSpacing || !body) return
    const observer = new ResizeObserver(() => {
      const height = body.clientHeight
      setFit((f) => (f.height === height ? f : { height, step: 0 }))
    })
    observer.observe(body)
    return () => observer.disconnect()
  }, [page.fitSpacing, bodyRef])

  if (page.fitSpacing) return SPACING_STEPS[fit.step]
  return page.tight ? 'tight' : page.compact ? 'compact' : 'normal'
}

/**
 * The id a sheet carries in Reading View, where a `contents` entry scrolls to
 * it. Only there: the spread can hold the same sheet twice mid-turn (under
 * the leaf and on it), and an id has to be unique.
 */
export function readingSheetId(page) {
  return `sheet-${page.id}`
}

/**
 * One sheet of paper.
 *
 * This is the single page primitive for the whole archive - the paged spread
 * view and the Reading View both render this, so a page can never look like
 * two different things depending on where you read it. The only difference
 * between the two is `variant`: a spread sheet fills its half of the spread,
 * while a Reading View sheet is a fixed page in proportion to its width
 * (US Letter, never under 36rem). Both have a fixed height because the
 * sheets are paginated to it - see flow.js.
 *
 * Header and footer are metadata strips in the same tracked mono voice as the
 * room chrome (TopBar, CornerMeta), so the paper reads as part of the archive.
 */
export function DossierPage({
  page,
  dossier,
  pageNumber,
  totalPages,
  variant = 'spread',
}) {
  const reading = variant === 'reading'
  const bodyRef = useRef(null)
  const spacing = useSpacing(page, bodyRef)
  const tight = spacing === 'tight'

  return (
    <article
      id={reading ? readingSheetId(page) : undefined}
      aria-label={`${dossier.title}, page ${pageNumber} of ${totalPages}`}
      className={`flex flex-col bg-cream-50 text-ink-900 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.75)] ${
        reading
          ? 'aspect-[17/22] min-h-[36rem] w-full scroll-mt-6 sm:scroll-mt-10'
          : 'h-full w-full'
      }`}
    >
      {/* --- Header strip --------------------------------------------- */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ink-300/50 px-7 py-4 sm:px-9">
        <span className="label text-ink-500">{page.eyebrow}</span>
        <span className="label text-ink-500">
          File No. {dossier.fileNumber}
        </span>
      </header>

      {/* --- Body ------------------------------------------------------
          Pagination sets only what fits, so this never scrolls in
          practice; if a page ever did outgrow its sheet it would scroll
          rather than clip, so content can never be silently lost.
          `data-sheet-body` is what the pagination probe measures. */}
      <div
        ref={bodyRef}
        data-sheet-body=""
        className={`flex min-h-0 grow flex-col overflow-y-auto px-7 py-8 sm:px-9 ${
          tight ? '' : 'sm:py-10'
        }`}
      >
        {page.title && (
          <div
            className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${
              tight ? 'mb-3' : spacing === 'compact' ? 'mb-5' : 'mb-7'
            }`}
          >
            <h2 className="font-display text-[1.05rem] uppercase tracking-[0.2em] text-ink-900">
              {page.title}
            </h2>
            {page.titleNote && (
              <span className="label text-ink-500">({page.titleNote})</span>
            )}
          </div>
        )}

        {/* `compact` pages close the gap between blocks to the same step as
            the rows inside a `fields` block, so consecutive record blocks
            read as one list rather than three. `tight` pages go one step
            further, inside the blocks too.
            The column fills the sheet so an `anchor: 'bottom'` block can
            take the free space above it and sit on the footer rule; the
            spacing step still holds as its minimum gap.
            A `fitImages` page makes this column a size container on a
            spread sheet, so its prints can cap their height in `cqh` and
            share the sheet's height exactly. Only from `md` up, where the
            sheet has a fixed height to measure; stacked, it grows instead. */}
        <div
          className={`flex grow flex-col ${
            tight ? 'space-y-3' : spacing === 'compact' ? 'space-y-5' : 'space-y-8'
          } ${page.fitImages && !reading ? 'min-h-0 md:[container-type:size]' : ''}`}
        >
          {page.blocks.map((block, i) => {
            const key = `${page.id}-${block.type}-${i}`
            const rendered = (
              <Block key={key} block={block} tight={tight} />
            )
            return block.anchor === 'bottom' ? (
              <div key={key} className="mt-auto">
                {rendered}
              </div>
            ) : (
              rendered
            )
          })}
        </div>
      </div>

      {/* --- Footer strip --------------------------------------------- */}
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-ink-300/50 px-7 py-4 sm:px-9">
        <span className="label text-ink-500">{dossier.title}</span>
        <span className="label text-ink-500">
          {String(pageNumber).padStart(2, '0')} / {totalPages}
        </span>
      </footer>
    </article>
  )
}

/**
 * The sheet that faces the last page on the final spread.
 *
 * A dossier with an odd page count would otherwise show a blank rectangle
 * there. A closing plate is quieter than an empty sheet and gives
 * the dossier an ending.
 *
 * It is a sheet of the same paper as the rest, not a panel of its own: cream
 * stock, the same drop shadow, and the same header and footer rules as
 * `DossierPage` above, because it is bound into the same file and sits beside
 * a real sheet on the last spread. Rendered on the room's dark ground instead
 * it read as a hole in the dossier rather than as the end of it.
 */
export function DossierEndPlate({ dossier, total }) {
  return (
    <aside
      aria-hidden="true"
      className="flex h-full min-h-72 w-full flex-col bg-cream-50 text-ink-900 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.75)]"
    >
      {/* --- Header strip --------------------------------------------- */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ink-300/50 px-7 py-4 sm:px-9">
        <span className="label text-ink-500">Closing plate</span>
        <span className="label text-ink-500">
          File No. {dossier.fileNumber}
        </span>
      </header>

      {/* --- Body ------------------------------------------------------
          The plate itself is a ruled frame inside the sheet's margins, the
          same hairline the strips above and below are drawn in - the printed
          box a closing stamp goes in, rather than loose type floating on an
          otherwise empty page. */}
      <div className="grow px-7 py-8 sm:px-9 sm:py-10">
        <div className="flex h-full flex-col items-center justify-center gap-5 border border-ink-300/50 px-8 py-10 text-center">
          <span aria-hidden="true" className="h-px w-10 bg-ink-300" />
          <p className="label text-ink-500">End of file</p>
          <p className="font-display text-2xl italic leading-tight text-ink-900">
            {dossier.title}
          </p>
          <p className="label text-ink-500">
            {dossier.fileNumber} &middot; {dossier.classification}
          </p>
          <span aria-hidden="true" className="h-px w-10 bg-ink-300" />
        </div>
      </div>

      {/* --- Footer strip ----------------------------------------------
          No number of its own: the plate closes the file rather than being a
          sheet of it, and the last numbered sheet is the one beside it. */}
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-ink-300/50 px-7 py-4 sm:px-9">
        <span className="label text-ink-500">{dossier.title}</span>
        <span className="label text-ink-500">&mdash; / {total}</span>
      </footer>
    </aside>
  )
}
