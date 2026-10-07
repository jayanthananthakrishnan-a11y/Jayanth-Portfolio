import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useArchive } from '../../state/archiveStore'
import { useDossierPages } from '../../state/paginationStore'
import { DossierEndPlate, DossierPage, readingSheetId } from './DossierPage'
import { DossierNav } from './nav'

/** Must match --dossier-turn in index.css. */
const TURN_MS = 520

/**
 * True when the spread is stacked into a single column - below md, where the
 * two sheets sit one above the other and there is no gutter to hinge a leaf
 * on. Measured off the grid that actually changed shape rather than by
 * re-declaring the breakpoint here, so the stylesheet stays the only place
 * that decides where the layout turns over.
 */
function isStacked(grid) {
  if (!grid) return true
  return getComputedStyle(grid).gridTemplateColumns.split(' ').length < 2
}

/**
 * True once the leaf has turned past the vertical - the instant its back face
 * becomes the one pointing at the reader.
 *
 * Read off the element's live transform rather than worked out from a
 * fraction of TURN_MS, because the turn is eased and the halfway *point* of
 * the movement is nowhere near the halfway *time* of it: under
 * cubic-bezier(0.37, 0.02, 0.25, 1) the leaf is already about 140 of its 180
 * degrees round when half the milliseconds have gone. A timer at TURN_MS / 2
 * therefore flipped the counter ~70ms after the paper had, and for those
 * frames the footer reported one spread while the sheets on screen were
 * already the next one. Watching the element leaves no constant to keep in
 * sync - retune the curve or the duration and the counter still moves exactly
 * when the paper does.
 *
 * The first component of a rotateY matrix is cos(angle), so its sign is the
 * whole test, and it is the same sign `backface-visibility` swaps the two
 * faces on.
 */
function pastVertical(el) {
  const t = getComputedStyle(el).transform
  if (!t || t === 'none') return false
  return new DOMMatrix(t).m11 < 0
}

/* -------------------------------------------------------------------------- */
/* Chrome                                                                     */
/* -------------------------------------------------------------------------- */

function NavButton({ label, glyph, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-11 items-center justify-center border border-cream-400/35 bg-forest-950/50 text-cream-200 backdrop-blur-sm transition-colors hover:border-brass-400/70 hover:text-cream-50 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-cream-400/35"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {glyph}
      </span>
    </button>
  )
}

