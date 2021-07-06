import {createSelector, Selector} from '@reduxjs/toolkit'

import {HelpCenter} from '../../../models/helpCenter/types'
import {StoreState} from '../../../state/types'

import {HelpCentersState} from './types'

export const readHelpcenters = (state: StoreState): HelpCentersState =>
    state.entities?.helpCenters || []

export const readHelpcenterById = (
    helpcenterId: string
): Selector<StoreState, HelpCenter> =>
    createSelector(readHelpcenters, (helpcenters) => helpcenters[helpcenterId])
