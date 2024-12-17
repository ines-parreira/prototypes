import {useCallback, useMemo} from 'react'

import {useBannersDispatchContext, BannerActionTypes} from '../Context'
import {useDismissedStorage} from '../Storage'

import {BannerCategory, ContextBanner} from '../types'

export function useBanners() {
    const bannerDispatch = useBannersDispatchContext()

    const updateCurrentTabState = useCallback(
        (category: BannerCategory, instanceId: string) => {
            bannerDispatch({
                type: BannerActionTypes.REMOVE_BANNER,
                category,
                instanceId,
            })
        },
        [bannerDispatch]
    )

    const {setDismissed, isBannerDismissed} = useDismissedStorage(
        updateCurrentTabState
    )

    return useMemo(
        () => ({
            addBanner: (payload: ContextBanner) => {
                if (!isBannerDismissed(payload.category, payload.instanceId)) {
                    bannerDispatch({type: BannerActionTypes.ADD, payload})
                }
            },
            forceAddBanner: (payload: ContextBanner) => {
                bannerDispatch({type: BannerActionTypes.ADD, payload})
            },
            removeCategory: (category: BannerCategory) => {
                bannerDispatch({
                    type: BannerActionTypes.REMOVE_CATEGORY,
                    category,
                })
            },
            removeBanner: (category: BannerCategory, instanceId: string) => {
                bannerDispatch({
                    type: BannerActionTypes.REMOVE_BANNER,
                    category,
                    instanceId,
                })
            },
            dismissBanner: (category: BannerCategory, instanceId: string) => {
                setDismissed(category, instanceId)
                bannerDispatch({
                    type: BannerActionTypes.REMOVE_BANNER,
                    category,
                    instanceId,
                })
            },
        }),
        [bannerDispatch, setDismissed, isBannerDismissed]
    )
}
