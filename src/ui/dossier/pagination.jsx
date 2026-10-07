import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { DOSSIERS } from '../../data/dossiers'
import { usePagination } from '../../state/paginationStore'
import { DossierPage } from './DossierPage'
import {
  DossierTopBar,
  PagerBar,
  ReadingStage,
  SpreadStage,
} from './DossierView'
import { paginate } from './flow'

/**
 * The pagination probe: lays every dossier out into sheets for both views at
 * the current window size, and files the result in the pagination store.
 *
 * It measures on real paper. Off screen, invisible and inert, it stands up
 * the dossier's own frame - the same top bar, stage and pager components the
 * view renders (DossierView.jsx) - with one DossierPage in it, so the sheet
 * it measures is the size of the one on screen to the pixel, at whatever
 * breakpoint the window is at. flow.js proposes a sheet; the probe renders it
 * and reports the space left at its foot.
 *
 * It runs on its own React root, synchronously (flushSync), from timers and
 * events rather than from inside a render, so a whole layout is one blocking
 * pass with nothing painted in between. It runs again when the window is
 * resized and when a web font finishes loading, since either changes how
 * many lines a paragraph takes; both views are laid out each time, so a
 * switch of view finds its sheets ready.
 */

const MODES = ['spread', 'reading']

/* Never called: the probe is inert. The props are only there to match. */
const noop = () => {}

function Probe({ dossier, mode, page }) {
  const sheet = (
    <DossierPage
      page={page}
      dossier={dossier}
      pageNumber={88}
      totalPages={88}
      variant={mode}
    />
  )
  /* Contained, so each candidate sheet re-lays out only the probe and not
     the page behind it - an open dossier in Reading View included. Its size
     comes from `inset-0`, which is what lets it be `strict`. */
  return (
    <div className="pointer-events-none invisible fixed inset-0 -z-10 flex flex-col [contain:strict]">
      <DossierTopBar
        dossier={dossier}
        mode={mode}
        onModeChange={noop}
        onClose={noop}
      />
      {mode === 'spread' ? (
        <SpreadStage left={sheet} right={null} />
      ) : (
        <ReadingStage>{sheet}</ReadingStage>
      )}
      {mode === 'spread' && <PagerBar counter="00–00 / 00" atStart atEnd />}
    </div>
  )
}

let host = null
let root = null

function mountProbe() {
  if (root) return
  host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.inert = true
  document.body.appendChild(host)
  root = createRoot(host)
}

/**
 * Sets `page` on the probe's sheet and reports, in pixels, the space between
 * the foot of its last block and the foot of the sheet's body (negative when
 * the sheet would scroll), and the width its blocks are set at.
 */
function measureOnPaper(dossier, mode, page) {
  flushSync(() => root.render(<Probe dossier={dossier} mode={mode} page={page} />))
  const body = host.querySelector('[data-sheet-body]')
  const column = body.lastElementChild
  const last = column.lastElementChild
  const foot =
    body.getBoundingClientRect().bottom -
    parseFloat(getComputedStyle(body).paddingBottom)
  const end = last
    ? last.getBoundingClientRect().bottom
    : column.getBoundingClientRect().top
  return { slack: foot - end, columnWidth: column.clientWidth }
}

function layoutAll() {
  /* Shows up as "dossier-pagination" in the Performance panel. */
  const start = performance.now()
  mountProbe()
  const byId = {}
  for (const dossier of DOSSIERS) {
    byId[dossier.id] = {}
    for (const mode of MODES) {
      /* The same candidate sheet is often proposed twice in a pass. */
      const seen = new Map()
      byId[dossier.id][mode] = paginate(dossier, (page) => {
        const key = JSON.stringify(page)
        if (!seen.has(key)) seen.set(key, measureOnPaper(dossier, mode, page))
        return seen.get(key)
      })
    }
  }
  flushSync(() => root.render(null))
  performance.measure('dossier-pagination', { start })

  /* Unchanged sheets are not filed again, so a resize that moves nothing
     does not re-render the open dossier or repaint the folder covers. */
  const prev = usePagination.getState().byId
  if (JSON.stringify(prev) !== JSON.stringify(byId)) {
    usePagination.setState({ byId })
  }
}

let timer = 0
function schedule(delay = 0) {
  window.clearTimeout(timer)
  timer = window.setTimeout(layoutAll, delay)
}

/**
 * Called once at boot, from main.jsx. The first pass waits for the web
 * fonts, since a layout measured in a fallback face would only be thrown
 * away; the boot triggers share one debounce so they run a single pass.
 */
export function startPagination() {
  const settle = () => schedule(50)
  if (document.fonts) document.fonts.ready.then(settle)
  else settle()
  window.addEventListener('load', settle)
  document.fonts?.addEventListener('loadingdone', settle)
  /* Settled for a moment first, so a drag-resize lays out once at the end
     rather than on every frame of it. */
  window.addEventListener('resize', () => schedule(120))
}
