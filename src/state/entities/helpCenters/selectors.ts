import {createSelector} from '@reduxjs/toolkit'

import {HelpCenter} from '../../../models/helpCenter/types'
import {StoreState} from '../../../state/types'

import {getCurrentHelpCenterId} from '../../helpCenter/ui/selectors'

import {HelpCentersState} from './types'

export const getHelpCenters = (state: StoreState): HelpCentersState =>
    state.entities.helpCenters || {}

export const getCurrentHelpCenter = createSelector(
    getCurrentHelpCenterId,
    getHelpCenters,
    (currentHelpCenterId, helpCenterList): HelpCenter | null => {
        if (currentHelpCenterId) {
            return helpCenterList[currentHelpCenterId] || null
        }
        return null
    }
)

export const getHelpCenterSortedList = createSelector(
    getHelpCenters,
    (helpCenters) =>
        Object.values(helpCenters).sort(({name: nameA}, {name: nameB}) =>
            nameA.localeCompare(nameB)
        )
)
