import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { PALETTE } from '../lib/palette'

/**
 * Typed surfaces in the room - drawer label plates and the folder cover -
 * drawn on a 2D canvas and used as textures.
 *
 * Deliberately not a 3D text helper: those pull a font file over the network
 * at runtime, and the whole point of these surfaces is that they are legible
 * the instant the lamp comes up. A canvas uses the font the page has already
 * loaded and costs nothing.
 *
 * Each texture's aspect matches the mesh it is mapped onto (see `Drawer` and
 * `CaseFolder`) so the type is never stretched.
 */

const MONO = "'JetBrains Mono', ui-monospace, monospace"
const DISPLAY = "'Instrument Serif', 'Iowan Old Style', Georgia, serif"

const INK = '#2b2719'
const INK_SOFT = 'rgba(60, 52, 34, 0.62)'
const RULE = 'rgba(60, 52, 34, 0.35)'

/* -------------------------------------------------------------------------- */
/* Shared plumbing                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Draws tracked uppercase text - the same metadata voice as `.label` in the
 * DOM, which canvas has no direct equivalent for.
 *
 * Alignment is applied by hand rather than through ctx.textAlign because the
 * run has to be measured with its tracking included either way, and older
 * canvas implementations have no `letterSpacing` to measure with.
 */
function trackedWidths(ctx, text, { size, track, weight }) {
  ctx.font = `${weight} ${size}px ${MONO}`
  const chars = [...text.toUpperCase()]
  const widths = chars.map((ch) => ctx.measureText(ch).width + track)
  const total = widths.reduce((a, b) => a + b, 0) - track
  return { chars, widths, total }
}

function tracked(
  ctx,
  text,
  x,
  y,
  { size = 20, track = 3.4, align = 'left', color = INK, weight = 400 } = {},
) {
  const { chars, widths, total } = trackedWidths(ctx, text, { size, track, weight })
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = color

  let cursor = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cursor, y)
    cursor += widths[i]
  })

  return total
}

/**
 * Every way to break `text` at a space into two lines, best first: the break
 * that leaves the longer of the two lines shortest, as measured by `measure`.
 * A single word has no break and comes back as one line.
 */
function twoLineSplits(text, measure) {
  const words = text.split(' ')
  if (words.length < 2) return [[text]]
  return words
    .slice(1)
    .map((_, i) => [
      words.slice(0, i + 1).join(' '),
      words.slice(i + 1).join(' '),
    ])
    .sort(
      (a, b) =>
        Math.max(...a.map(measure)) - Math.max(...b.map(measure)),
    )
}

function rule(ctx, x1, y, x2, color = RULE, width = 2) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
}

/**
 * Builds a texture from a paint function. The caller owns the result and must
 * dispose it - see the cleanup in `Drawer` and `CaseFolder`.
 *
 * The first paint almost always happens before the webfonts have arrived,
 * which would otherwise leave the surface set in fallback type for the rest of
 * the session, so it repaints once they land.
 */
function makeTexture(width, height, paint) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  paint(canvas.getContext('2d'))

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter

  document.fonts?.ready
    ?.then(() => {
      paint(canvas.getContext('2d'))
      texture.needsUpdate = true
    })
    .catch(() => {})

  return texture
}

/* -------------------------------------------------------------------------- */
/* Drawer label plate                                                         */
/* -------------------------------------------------------------------------- */

const PLATE_W = 768
const PLATE_H = 170

/**
 * Plate width : height. The plate mesh derives its height from this so the
 * type is never stretched, whatever size the drawer is.
 */
export const PLATE_ASPECT = PLATE_W / PLATE_H

/* Type is deliberately large in the canvas. The plate is only ~25px tall on
   screen at the room's default camera distance, so anything smaller stops
   being readable without zooming in. */
const PLATE_FONT_SIZE = 80
const PLATE_TRACK = 7
/* A label too long for one line at PLATE_FONT_SIZE is set on two, which caps
   the type at what two lines can share inside the rule. */
const PLATE_TWO_LINE_SIZE = 58
const PLATE_MIN_SIZE = 30
/* Width the type may use: inside the hairline rule, with a margin. */
const PLATE_TEXT_W = PLATE_W - 64

/**
 * Lays a label out on the plate: `{ lines, size, track }`. One line at full
 * size where it fits; otherwise the most even two-line break, shrunk only as
 * far as that break needs. Tracking scales with the size so a smaller label
 * keeps the same voice.
 */
function fitPlateLabel(ctx, text) {
  const opts = (size) => ({
    size,
    track: (PLATE_TRACK * size) / PLATE_FONT_SIZE,
    weight: 500,
  })
  const width = (line, size) => trackedWidths(ctx, line, opts(size)).total

  if (width(text, PLATE_FONT_SIZE) <= PLATE_TEXT_W || !text.includes(' ')) {
    let size = PLATE_FONT_SIZE
    while (width(text, size) > PLATE_TEXT_W && size > PLATE_MIN_SIZE) size -= 2
    return { lines: [text], ...opts(size) }
  }

  const [lines] = twoLineSplits(text, (line) => width(line, PLATE_TWO_LINE_SIZE))
  let size = PLATE_TWO_LINE_SIZE
  while (
    Math.max(...lines.map((line) => width(line, size))) > PLATE_TEXT_W &&
    size > PLATE_MIN_SIZE
  ) {
    size -= 2
  }
  return { lines, ...opts(size) }
}

