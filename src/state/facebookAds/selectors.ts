import {fromJS, Map, List} from 'immutable'

import {createImmutableSelector} from '../../utils'
import {RootState} from '../types'

const getState = (state: RootState) => state.facebookAds

export const getFacebookIntegrationLoading = createImmutableSelector<
    RootState,
    boolean,
    Map<any, any>
>(getState, (state) => (state.get('loading') as boolean) || false)

export const getFacebookIntegrationInternals = createImmutableSelector<
    RootState,
    Map<any, any>,
    Map<any, any>
>(getState, (state) => (state.get('internals') as Map<any, any>) || fromJS({}))

export const getFacebookIntegrationLoadingAds = createImmutableSelector<
    RootState,
    List<any>,
    Map<any, any>
>(getState, (state) => (state.get('loadingAds') as List<any>) || fromJS([]))
