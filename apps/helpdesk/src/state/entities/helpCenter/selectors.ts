import type { HelpCenterState } from 'state/entities/helpCenter/types'
import type { StoreState } from 'state/types'

export const getHelpCenterStore = (state: StoreState): HelpCenterState =>
    state.entities.helpCenter
