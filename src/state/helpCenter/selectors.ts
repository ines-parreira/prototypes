import {StoreState} from '../../state/types'

import {HelpCenterState} from './types'

export const readHelpCenterStore = (state: StoreState): HelpCenterState =>
    state.helpCenter
