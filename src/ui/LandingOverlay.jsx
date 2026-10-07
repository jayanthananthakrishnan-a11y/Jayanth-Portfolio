import { SITE } from '../data/site'
import { useArchive } from '../state/archiveStore'
import { ArchiveButton } from './ArchiveButton'

/**
 * Staggered reveal. Each block fades and slides up once the lamp is on; the
 * `delay` is in ms and ordering is deliberate - name, role, copy, then CTA.
 */
function Reveal({ show, delay = 0, className = '', children }) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className}`}
      style={{ transitionDelay: show ? `${delay}ms` : '0ms' }}
      aria-hidden={!show}
    >
      {children}
    </div>
  )
}

/**
 * The landing copy, hidden until the room is lit.
 *
 * It also steps aside once the file sequence starts: from that point the
 * prompt beside the drawer is the only copy on screen, so the two never
 * compete for the same left-hand column.
 *
 * `forceShow` is used by the no-WebGL fallback, which has no lamp to pull.
 */
export function LandingOverlay({ forceShow = false, onOpenArchive }) {
  const lampOn = useArchive((s) => s.lampOn)
  const fileStage = useArchive((s) => s.fileStage)
  const show = forceShow || (lampOn && !fileStage)

  return (
    <div
      /* Hidden but still mounted, so its button has to stop taking clicks -
         see the same note in FilePrompt, which stacks directly over this. */
      inert={!show}
      className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-center px-5 sm:px-10 lg:px-16 ${
        show ? '' : '[&_*]:pointer-events-none'
      }`}
    >
      {/* Readability scrim. The lit desk sits directly behind the copy, so the
          text needs its own ground - heavier in portrait, where the scene
          fills the whole frame. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 transition-opacity duration-1000 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(100deg, rgba(6,13,9,0.94) 0%, rgba(6,13,9,0.8) 34%, rgba(6,13,9,0.25) 62%, transparent 82%)',
        }}
      />
      <div className="max-w-xl">
        <Reveal show={show} delay={0} className="mb-6 flex items-center gap-3">
          <span aria-hidden="true" className="text-cream-400">
            +
          </span>
          <span className="label text-cream-400">{SITE.department}</span>
        </Reveal>

        <Reveal show={show} delay={120}>
          <h1 className="font-display text-6xl leading-[0.95] text-cream-50 sm:text-7xl lg:text-8xl">
            {SITE.name}
          </h1>
        </Reveal>

        <Reveal show={show} delay={240}>
          <p className="mt-2 font-display text-3xl italic leading-tight text-cream-200 sm:text-4xl lg:text-5xl">
            {SITE.role}
          </p>
        </Reveal>

        <Reveal show={show} delay={400} className="mt-8 space-y-1.5">
          {SITE.intro.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-cream-200/85">
              {line}
            </p>
          ))}
        </Reveal>

        <Reveal show={show} delay={560} className="mt-10">
          <ArchiveButton
            label={SITE.cta}
            onClick={onOpenArchive}
            tabIndex={show ? 0 : -1}
          />
        </Reveal>

        <Reveal show={show} delay={680} className="mt-6 flex flex-wrap items-center gap-3">
          <span className="label text-cream-400">{SITE.ledger[0]}</span>
          <span aria-hidden="true" className="h-px w-6 bg-cream-400/40" />
          <span className="label text-cream-400">{SITE.ledger[1]}</span>
        </Reveal>
      </div>

      <Reveal
        show={show}
        delay={820}
        className="mt-14 flex items-end gap-4 sm:mt-20"
      >
        <span className="font-display text-4xl italic leading-none text-cream-400/70">
          01
        </span>
        <div className="pb-1">
          <p className="label text-cream-50">The Archive Room</p>
          <p className="label text-cream-400">Look around. Follow your curiosity.</p>
        </div>
      </Reveal>
    </div>
  )
}
