import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '../../types'

export const getSelfServiceConfigurations = createSelector(
    (state: RootState) => state.entities.selfServiceConfigurations,
    (selfServiceConfigurations) => Object.values(selfServiceConfigurations),
)
