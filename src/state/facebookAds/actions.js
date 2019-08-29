import {
    ADD_LOADING_FACEBOOK_AD,
    ADD_LOADING_FACEBOOK_AD_ACCOUNT,
    REMOVE_LOADING_FACEBOOK_AD,
    REMOVE_LOADING_FACEBOOK_AD_ACCOUNT,
    SET_FACEBOOK_ADS_INTERNALS,
    SET_FACEBOOK_ADS_LOADING,
    UPDATE_ACTIVE_FACEBOOK_AD,
    UPDATE_ACTIVE_FACEBOOK_AD_ACCOUNT
} from './constants'
import type {Internals} from './types'

export const setFacebookAdsLoading = (loading: boolean) => ({
    type: SET_FACEBOOK_ADS_LOADING,
    payload: loading
})

export const setFacebookAdsInternals = (internals: Internals) => ({
    type: SET_FACEBOOK_ADS_INTERNALS,
    payload: internals
})

export const addFacebookAdsLoadingAccount = (adAccountId: string) => ({
    type: ADD_LOADING_FACEBOOK_AD_ACCOUNT,
    payload: adAccountId
})

export const addFacebookAdsLoadingAd = (adId: string) => ({
    type: ADD_LOADING_FACEBOOK_AD,
    payload: adId
})

export const removeFacebookAdsLoadingAccount = (adAccountId: string) => ({
    type: REMOVE_LOADING_FACEBOOK_AD_ACCOUNT,
    payload: adAccountId
})

export const removeFacebookAdsLoadingAd = (adId: string) => ({
    type: REMOVE_LOADING_FACEBOOK_AD,
    payload: adId
})

export const updateFacebookAdsActiveAccount = (integrationId: number, id: string, isActive: boolean) => ({
    type: UPDATE_ACTIVE_FACEBOOK_AD_ACCOUNT,
    payload: {integrationId, id, isActive}
})

export const updateFacebookAdsActiveAd = (integrationId: number, id: string, isActive: boolean) => ({
    type: UPDATE_ACTIVE_FACEBOOK_AD,
    payload: {integrationId, id, isActive}
})
