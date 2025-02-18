import React, {useCallback} from 'react'

import {AlertBanner, BannerCategory} from 'AlertBanners'

import {
    BannerActionTypes,
    useBannersDispatchContext,
} from 'AlertBanners/Context'
import {useDismissedStorage} from 'AlertBanners/Storage'

import {banner} from '../hooks/useDisplayAiAgentMovedBanner'

export function AiAgentMovedBanner() {
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

    const isDismissed = isBannerDismissed(banner.category, banner.instanceId)

    if (isDismissed) return null

    return (
        <AlertBanner
            {...banner}
            onClose={() => setDismissed(banner.category, banner.instanceId)}
        />
    )
}
