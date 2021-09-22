import {StoreState} from '../../state/types'

import {HelpCenterState} from './types'

export const getHelpCenterStore = (state: StoreState): HelpCenterState =>
    state.helpCenter
