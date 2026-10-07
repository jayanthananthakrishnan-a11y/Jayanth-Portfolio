/**
 * Flow pagination: turning a dossier's sections into sheets.
 *
 * A section (one project, one part of the resume) is broken into units - its
 * heading, each bullet, each paragraph, each chip or list group, each
 * remaining block - and the units are set onto sheets in order, moving to a
 * new sheet only when the next one does not fit in the space that is left.
 * So a sheet fills up like a page of a real document, at whatever size the
 * window gives it.
 *
 * Nothing in here measures anything. `paginate` is handed a `measure(page)`
 * that sets a candidate sheet on real paper and reports the space left under
 * it (see pagination.jsx), so this file stays pure and the one renderer in
 * the archive - DossierPage - is also the only thing that decides what fits.
 */

/** The shortest a screenshot is printed. Below this it moves to a new sheet. */
export const MIN_PRINT_HEIGHT = 180

/**
 * What the print frame adds around an image across its width: the hairline
 * (1px) and the cream margin (p-2, 0.5rem) on both sides. Must match the
 * frame in blocks.jsx.
 */
const PRINT_FRAME_X = 18

/**
 * Below this many words a split bullet or paragraph is not started at the
 * foot of a sheet: a line or two stranded there reads as a mistake.
 */
const MIN_SPLIT_WORDS = 8

/** DossierPage's spacing steps, loosest first. */
const SPACING_STEPS = ['normal', 'compact', 'tight']

/** Fractions of a pixel are rounding, not overflow. */
const FIT_TOLERANCE = 0.5

/* -------------------------------------------------------------------------- */
/* Units                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A section's content as a flat list of units. `b` is the index of the block
 * each unit came from, so units from one block that land on one sheet are
 * set back into a single block of that type - bullets share one list, chip
 * groups one group stack - and keep the spacing they have inside it.
 */
function unitsOf(section) {
  const units = []
  section.blocks.forEach((block, b) => {
    if (block.type === 'bullets') {
      block.items.forEach((text) => units.push({ b, kind: 'bullet', text }))
    } else if (block.type === 'text') {
      units.push({ b, kind: 'text', text: block.text, block })
    } else if (block.type === 'chipGroups' || block.type === 'listGroups') {
      block.groups.forEach((group) =>
        units.push({ b, kind: 'group', group, block }),
      )
    } else if (block.type === 'image') {
      units.push({ b, kind: 'image', block })
    } else {
      units.push({ b, kind: 'block', block })
    }
  })
  return units
}

/* -------------------------------------------------------------------------- */
/* Assembly                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One sheet of a section, as the page object DossierPage renders.
 *
 * Every sheet carries the section's label as its title; every sheet after the
 * first says it is `continued`, and a section with a heading (a project)
 * repeats the heading's title under it, so a reader landing mid-section
 * knows whose sheet it is. Only the first sheet carries the subtitle.
 *
 * Bullets join the heading's entry, as they would on a sheet written by
 * hand, so the hairline under the title sits between the two.
 *
 * `spacing` is DossierPage's `compact` or `tight` step, used only to let a
 * section finish on a sheet rather than spill a remnant onto another (see
 * paginateSection). Type size and leading never change.
 */