export function createLabelTexture(text) {
  return makeTexture(PLATE_W, PLATE_H, (ctx) => {
    if (!ctx) return
    ctx.clearRect(0, 0, PLATE_W, PLATE_H)

    ctx.fillStyle = PALETTE.labelPlate
    ctx.fillRect(0, 0, PLATE_W, PLATE_H)

    // Hairline rule inside the plate edge, matching the paper UI's borders.
    ctx.strokeStyle = RULE
    ctx.lineWidth = 3
    ctx.strokeRect(10, 10, PLATE_W - 20, PLATE_H - 20)

    const { lines, size, track } = fitPlateLabel(ctx, text)
    const leading = size * 1.05
    const top = PLATE_H / 2 + 4 - (leading * (lines.length - 1)) / 2
    lines.forEach((line, i) => {
      tracked(ctx, line, PLATE_W / 2, top + leading * i, {
        size,
        track,
        align: 'center',
        weight: 500,
      })
    })
  })
}

/* -------------------------------------------------------------------------- */
/* Folder cover                                                               */
/* -------------------------------------------------------------------------- */

const COVER_W = 640
const COVER_H = 747

/** Cover width : height. `CaseFolder` sizes its slab from this. */
export const COVER_ASPECT = COVER_W / COVER_H

/**
 * The closed folder's front face - the beat between the drawer and the paper.
 *
 * It carries the same three things the dossier's own page headers carry: the
 * classification, the subject, the file number. Set in the same tracked mono
 * and display serif the DOM uses, so the cover and the first sheet read as one
 * document rather than as a lid and a different document underneath it.
 */
export function createCoverTexture({
  department,
  classification,
  subject,
  fileNumber,
  sheets,
  stamp,
}) {
  return makeTexture(COVER_W, COVER_H, (ctx) => {
    if (!ctx) return
    ctx.clearRect(0, 0, COVER_W, COVER_H)

    // Stock, with a lighter band at the head so the cover is not a flat fill
    // under the lamp.
    ctx.fillStyle = PALETTE.folderCover
    ctx.fillRect(0, 0, COVER_W, COVER_H)
    ctx.fillStyle = 'rgba(255, 252, 240, 0.5)'
    ctx.fillRect(0, 0, COVER_W, 18)

    const M = 54
    ctx.strokeStyle = RULE
    ctx.lineWidth = 2
    ctx.strokeRect(30, 30, COVER_W - 60, COVER_H - 60)

    /* --- Masthead --- */
    tracked(ctx, department, M, 86, { size: 17, track: 2.6, color: INK_SOFT })
    rule(ctx, M, 112, COVER_W - M)

    tracked(ctx, classification, M, 148, { size: 22, track: 5, weight: 500 })

    /* --- Subject --- */
    ctx.fillStyle = INK
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    /* Set on up to two lines, broken where they come out most even, and
       shrunk together until the longer line clears the margin - so a long
       title never runs into the edge and its two lines match. */
    const maxW = COVER_W - M * 2
    const measure = (line, size) => {
      ctx.font = `${size}px ${DISPLAY}`
      return ctx.measureText(line).width
    }
    const [lines] = twoLineSplits(subject, (line) => measure(line, 76))
    let size = 76
    while (
      Math.max(...lines.map((line) => measure(line, size))) > maxW &&
      size > 30
    ) {
      size -= 2
    }
    ctx.font = `${size}px ${DISPLAY}`
    let y = 276
    lines.forEach((line) => {
      ctx.fillText(line, M, y)
      y += size + 8
    })

    rule(ctx, M, y - 6, COVER_W - M)

    /* --- Record line --- */
    tracked(ctx, 'File No.', M, y + 40, { size: 16, track: 2.6, color: INK_SOFT })
    tracked(ctx, fileNumber, M, y + 74, { size: 27, track: 4, weight: 500 })

    tracked(ctx, 'Sheets', COVER_W - M, y + 40, {
      size: 16,
      track: 2.6,
      align: 'right',
      color: INK_SOFT,
    })
    tracked(ctx, sheets, COVER_W - M, y + 74, {
      size: 27,
      track: 4,
      align: 'right',
      weight: 500,
    })

    /* --- Stamp ---
       Rotated and slightly transparent so it reads as ink pressed onto the
       stock after the fact rather than as part of the printed form. */
    ctx.save()
    ctx.translate(COVER_W / 2 + 14, COVER_H - 180)
    ctx.rotate(-0.13)
    ctx.globalAlpha = 0.84
    ctx.strokeStyle = PALETTE.stamp
    ctx.lineWidth = 4
    const stampW = 380
    const stampH = 88
    ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH)
    ctx.lineWidth = 1.5
    ctx.strokeRect(-stampW / 2 + 9, -stampH / 2 + 9, stampW - 18, stampH - 18)
    tracked(ctx, stamp, 0, 2, {
      size: 34,
      track: 6,
      align: 'center',
      color: PALETTE.stamp,
      weight: 500,
    })
    ctx.restore()

    /* --- Footer --- */
    rule(ctx, M, COVER_H - 88, COVER_W - M)
    tracked(ctx, 'Archive 001', M, COVER_H - 62, {
      size: 16,
      track: 2.6,
      color: INK_SOFT,
    })
    tracked(ctx, 'Do not remove', COVER_W - M, COVER_H - 62, {
      size: 16,
      track: 2.6,
      align: 'right',
      color: INK_SOFT,
    })
  })
}
