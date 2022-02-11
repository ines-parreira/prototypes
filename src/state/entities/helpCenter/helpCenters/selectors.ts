import {createSelector} from '@reduxjs/toolkit'

import {HelpCenter} from 'models/helpCenter/types'
import {StoreState} from 'state/types'

import {getCurrentHelpCenterId} from 'state/ui/helpCenter/selectors'

export const getHelpCenters = (state: StoreState): Record<string, HelpCenter> =>
    state.entities.helpCenter.helpCenters.helpCentersById || {}

export const getCurrentHelpCenter = createSelector(
    getCurrentHelpCenterId,
    getHelpCenters,
    (currentHelpCenterId, helpCenterList): HelpCenter | null => {
        if (currentHelpCenterId) {
            return helpCenterList[currentHelpCenterId.toString()] || null
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
