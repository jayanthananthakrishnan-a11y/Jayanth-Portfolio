import { lazy, Suspense } from 'react'
import { HAS_WEBGL } from './lib/capabilities'
import { getDossier } from './data/dossiers'
import { useArchive } from './state/archiveStore'
import { TopBar } from './ui/TopBar'
import { LandingOverlay } from './ui/LandingOverlay'
import { PullPrompt } from './ui/PullPrompt'
import { CornerMeta } from './ui/CornerMeta'
import { FlatBackdrop } from './ui/FlatBackdrop'
import { SceneBoundary } from './ui/SceneBoundary'
import { FilePrompt } from './ui/FilePrompt'
import { FileIndex } from './ui/FileIndex'
import { DossierView } from './ui/dossier/DossierView'

/* Three.js is the heaviest thing on the page and is useless without WebGL, so
   it is split out of the initial bundle. */
const ArchiveCanvas = lazy(() =>
  import('./scene/ArchiveCanvas').then((m) => ({ default: m.ArchiveCanvas })),
)

export default function App() {
  const indexOpen = useArchive((s) => s.indexOpen)
  const openDossierId = useArchive((s) => s.openDossierId)
  const openIndex = useArchive((s) => s.openIndex)
  const closeIndex = useArchive((s) => s.closeIndex)
  const openDossier = useArchive((s) => s.openDossier)
  const closeDossier = useArchive((s) => s.closeDossier)

  const dossier = getDossier(openDossierId)

  return (
    <main className="relative h-full w-full overflow-hidden bg-forest-900">
      {HAS_WEBGL ? (
        <SceneBoundary fallback={<FlatBackdrop />}>
          <Suspense fallback={<FlatBackdrop />}>
            <ArchiveCanvas />
          </Suspense>
        </SceneBoundary>
      ) : (
        <FlatBackdrop />
      )}

      <TopBar onOpenIndex={openIndex} />

      {/* Without a lamp to pull there is nothing to reveal, so the copy is
          shown immediately in the flat fallback. */}
      {HAS_WEBGL ? <PullPrompt /> : null}
      <LandingOverlay forceShow={!HAS_WEBGL} onOpenArchive={openIndex} />

      {/* The three beats of the drawer sequence speak from here; the folder
          itself is in the scene. Both read the same `fileStage`. */}
      {HAS_WEBGL ? <FilePrompt /> : null}

      <CornerMeta />

      {/* The flat layers. Both work with the room absent, which is what keeps
          the dossier reachable without WebGL - the drawer is a shortcut into
          the same route the File Index offers. */}
      {indexOpen && (
        <FileIndex onClose={closeIndex} onOpenDossier={openDossier} />
      )}
      {dossier && <DossierView dossier={dossier} onClose={closeDossier} />}
    </main>
  )
}