function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex items-center border border-cream-400/35 bg-forest-950/50 backdrop-blur-sm">
      {[
        ['spread', 'Spread'],
        ['reading', 'Reading View'],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={mode === value}
          className={`label px-4 py-3 transition-colors ${
            mode === value
              ? 'bg-cream-50/10 text-cream-50'
              : 'text-cream-400 hover:text-cream-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/*
 * The layout pieces below are the dossier's frame, exported so the
 * pagination probe (pagination.jsx) can stand the very same frame up off
 * screen and measure a sheet that is exactly the size of the one on screen.
 * A class changed here therefore changes what fits on a sheet, and the
 * sheets are laid out again to match.
 */

/** The dialog's top bar: file number, title, view toggle and close. */
export function DossierTopBar({ dossier, mode, onModeChange, onClose }) {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-cream-400/15 px-5 py-4 sm:px-8">
      <div className="min-w-0">
        <p className="label text-cream-400">
          {dossier.fileNumber} &middot; {dossier.classification}
        </p>
        <h1 className="truncate font-display text-2xl italic leading-tight text-cream-50">
          {dossier.title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <ModeToggle mode={mode} onChange={onModeChange} />
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 items-center justify-center border border-cream-400/35 bg-forest-950/50 text-cream-200 backdrop-blur-sm transition-colors hover:border-brass-400/70 hover:text-cream-50"
          aria-label="Close dossier"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            &times;
          </span>
        </button>
      </div>
    </header>
  )
}

/**
 * The paged spread: two sheet slots and, mid-turn, the leaf over them.
 *
 * The scroll gutter is reserved whether or not anything scrolls, so the
 * sheets are the same width with a scrollbar and without one - the width
 * they were laid out at.
 */
export function SpreadStage({ spreadRef, left, right, children }) {
  return (
    <div className="grow overflow-y-auto px-4 py-6 [scrollbar-gutter:stable_both-edges] sm:px-8 sm:py-8">
      {/* Below md the two sheets stack and the column scrolls rather than
          each sheet shrinking to half width - halving the measure on a
          phone would break the legibility floor these pages are held to.
          The leaf is hidden there for the same reason: with the sheets
          stacked there is no gutter to hinge it on.

          Perspective and the gutter width both live on this element (see
          .dossier-spread in index.css) rather than on the two cells,
          because the leaf hinges on the gutter's centre line and is a
          child of this grid - one perspective, one spine, and a gap that
          cannot drift away from the hinge. */}
      <div
        ref={spreadRef}
        className="dossier-spread relative mx-auto grid max-w-6xl md:h-full md:grid-cols-2"
      >
        <div className="min-h-[34rem] md:h-full md:min-h-0">{left}</div>
        <div className="min-h-[34rem] md:h-full md:min-h-0">{right}</div>
        {children}
      </div>
    </div>
  )
}

/** Reading View: every sheet stacked in one scrolling column. */
export function ReadingStage({ children }) {
  return (
    <div className="grow overflow-y-auto px-4 py-6 [scrollbar-gutter:stable_both-edges] sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">{children}</div>
    </div>
  )
}

/** The page-turn controls and the X-Y / N counter under the spread. */
export function PagerBar({ counter, onPrev, onNext, atStart, atEnd }) {
  return (
    <footer className="flex shrink-0 items-center justify-center gap-6 border-t border-cream-400/15 px-5 py-4">
      <NavButton
        label="Previous page"
        glyph="&#8592;"
        onClick={onPrev}
        disabled={atStart}
      />
      <p
        className="label min-w-24 text-center text-cream-200"
        aria-live="polite"
      >
        {counter}
      </p>
      <NavButton
        label="Next page"
        glyph="&#8594;"
        onClick={onNext}
        disabled={atEnd}
      />
    </footer>
  )
}

/* -------------------------------------------------------------------------- */
/* View                                                                       */
/* -------------------------------------------------------------------------- */

/* Until the sheets have been laid out (a frame or two after load) the view
   has none to show, rather than a set measured for some other window. */
const NO_PAGES = []

/**
 * The flat 2D dossier. Nothing in here touches the 3D scene; it is opened by
 * the drawer and by the File Index alike, and works with the room absent.
 *
 * Two modes over the same `DossierPage` component:
 *   spread  - two sheets at a time with a page-turn between them
 *   reading - every sheet stacked and scrollable, for reading straight through
 */
export function DossierView({ dossier, onClose }) {
  const motionOn = useArchive((s) => s.motionOn)

  const [mode, setMode] = useState('spread')

  const dialogRef = useRef(null)
  const spreadRef = useRef(null)
  const leafRef = useRef(null)

  /**
   * Paging state, kept as one object so its three parts can never disagree.
   *
   *   spread   the settled spread - the one the sheets underneath belong to
   *   counter  the spread the X-Y counter is reporting
   *   turning  { dir, to } while a leaf is in the air, else null
   *
   * Three fields and not one index, because a turn is not instantaneous and
   * they do not move at the same moment: the leaf lifts, the counter flips as
   * the leaf passes the vertical, and the spread commits as it lands. Driving
   * all three off a single index is what produced the original bug - spread
   * and counter both jumped on the first frame while a stale sheet stayed
   * painted on top of them, so mid-turn the screen could read "3-4 / 7" above
   * Sheet 05 and Sheet 04.
   */
  const [nav, setNav] = useState({ spread: 0, counter: 0, turning: null })

  /* Laid out for this view at this window size - see pagination.jsx. A
     resize or a switch of view can change how many sheets there are. */
  const pages = useDossierPages(dossier.id, mode) ?? NO_PAGES
  const total = pages.length
  /* The closing plate takes the slot after the last sheet. With an odd count
     it faces the last sheet; with an even count it opens a spread of its own
     rather than being dropped. */
  const spreadCount = Math.ceil((total + 1) / 2)

  /* --- Page turning ---------------------------------------------------- */

  /**
   * A turn starts from where the paper is *going*, not from where it is, so
   * clicking faster than the animation can neither lose nor repeat a spread:
   * an in-flight turn is snapped to its destination and the next one begins
   * from there.
   *
   * The choice of spread is made inside the updater so it always reads the
   * live state, and nothing in there touches the DOM - it stays pure, which
   * is what makes it safe under StrictMode. The one thing measured first is
   * whether there is a leaf to draw at all, which is a fact about the layout
   * rather than about where the paper has got to.
   */
  /* `target` is a spread, or a function from the spread the paper is going to
     to the one it should go to next. A jump of more than one spread is still a
     single leaf: the sheets under it are simply the destination's. */
  const goTo = useCallback(
    (target) => {
      /* Measured out here rather than inside the updater, which has to stay
         pure: with the sheets stacked there is no leaf to draw, and holding
         the old spread while an invisible turn runs would only leave a pair
         belonging to neither spread on screen for half a second. */
      const instant = !motionOn || isStacked(spreadRef.current)

      setNav((prev) => {
        const from = prev.turning ? prev.turning.to : prev.spread
        const to = typeof target === 'function' ? target(from) : target
        if (to === from || to < 0 || to >= spreadCount) return prev
        const dir = to > from ? 1 : -1
        if (instant) return { spread: to, counter: to, turning: null }
        /* `seq` is what tells the leaf it is a new turn and not the old one
           re-rendered - see the key on it below. */
        return {
          spread: from,
          counter: from,
          turning: { dir, to, seq: (prev.turning?.seq ?? 0) + 1 },
        }
      })
    },
    [motionOn, spreadCount],
  )

  const turn = useCallback((dir) => goTo((from) => from + dir), [goTo])

  /* The sheets are laid out again when the window changes size, and a
     larger window can need fewer of them: the spread that was open may no
     longer exist, so the paper falls back to the last one there is. */
  if (spreadCount > 0 && nav.spread >= spreadCount && !nav.turning) {
    const last = spreadCount - 1
    setNav({ spread: last, counter: last, turning: null })
  }

  /* The turn's clock. It lives in an effect rather than in `turn` so React
     owns the cleanup: a second turn, a mode switch or an unmount cancels the
     watcher and the timer instead of leaving them to commit a spread that has
     moved on. */
  useEffect(() => {
    const t = nav.turning
    if (!t) return

    /* The counter is driven by the paper itself rather than by a second clock
       running alongside it, so the two cannot disagree about where the turn
       has got to - see pastVertical. */
    let raf = requestAnimationFrame(function watch() {
      const el = leafRef.current

      /* Below md the sheets stack and there is no gutter to hinge a leaf on,
         so none is laid out. With no paper in the air there is nothing to
         keep step with, and holding the spread would only leave a pair that
         belongs to neither spread on screen for the length of a turn that is
         not being drawn - so it commits at once instead. */
      if (!el || el.getClientRects().length === 0) {
        flushSync(() =>
          setNav((n) =>
            n.turning === t
              ? { spread: t.to, counter: t.to, turning: null }
              : n,
          ),
        )
        return
      }

      if (pastVertical(el)) {
        /* Flushed rather than scheduled, because this frame is the one the
           measurement belongs to: rAF callbacks run before the frame is
           painted, but a normally-scheduled update would not be rendered
           until the task after it - which put the new counter on screen one
           frame after the face it belongs to. */
        flushSync(() =>
          setNav((n) => (n.turning === t ? { ...n, counter: t.to } : n)),
        )
        return
      }
      raf = requestAnimationFrame(watch)
    })

    const land = window.setTimeout(
      () =>
        setNav((n) =>
          n.turning === t ? { spread: t.to, counter: t.to, turning: null } : n,
        ),
      TURN_MS,
    )

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(land)
    }
  }, [nav.turning])

  /* --- What each half of the spread is showing -------------------------

     The leaf is two-sided and hinged on the gutter, so at every instant it
     covers exactly the side it has not yet uncovered. That lets the sheet
     under the *uncovered* side be the destination one from the first frame -
     revealed by the leaf lifting off it, which is what paper does - while the
     side the leaf is falling towards keeps the old sheet until the leaf's
     back face lands over it. So every frame of a turn shows a real, in-order
     pair, and the sheet the leaf lands on is already identical to the one
     underneath it when it unmounts. */
  const { spread, counter: counterSpread, turning } = nav
  const forward = turning?.dir === 1

  const leftIndex = turning && !forward ? turning.to * 2 : spread * 2
  const rightIndex = turning && forward ? turning.to * 2 + 1 : spread * 2 + 1

  const leaf = useMemo(() => {
    if (!turning) return null
    return forward
      ? { front: spread * 2 + 1, back: turning.to * 2 }
      : { front: spread * 2, back: turning.to * 2 + 1 }
  }, [forward, spread, turning])

  const counterLeft = counterSpread * 2
  const counter = !pages[counterLeft]
    ? `— / ${total}`
    : pages[counterLeft + 1]
      ? `${counterLeft + 1}–${counterLeft + 2} / ${total}`
      : `${counterLeft + 1} / ${total}`

  /* Both ends are measured against the destination, so the far edge of a turn
     that is still in the air already counts as reached. */
  const settledOrTarget = turning ? turning.to : spread
  const atStart = settledOrTarget === 0
  const atEnd = settledOrTarget >= spreadCount - 1

  /* A slot is a sheet, the closing plate (the slot just past the last sheet),
     or nothing - the empty half beside a plate that opens its own spread. */
  const sheet = useCallback(
    (i) =>
      pages[i] ? (
        <DossierPage
          page={pages[i]}
          dossier={dossier}
          pageNumber={i + 1}
          totalPages={total}
        />
      ) : i === total && total > 0 ? (
        <DossierEndPlate dossier={dossier} total={total} />
      ) : null,
    [dossier, pages, total],
  )

  /* What a `contents` entry calls to open its sheet: in the spread, a turn
     to the spread that holds it; in Reading View, a scroll to it. Focus goes
     back to the dialog after a turn, because the entry that was clicked has
     just been turned under and the arrow keys should still work. */
  const goToPage = useCallback(
    (i) => {
      if (mode === 'spread') {
        goTo(Math.floor(i / 2))
        dialogRef.current?.focus()
        return
      }
      document.getElementById(readingSheetId(pages[i]))?.scrollIntoView({
        behavior: motionOn ? 'smooth' : 'auto',
        block: 'start',
      })
    },
    [goTo, mode, motionOn, pages],
  )
  const navValue = useMemo(() => ({ pages, goToPage }), [pages, goToPage])

  /* Reading View is a long scroll; the room is a fixed stage. Restore either
     way on unmount so closing the dossier never leaves the body scrollable. */
  useEffect(() => {
    document.body.dataset.scroll = mode === 'reading' ? 'on' : 'off'
    return () => {
      delete document.body.dataset.scroll
    }
  }, [mode])

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (mode !== 'spread') return
      if (e.key === 'ArrowRight') turn(1)
      if (e.key === 'ArrowLeft') turn(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, onClose, turn])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${dossier.title} dossier`}
      tabIndex={-1}
      /* The cover has just been turned back in the room behind this, so the
         paper settles in rather than cutting in - see .dossier-open. */
      className="dossier-open absolute inset-0 z-50 flex flex-col bg-forest-950/92 backdrop-blur-sm outline-none"
    >
      {/* --- Top bar ------------------------------------------------- */}
      <DossierTopBar
        dossier={dossier}
        mode={mode}
        onModeChange={setMode}
        onClose={onClose}
      />

      {/* --- Paper --------------------------------------------------- */}
      <DossierNav.Provider value={navValue}>
        {mode === 'spread' ? (
          <SpreadStage
            spreadRef={spreadRef}
            left={sheet(leftIndex)}
            right={sheet(rightIndex)}
          >
            {leaf && (
              /* Hidden from assistive tech: it is the same two sheets already
                 in the tree underneath it, in motion. */
              <div
                /* Keyed on the turn, so cutting in on one mid-swing remounts
                   the leaf and its CSS animation begins again at the flat.
                   Sharing the element would have let the new turn inherit the
                   old one's angle - the paper would be lying past the
                   vertical before the turn it belongs to had begun, showing
                   the destination spread with no movement at all. */
                key={turning.seq}
                ref={leafRef}
                aria-hidden="true"
                className={`dossier-leaf hidden md:block ${
                  forward ? 'dossier-leaf--fwd' : 'dossier-leaf--back'
                }`}
              >
                <div className="dossier-leaf__face">{sheet(leaf.front)}</div>
                <div className="dossier-leaf__face dossier-leaf__face--back">
                  {sheet(leaf.back)}
                </div>
              </div>
            )}
          </SpreadStage>
        ) : (
          <ReadingStage>
            {pages.map((page, i) => (
              <DossierPage
                key={page.id}
                page={page}
                dossier={dossier}
                pageNumber={i + 1}
                totalPages={total}
                variant="reading"
              />
            ))}
          </ReadingStage>
        )}
      </DossierNav.Provider>

      {/* --- Page-turn controls + counter ---------------------------- */}
      {mode === 'spread' && (
        <PagerBar
          counter={counter}
          onPrev={() => turn(-1)}
          onNext={() => turn(1)}
          atStart={atStart}
          atEnd={atEnd}
        />
      )}
    </div>
  )
}
