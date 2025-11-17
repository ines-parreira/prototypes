import { createReducer } from '@reduxjs/toolkit'

import type { SelfServiceConfiguration } from '../../../models/selfServiceConfiguration/types'
import {
    selfServiceConfigurationFetched,
    selfServiceConfigurationsFetched,
    selfServiceConfigurationUpdated,
} from './actions'
import type { SelfServiceConfigurationsState } from './types'

export const initialState: SelfServiceConfigurationsState = {}

const selfServiceConfigurationsReducer =
    createReducer<SelfServiceConfigurationsState>(initialState, (builder) =>
        builder
            .addCase(selfServiceConfigurationsFetched, (state, { payload }) => {
                payload.map(
                    (selfServiceConfiguration: SelfServiceConfiguration) => {
                        state[selfServiceConfiguration.id.toString()] =
                            selfServiceConfiguration
                    },
                )
            })
            .addCase(selfServiceConfigurationFetched, (state, { payload }) => {
                state[payload.id.toString()] = payload
            })
            .addCase(selfServiceConfigurationUpdated, (state, { payload }) => {
                state[payload.id.toString()] = payload
            }),
    )

export default selfServiceConfigurationsReducer