export function assembleSheet(
  section,
  units,
  { first, index, spacing = 'normal' },
) {
  const blocks = []
  const heading = section.heading
  if (heading) {
    blocks.push({
      type: 'entry',
      title: heading.title,
      ...(first && heading.subtitle ? { org: heading.subtitle } : {}),
    })
  }

  for (const unit of units) {
    const last = blocks.at(-1)
    const joins = last && last.flowFrom === unit.b

    if (unit.kind === 'bullet') {
      const item = unit.cont ? { text: unit.text, cont: true } : unit.text
      if (joins) {
        last.bullets.push(item)
      } else if (last?.type === 'entry' && last.flowFrom === undefined) {
        /* The heading's entry, with nothing set under it yet. */
        last.bullets = [item]
        last.flowFrom = unit.b
      } else {
        blocks.push({ type: 'entry', bullets: [item], flowFrom: unit.b })
      }
    } else if (unit.kind === 'group') {
      if (joins) last.groups.push(unit.group)
      else blocks.push({ ...unit.block, groups: [unit.group], flowFrom: unit.b })
    } else if (unit.kind === 'text') {
      blocks.push({ ...unit.block, text: unit.text })
    } else if (unit.kind === 'image') {
      blocks.push({ ...unit.block, displayHeight: unit.height })
    } else {
      blocks.push(unit.block)
    }
  }

  return {
    id: `${section.id}-${index + 1}`,
    title: section.title,
    ...(first ? {} : { titleNote: 'continued' }),
    ...(spacing === 'normal' ? {} : { [spacing]: true }),
    blocks,
  }
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

/** The height a print takes at full width, never enlarged past its pixels. */
function naturalPrintHeight(block, columnWidth) {
  const width = Math.max(0, columnWidth - PRINT_FRAME_X)
  return Math.floor(
    Math.min(block.height, (width * block.height) / block.width),
  )
}

/** A bullet or paragraph cut after `n` words, and the rest of it. */
function splitText(unit, n) {
  const words = unit.text.split(' ')
  return [
    { ...unit, text: words.slice(0, n).join(' ') },
    { ...unit, text: words.slice(n).join(' '), cont: true },
  ]
}

/**
 * Lays one section onto as many sheets as it needs.
 *
 * `measure(page)` returns `{ slack, columnWidth }`: the pixels left between
 * the last block and the foot of the sheet's body (negative when it would
 * scroll), and the width blocks are set at.
 *
 * Sheets are set at normal spacing. The one exception is the end of a
 * section: when everything the section has left would fit on the sheet at
 * a `compact` or `tight` step, it is set that way rather than spilling a
 * remnant - one chip group, one row of links - onto a sheet of its own.
 */
function paginateSection(section, measure) {
  const sheets = []
  const queue = unitsOf(section)
  const fresh = (units) =>
    measure(assembleSheet(section, units, { first: false, index: 1 })).slack

  while (queue.length > 0 || sheets.length === 0) {
    const first = sheets.length === 0
    const page = (units, spacing) =>
      assembleSheet(section, units, { first, index: sheets.length, spacing })
    const slackOf = (units, spacing) => measure(page(units, spacing)).slack
    const fits = (units, spacing) => slackOf(units, spacing) >= -FIT_TOLERANCE
    const placed = []
    let spacing = 'normal'

    /* How full the sheet is so far, as a share of the room under its
       heading. */
    const empty = slackOf([])
    const fill = () => (empty > 0 ? 1 - slackOf(placed) / empty : 1)

    while (queue.length > 0) {
      const unit = queue[0]

      if (unit.kind === 'image') {
        const at = (height) => ({ ...unit, height })
        const natural = naturalPrintHeight(
          unit.block,
          measure(page(placed)).columnWidth,
        )
        if (fits([...placed, at(natural)])) {
          placed.push(at(natural))
          queue.shift()
          continue
        }

        /* Otherwise it shrinks into the space left, never under the
           minimum. When the unit after it is the section's last (its
           links), the print gives up enough height for that to come too. */
        const min = Math.min(natural, MIN_PRINT_HEIGHT)
        const next = queue.length === 2 ? queue[1] : null
        let choice = null
        for (const step of next ? SPACING_STEPS : []) {
          const slack = slackOf([...placed, at(min), next], step)
          if (slack >= -FIT_TOLERANCE) {
            const height = Math.min(natural, Math.floor(min + slack))
            choice = { height, withNext: true, spacing: step }
            break
          }
        }
        if (!choice) {
          const slack = slackOf([...placed, at(min)])
          if (slack >= -FIT_TOLERANCE) {
            const height = Math.min(natural, Math.floor(min + slack))
            choice = { height, withNext: false, spacing: 'normal' }
          }
        }

        /* A print squeezed well under its size goes to the next sheet
           instead, where it prints noticeably larger - unless this sheet
           is still mostly empty, which would trade one gap for another. */
        if (choice && placed.length > 0 && choice.height < natural * 0.6) {
          const roomy = Math.min(natural, Math.floor(min + fresh([at(min)])))
          if (roomy > choice.height * 1.25 && fill() >= 0.5) choice = null
        }

        if (!choice && placed.length === 0) {
          choice = { height: min, withNext: false, spacing: 'normal' }
        }
        if (choice) {
          placed.push(at(choice.height))
          queue.shift()
          if (choice.withNext) placed.push(queue.shift())
          spacing = choice.spacing
        }
        break
      }

      if (fits([...placed, unit])) {
        placed.push(unit)
        queue.shift()
        continue
      }

      /* The section's remnant, set tighter so it finishes here. Prints are
         left to the rule above, which sizes them to the room. */
      if (placed.length > 0 && !queue.some((u) => u.kind === 'image')) {
        const step = SPACING_STEPS.slice(1).find((s) =>
          fits([...placed, ...queue], s),
        )
        if (step) {
          placed.push(...queue.splice(0))
          spacing = step
          break
        }
      }

      /* A bullet or paragraph is only cut when it would not fit on a fresh
         sheet either; otherwise it moves over whole. When it is cut, the
         sheet it starts on is filled first, word by word. */
      const splittable = unit.kind === 'bullet' || unit.kind === 'text'
      if (splittable && fresh([unit]) < -FIT_TOLERANCE) {
        const words = unit.text.split(' ').length
        let lo = 0
        let hi = words - 1
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2)
          if (fits([...placed, splitText(unit, mid)[0]])) lo = mid
          else hi = mid - 1
        }
        const enough = lo >= Math.min(MIN_SPLIT_WORDS, words - 1)
        if (lo > 0 && (enough || placed.length === 0)) {
          const [head, rest] = splitText(unit, lo)
          placed.push(head)
          queue.splice(0, 1, rest)
        }
        break
      }

      /* Nothing on this sheet yet and it still does not fit: set it anyway
         rather than loop forever. The sheet scrolls rather than clipping. */
      if (placed.length === 0) {
        placed.push(unit)
        queue.shift()
      }
      break
    }

    sheets.push(page(placed, spacing))
  }

  return sheets
}

/**
 * Every section opens a new sheet. Sheet numbers - the eyebrows here, the
 * footers and counter downstream - are counted over the result, so they
 * always follow the layout.
 */
export function paginate(dossier, measure) {
  const sheets = []
  for (const section of dossier.sections) {
    sheets.push(...paginateSection(section, measure))
  }
  return sheets.map((sheet, i) => ({
    ...sheet,
    eyebrow: `Sheet ${String(i + 1).padStart(2, '0')}`,
  }))
}
