import {createSelector} from '@reduxjs/toolkit'

import {RootState} from '../../types'

export const getSelfServiceConfigurations = createSelector(
    (state: RootState) => state.entities.selfServiceConfigurations,
    (selfServiceConfigurations) => Object.values(selfServiceConfigurations)
)
