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

export const getHelpcenterListByTypes = (types?: HelpCenter['type'][]) =>
    createSelector(getHelpCenters, (helpCenters) => {
        if (!types) {
            return Object.values(helpCenters)
        }

        return Object.values(helpCenters).filter((helpCenter) =>
            types.includes(helpCenter.type)
        )
    })

export const getActiveHelpCenterList = createSelector(
    getHelpcenterListByTypes(),
    (helpCenters) =>
        helpCenters.filter((helpCenter) => !helpCenter.deactivated_datetime)
)
