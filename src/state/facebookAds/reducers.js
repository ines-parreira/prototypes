import type {Map} from 'immutable'
import {fromJS} from 'immutable'

import type {actionType} from '../types'

import {
    ADD_LOADING_FACEBOOK_AD,
    ADD_LOADING_FACEBOOK_AD_ACCOUNT,
    REMOVE_LOADING_FACEBOOK_AD,
    REMOVE_LOADING_FACEBOOK_AD_ACCOUNT,
    SET_FACEBOOK_ADS_INTERNALS, SET_FACEBOOK_ADS_LOADING,
    UPDATE_ACTIVE_FACEBOOK_AD,
    UPDATE_ACTIVE_FACEBOOK_AD_ACCOUNT,
} from './constants'

export const initialState = fromJS({
    loading: true,
    internals: {},
    loadingAds: [],
    loadingAdAccounts: []
})

const getActivePath = (key, {integrationId, id}) => ['internals', integrationId.toString(), key, id, 'is_active']

export default function reducer(state: Map<*, *> = initialState, action: actionType): Map<*, *> {
    switch (action.type) {
        case SET_FACEBOOK_ADS_LOADING:
            return state.set('loading', action.payload)
        case SET_FACEBOOK_ADS_INTERNALS:
            return state.set('internals', fromJS(action.payload))
        case ADD_LOADING_FACEBOOK_AD:
            return state.update('loadingAds', (ads) => ads.push(action.payload))
        case ADD_LOADING_FACEBOOK_AD_ACCOUNT:
            return state.update('loadingAdAccounts', (adAccounts) => adAccounts.push(action.payload))
        case REMOVE_LOADING_FACEBOOK_AD:
            return state.update('loadingAds', (ads) => ads.filter((ad) => ad !== action.payload))
        case REMOVE_LOADING_FACEBOOK_AD_ACCOUNT:
            return state.update('loadingAdAccounts', (adAccounts) => adAccounts.filter(
                (adAccount) => adAccount !== action.payload
            ))
        case UPDATE_ACTIVE_FACEBOOK_AD:
            return state.setIn(getActivePath('ads', action.payload), action.payload.isActive)
        case UPDATE_ACTIVE_FACEBOOK_AD_ACCOUNT:
            return state.setIn(getActivePath('ad_accounts', action.payload), action.payload.isActive)
        default:
            return state
    }
}
