import {notify} from '../../../../../../state/notifications/actions'
import {
    addFacebookAdsLoadingAd,
    removeFacebookAdsLoadingAd,
    setFacebookAdsInternals,
    setFacebookAdsLoading,
    updateFacebookAdsActiveAd,
} from '../../../../../../state/facebookAds/actions'
import {StoreDispatch} from '../../../../../../state/types'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import client from '../../../../../../models/api/resources'

export const fetchAds = () => async (dispatch: StoreDispatch) => {
    try {
        dispatch(setFacebookAdsLoading(true))
        const response = await client.get('/integrations/facebook/fads/state/')
        dispatch(setFacebookAdsInternals(response.data))
    } catch (e) {
        void dispatch(
            notify({
                status: NotificationStatus.Error,
                title: (e as {message: string}).message,
            })
        )
    } finally {
        dispatch(setFacebookAdsLoading(false))
    }
}

export const updateAd = (
    integrationId: number,
    adId: string,
    isActive: boolean
) => async (dispatch: StoreDispatch) => {
    try {
        dispatch(addFacebookAdsLoadingAd(adId))

        await client.put('/integrations/facebook/fads/fad/activate/', {
            integration_id: integrationId,
            ad_id: adId,
            is_active: isActive,
        })

        dispatch(updateFacebookAdsActiveAd(integrationId, adId, isActive))
    } catch (e) {
        void dispatch(
            notify({
                status: NotificationStatus.Error,
                title: (e as {message: string}).message,
            })
        )
    } finally {
        dispatch(removeFacebookAdsLoadingAd(adId))
    }
}
