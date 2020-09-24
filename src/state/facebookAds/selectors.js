import {fromJS} from 'immutable'

import type {stateType} from '../types'
import {createImmutableSelector} from '../../utils.ts'

const getState = (state: stateType) => state.facebookAds

export const getFacebookIntegrationLoading = createImmutableSelector(
    [getState],
    (state) => state.get('loading') || false
)

export const getFacebookIntegrationInternals = createImmutableSelector(
    [getState],
    (state) => state.get('internals') || fromJS({})
)

export const getFacebookIntegrationLoadingAds = createImmutableSelector(
    [getState],
    (state) => state.get('loadingAds') || fromJS([])
)
