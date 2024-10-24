import {HelpCenterState} from 'state/entities/helpCenter/types'
import {StoreState} from 'state/types'

export const getHelpCenterStore = (state: StoreState): HelpCenterState =>
    state.entities.helpCenter
