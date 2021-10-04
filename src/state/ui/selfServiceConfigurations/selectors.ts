import {createSelector} from '@reduxjs/toolkit'

import {RootState} from '../../types'

export const getLoading = createSelector(
    (state: RootState) => state.ui.selfServiceConfigurations,
    (selfServiceConfigurations) => selfServiceConfigurations.loading
)
