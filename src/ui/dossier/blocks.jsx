import { useContext } from 'react'
import { DossierNav } from './nav'

/**
 * Paper block renderers.
 *
 * Every dossier page is a list of blocks from data/dossiers.js, and this file
 * is the only place that decides how each one looks. Content files stay free
 * of styling, and a legibility change (line-height, chip padding, bullet
 * spacing) happens once here for every page in the archive.
 *
 * Legibility rules these all obey, because the resume pages are far denser
 * than the placeholder case files:
 *   - body copy never smaller than 0.9rem, never tighter than leading-[1.8]
 *   - bullets hang off their marker so wrapped lines stay aligned
 *   - anything list-shaped is broken up by a tracked label, never run together
 */

/** Tracked mono label. The metadata voice, same as `.label` in the room UI. */
function GroupLabel({ children }) {
  return (
    <p className="label mb-3 text-ink-500">
      {children}
      <span aria-hidden="true" className="ml-3 inline-block h-px w-6 translate-y-[-3px] bg-ink-300" />
    </p>
  )
}

/** A bordered tag chip. Shared by `chips` and `chipGroups`. */
function Chip({ children }) {
  return (
    <li className="border border-ink-300/70 bg-cream-50/60 px-3 py-2 text-[0.72rem] leading-none tracking-[0.06em] text-ink-700">
      {children}
    </li>
  )
}

/* On a `tight` page the gap between items closes a step; the type and its
   leading stay at the floor set above.
   An item is a string, or `{ text, cont: true }` for the rest of a bullet
   that was too long for one sheet and runs on from the sheet before: it
   hangs at the same indent, with no marker of its own. */
