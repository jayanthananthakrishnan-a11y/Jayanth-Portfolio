import { createContext } from 'react'

/**
 * What a block needs to know about the dossier it is bound into: its pages,
 * and `goToPage(index)` to open one of them. Provided by DossierView, which
 * alone knows whether that means turning to a spread or scrolling to a sheet.
 * Null outside a dossier, where a `contents` block has nothing to list.
 */
export const DossierNav = createContext(null)
