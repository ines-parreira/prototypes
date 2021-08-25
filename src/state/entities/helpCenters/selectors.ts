import {StoreState} from '../../../state/types'

import {HelpCentersState} from './types'

export const readHelpcenters = (state: StoreState): HelpCentersState =>
    state.entities?.helpCenters || []