function Bullets({ items, tight }) {
  return (
    <ul className={tight ? 'space-y-1.5' : 'space-y-3.5'}>
      {items.map((item) => {
        const { text, cont } = typeof item === 'string' ? { text: item } : item
        return (
          <li key={text} className="grid grid-cols-[0.6rem_1fr] gap-x-3">
            <span
              aria-hidden="true"
              className={`mt-[0.62em] h-px w-2.5 bg-brass-500 ${cont ? 'invisible' : ''}`}
            />
            <span
              className={`text-[0.9rem] text-ink-700 ${
                tight ? 'leading-[1.8]' : 'leading-[1.9]'
              }`}
            >
              {text}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * An inline row of links, as in the resume's contact row. Shared by `fields`
 * (a `parts` value) and `entry` (its `links`), so both draw the same row.
 */
function LinkParts({ parts }) {
  return (
    /* Separators are drawn, not typed, so a wrapped line never starts with
       a dangling pipe. */
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {parts.map((part, i) => {
        /* Off-site links and filed documents open in a new tab so the
           dossier stays where it was; tel/mailto do not. */
        const newTab = /^https?:|\.pdf$/.test(part.href)
        return (
          <span key={part.text} className="flex items-center gap-x-3">
            {i > 0 && (
              <span aria-hidden="true" className="text-ink-300">
                |
              </span>
            )}
            {/* A part with no address yet is set as plain text. */}
            {part.href ? (
              <a
                href={part.href}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noreferrer noopener' : undefined}
                className="underline decoration-ink-300 underline-offset-4 transition-colors hover:text-brass-500 hover:decoration-brass-500"
              >
                {part.text}
              </a>
            ) : (
              <span>{part.text}</span>
            )}
          </span>
        )
      })}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Block types                                                                */
/* -------------------------------------------------------------------------- */

function Headline({ block }) {
  return (
    <h3 className="font-display text-[2rem] leading-[1.15] text-ink-900 sm:text-[2.4rem]">
      {block.text}
    </h3>
  )
}

function Fields({ block, tight }) {
  return (
    /* `columns: 2` sets short rows side by side; the row gap matches the
       single-column rhythm so the two layouts read as one list. */
    <dl
      className={
        block.columns === 2
          ? `grid grid-cols-2 gap-x-8 ${tight ? 'gap-y-3' : 'gap-y-5'}`
          : tight
            ? 'space-y-3'
            : 'space-y-5'
      }
    >
      {block.items.map((item) => (
        <div key={item.label}>
          <dt className={`label text-ink-500 ${tight ? 'mb-1' : 'mb-1.5'}`}>
            {item.label}
          </dt>
          <dd className="text-[0.92rem] leading-[1.8] text-ink-900">
            {item.parts ? (
              <LinkParts parts={item.parts} />
            ) : (
              item.value
            )}
            {item.note && (
              <span className="mt-1 block text-[0.86rem] leading-[1.8] text-ink-700">
                {item.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Entry({ block, tight }) {
  return (
    <div>
      {/* `links` sit level with the title, right-aligned, and wrap onto
          their own line under the subtitle when the two will not fit. */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div>
          {block.title && (
            <h3 className="font-display text-[1.6rem] leading-[1.2] text-ink-900">
              {block.title}
            </h3>
          )}
          {block.org && (
            <p className="mt-1.5 text-[0.9rem] italic leading-snug text-ink-700">
              {block.org}
            </p>
          )}
        </div>
        {block.links && (
          <p className="text-[0.92rem] leading-[1.8] text-ink-900">
            <LinkParts parts={block.links} />
          </p>
        )}
      </div>
      {block.meta && (
        <p className="label mt-3 text-ink-500">{block.meta}</p>
      )}

      {/* An entry with no title is the run of a list onto a sheet that
          does not open with it, and has no heading to rule off. */}
      {block.title && (
        <hr
          className={`border-0 border-t border-ink-300/60 ${tight ? 'my-3' : 'my-5'}`}
        />
      )}

      {/* Optional: an entry whose write-up is a print on the same sheet
          (an article clipping) carries no bullets of its own. */}
      {block.bullets && <Bullets items={block.bullets} tight={tight} />}
    </div>
  )
}

function Chips({ block }) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {block.items.map((item) => (
        <Chip key={item}>{item}</Chip>
      ))}
    </ul>
  )
}

function ChipGroups({ block, tight }) {
  return (
    <div className={tight ? 'space-y-4' : 'space-y-6'}>
      {block.groups.map((group) => (
        <section key={group.label}>
          <GroupLabel>{group.label}</GroupLabel>
          <ul className={`flex flex-wrap ${tight ? 'gap-1.5' : 'gap-2'}`}>
            {group.items.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/* `note: true` sets the paragraph as a footnote: the size and ink of a
   `fields` note, one step under body copy. */
function Text({ block }) {
  return (
    <p
      className={
        block.note
          ? 'text-[0.86rem] leading-[1.8] text-ink-700'
          : 'text-[0.92rem] leading-[1.8] text-ink-900'
      }
    >
      {block.text}
    </p>
  )
}

function ListGroups({ block, tight }) {
  return (
    <div className={tight ? 'space-y-5' : 'space-y-8'}>
      {block.groups.map((group) => (
        <section key={group.label}>
          <GroupLabel>{group.label}</GroupLabel>
          <Bullets items={group.items} tight={tight} />
        </section>
      ))}
    </div>
  )
}

/**
 * A plate pasted onto the sheet: a hairline frame and a strip of cream margin,
 * the same rule the page header and closing plate are drawn in, so the image
 * reads as a print mounted on the paper rather than a hole cut through it.
 *
 * `maxHeight` caps a print that would otherwise push its sheet past the page;
 * the frame shrinks with it rather than letterboxing the image.
 *
 * `displayHeight` (set by pagination, from the print's own `width` and
 * `height`) prints it at exactly that height and the width that keeps its
 * proportions, so its size is known before the file has loaded. The frame
 * adds 18px across: a 1px hairline and 0.5rem of margin each side
 * (PRINT_FRAME_X in flow.js).
 */
function Image({ block }) {
  const size = block.displayHeight
    ? {
        height: block.displayHeight,
        width: (block.displayHeight * block.width) / block.height,
      }
    : block.maxHeight
      ? { maxHeight: block.maxHeight }
      : undefined
  return (
    <figure>
      <div className="w-fit max-w-full border border-ink-300/70 bg-cream-50/60 p-2">
        <img
          src={block.src}
          alt={block.alt}
          loading="lazy"
          style={size}
          className="block h-auto max-w-full"
        />
      </div>
      {block.caption && (
        <figcaption className="label mt-3 text-ink-500">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

/**
 * A ruled record table: a serif title like an `entry`, tracked mono column
 * heads, and hairline rules between rows, the same rule the page strips use.
 *
 * Each column names the row `key` it reads and may set `align: 'right'` for
 * short figures. A column may set `wrap: true` to let long text break; every
 * other column holds its line. Below the sheet's width the table scrolls
 * sideways inside its own box rather than pushing the page wider.
 *
 * A `dense` table closes its rows one step further on a `tight` page, for a
 * table with more rows than a short sheet holds at the usual step. Type size
 * and leading stay as they are; only the padding between rules gives.
 */
function Table({ block, tight }) {
  const cell = tight ? (block.dense ? 'py-1' : 'py-2') : 'py-3'
  return (
    <div>
      {block.title && (
        <h3 className="mb-4 font-display text-[1.6rem] leading-[1.2] text-ink-900">
          {block.title}
        </h3>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-300/70">
              {block.columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`label whitespace-nowrap pb-3 pr-4 font-normal text-ink-500 last:pr-0 ${
                    col.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-b border-ink-300/50">
                {block.columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${cell} pr-4 align-top text-[0.92rem] leading-[1.6] text-ink-900 last:pr-0 ${
                      col.wrap ? '' : 'whitespace-nowrap'
                    } ${col.align === 'right' ? 'text-right tabular-nums' : ''}`}
                  >
                    {row[col.key] ?? (
                      <span className="text-ink-500">&mdash;</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * The dossier's index, read off its own sheets rather than written down, so
 * it cannot drift from them: every `table` with a title opens an entry, and
 * each `continued` sheet straight after it runs that entry on. Adding,
 * dropping or reordering a term moves its line and its numbers with it.
 */
function contentsOf(pages) {
  const entries = []
  pages.forEach((page, i) => {
    const table = page.blocks.find((b) => b.type === 'table' && b.title)
    const last = entries.at(-1)
    if (table) entries.push({ title: table.title, first: i, last: i })
    else if (page.titleNote === 'continued' && last?.last === i - 1) last.last = i
  })
  return entries
}

const sheetNo = (i) => String(i + 1).padStart(2, '0')

/**
 * A contents page: the term in the body's mono, a dotted leader, and the
 * sheet numbers flush right, as in a printed index. Each line opens its
 * sheet; the hover is the brass the archive's links already turn.
 */
function Contents({ block }) {
  const nav = useContext(DossierNav)
  if (!nav) return null
  const entries = contentsOf(nav.pages)

  return (
    <div>
      {block.title && (
        <h3 className="mb-4 font-display text-[1.6rem] leading-[1.2] text-ink-900">
          {block.title}
        </h3>
      )}
      <ol className="border-t border-ink-300/70">
        {entries.map((entry) => {
          const numbers =
            entry.first === entry.last
              ? sheetNo(entry.first)
              : `${sheetNo(entry.first)}–${sheetNo(entry.last)}`
          return (
            <li key={entry.first} className="border-b border-ink-300/50">
              <button
                type="button"
                onClick={() => nav.goToPage(entry.first)}
                aria-label={`${entry.title}, ${entry.first === entry.last ? 'sheet' : 'sheets'} ${numbers}`}
                className="group flex w-full items-baseline gap-3 py-3 text-left text-[0.92rem] leading-[1.6] text-ink-900 outline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-brass-500"
              >
                <span className="transition-colors group-hover:text-brass-500">
                  {entry.title}
                </span>
                <span
                  aria-hidden="true"
                  className="min-w-4 grow translate-y-[-0.3em] border-b border-dotted border-ink-300 transition-colors group-hover:border-brass-500/60"
                />
                <span className="whitespace-nowrap tabular-nums text-ink-700 transition-colors group-hover:text-brass-500">
                  {numbers}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const RENDERERS = {
  contents: Contents,
  headline: Headline,
  fields: Fields,
  entry: Entry,
  chips: Chips,
  chipGroups: ChipGroups,
  listGroups: ListGroups,
  image: Image,
  table: Table,
  text: Text,
}

export function Block({ block, tight }) {
  const Renderer = RENDERERS[block.type]
  if (!Renderer) return null
  return <Renderer block={block} tight={tight} />
}
