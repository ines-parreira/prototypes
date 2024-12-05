import React from 'react'

import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'

import {useBannerContext} from '../context/BannerContext'

import {AlertBanner} from './AlertBanner'

export default function AlertBanners() {
    const legacyBanners = useLegacyAlertBanners()
    const banners = useBannerContext()

    return (
        <div>
            {banners.map((banner) => (
                <AlertBanner key={banner.instanceId} {...banner} />
            ))}
            {legacyBanners.map((banner) => (
                <AlertBanner key={banner.id} {...banner} />
            ))}
        </div>
    )
}
