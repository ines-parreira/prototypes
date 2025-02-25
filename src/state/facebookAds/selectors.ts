import { fromJS, List, Map } from 'immutable'

import { createImmutableSelector } from '../../utils'
import { RootState } from '../types'

const getState = (state: RootState) => state.facebookAds

export const getFacebookIntegrationLoading = createImmutableSelector(
    getState,
    (state) => (state.get('loading') as boolean) || false,
)

export const getFacebookIntegrationInternals = createImmutableSelector(
    getState,
    (state) => (state.get('internals') as Map<any, any>) || fromJS({}),
)

export const getFacebookIntegrationLoadingAds = createImmutableSelector(
    getState,
    (state) => (state.get('loadingAds') as List<any>) || fromJS([]),
)
