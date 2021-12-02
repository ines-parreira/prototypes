import {fromJS, Map, List} from 'immutable'

import {GorgiasAction} from '../types'

import {
    ADD_LOADING_FACEBOOK_AD,
    REMOVE_LOADING_FACEBOOK_AD,
    SET_FACEBOOK_ADS_INTERNALS,
    SET_FACEBOOK_ADS_LOADING,
    UPDATE_ACTIVE_FACEBOOK_AD,
} from './constants'

export const initialState = fromJS({
    loading: true,
    internals: {},
    loadingAds: [],
}) as Map<any, any>

const getActivePath = (
    key: string,
    {integrationId, id}: {integrationId: number; id: string}
) => ['internals', integrationId.toString(), key, id, 'is_active']

export default function reducer(
    state: Map<any, any> = initialState,
    action: GorgiasAction
) {
    switch (action.type) {
        case SET_FACEBOOK_ADS_LOADING:
            return state.set('loading', action.payload)
        case SET_FACEBOOK_ADS_INTERNALS:
            return state.set('internals', fromJS(action.payload))
        case ADD_LOADING_FACEBOOK_AD:
            return state.update('loadingAds', (ads: List<any>) =>
                ads.push(action.payload)
            )
        case REMOVE_LOADING_FACEBOOK_AD:
            return state.update('loadingAds', (ads: List<any>) =>
                ads.filter((ad) => ad !== action.payload)
            )
        case UPDATE_ACTIVE_FACEBOOK_AD:
            return state.setIn(
                getActivePath(
                    'ads',
                    action.payload as {integrationId: number; id: string}
                ),
                (action.payload as {isActive: boolean}).isActive
            )
        default:
            return state
    }
}
