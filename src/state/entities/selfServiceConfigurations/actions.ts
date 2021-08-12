import {createAction} from '@reduxjs/toolkit'

import {SelfServiceConfiguration} from '../../../models/selfServiceConfiguration/types'

import {
    SELF_SERVICE_CONFIGURATION_FETCHED,
    SELF_SERVICE_CONFIGURATION_UPDATED,
    SELF_SERVICE_CONFIGURATIONS_FETCHED,
} from './constants'

export const selfServiceConfigurationUpdated = createAction<
    SelfServiceConfiguration
>(SELF_SERVICE_CONFIGURATION_UPDATED)
export const selfServiceConfigurationFetched = createAction<
    SelfServiceConfiguration
>(SELF_SERVICE_CONFIGURATION_FETCHED)
export const selfServiceConfigurationsFetched = createAction<
    SelfServiceConfiguration[]
>(SELF_SERVICE_CONFIGURATIONS_FETCHED)
