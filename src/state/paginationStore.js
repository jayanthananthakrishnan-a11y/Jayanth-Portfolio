import { create } from 'zustand'

/**
 * Where each dossier's sheets come from once they have been laid out.
 *
 * A dossier is written as a flow of sections (see data/dossiers.js), not as
 * sheets: how much of it fits on a sheet depends on the sheet's size, which
 * depends on the window and on the view. ui/dossier/pagination.jsx measures
 * that and files the result here, per dossier and per view:
 *
 *   byId[id].spread   the sheets of the paged spread
 *   byId[id].reading  the sheets of Reading View
 *
 * Kept outside React context for the same reason as archiveStore: the folder
 * cover in the room reads its sheet count from here, through the R3F
 * reconciler, which context does not cross.
 */
export const usePagination = create(() => ({ byId: {} }))

/** A dossier's sheets for one view, or null until they have been measured. */
export function useDossierPages(id, mode) {
  return usePagination((s) => s.byId[id]?.[mode] ?? null)
}

/**
 * How many sheets the file holds, as typed on its cover and in the drawer
 * prompt: the spread's count, the view the dossier opens in. Null until
 * measured.
 */
export function useSheetCount(id) {
  return usePagination((s) => s.byId[id]?.spread?.length ?? null)
}

/** "08", or a dash while the sheets are still being laid out. */
export function formatSheetCount(count) {
  return count == null ? '--' : String(count).padStart(2, '0')
}
