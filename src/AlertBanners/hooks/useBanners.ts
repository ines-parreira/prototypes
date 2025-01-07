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

    const dismissBanner = useCallback(
        (category: BannerCategory, instanceId: string) => {
            setDismissed(category, instanceId)
            bannerDispatch({
                type: BannerActionTypes.REMOVE_BANNER,
                category,
                instanceId,
            })
        },
        [setDismissed, bannerDispatch]
    )

    const dispatchAddAndHandleDismiss = useCallback(
        (payload: ContextBanner) => {
            const onClose = payload.preventDismiss
                ? payload.onClose
                : () => {
                      dismissBanner(payload.category, payload.instanceId)
                      payload.onClose?.()
                  }
            bannerDispatch({
                type: BannerActionTypes.ADD,
                payload: {...payload, onClose},
            })
        },
        [bannerDispatch, dismissBanner]
    )

    return useMemo(
        () => ({
            addBanner: (payload: ContextBanner) => {
                if (!isBannerDismissed(payload.category, payload.instanceId)) {
                    dispatchAddAndHandleDismiss(payload)
                }
            },
            forceAddBanner: (payload: ContextBanner) => {
                dispatchAddAndHandleDismiss(payload)
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
            dismissBanner,
        }),
        [
            isBannerDismissed,
            dispatchAddAndHandleDismiss,
            bannerDispatch,
            dismissBanner,
        ]
    )
}
