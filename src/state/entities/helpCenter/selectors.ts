import {StoreState} from 'state/types'
import {HelpCenterState} from 'state/entities/helpCenter/types'

export const getHelpCenterStore = (state: StoreState): HelpCenterState =>
    state.entities.helpCenter
