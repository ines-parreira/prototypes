import axios from 'axios'

import {notify} from '../../../../../../state/notifications/actions'
import {
    addFacebookAdsLoadingAd,
    removeFacebookAdsLoadingAd,
    setFacebookAdsInternals,
    setFacebookAdsLoading,
    updateFacebookAdsActiveAd
} from '../../../../../../state/facebookAds/actions'

export const fetchAds = () => async (dispatch) => {
    try {
        dispatch(setFacebookAdsLoading(true))
        const response = await axios.get('/integrations/facebook/fads/state/')
        dispatch(setFacebookAdsInternals(response.data))
    } catch (e) {
        dispatch(notify({
            status: 'error',
            title: e.message
        }))
    } finally {
        dispatch(setFacebookAdsLoading(false))
    }
}

export const updateAd = (integrationId: number, adId: string, isActive: boolean) => async (dispatch) => {
    try {
        dispatch(addFacebookAdsLoadingAd(adId))

        await axios.put('/integrations/facebook/fads/fad/activate/', {
            integration_id: integrationId,
            ad_id: adId,
            is_active: isActive
        })

        dispatch(updateFacebookAdsActiveAd(integrationId, adId, isActive))
    } catch (e) {
        dispatch(notify({
            status: 'error',
            title: e.message
        }))
    } finally {
        dispatch(removeFacebookAdsLoadingAd(adId))
    }
}
