import {createSelector} from '@reduxjs/toolkit'

import {RootState} from '../types'

import {SelfServiceState} from './types'

export const getSelfServiceState = (state: RootState) => state.selfService || {}

export const getSelfServiceConfigurations = createSelector(
    getSelfServiceState,
    (state: SelfServiceState) => state.self_service_configurations || []
)

export const getLoading = createSelector(
    getSelfServiceState,
    (state: SelfServiceState) => state.loading || false
)
