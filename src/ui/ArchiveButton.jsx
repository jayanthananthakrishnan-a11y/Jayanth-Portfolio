/**
 * The archive's one call to action: a tracked mono label in a hairline box
 * with a corner arrow that leans on hover.
 *
 * Shared by the landing copy and the file-sequence prompts so that every step
 * of the path into the dossier - open the archive, take the file, open the
 * file - is visibly the same gesture rather than three lookalikes.
 */
export function ArchiveButton({
  label,
  onClick,
  tabIndex,
  className = '',
  glyph = '↗',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      className={`group pointer-events-auto flex w-full max-w-xs items-center justify-between gap-6 border border-cream-400/45 px-6 py-5 transition-colors hover:border-brass-400 hover:bg-cream-50/5 ${className}`}
    >
      <span className="label text-cream-50">{label}</span>
      <span
        aria-hidden="true"
        className="text-cream-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass-400"
      >
        {glyph}
      </span>
    </button>
  )
}
