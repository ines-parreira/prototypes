import React from 'react'

import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'

import {useBannersContext} from '../ccontext'

import {AlertBanner} from './AlertBanner'

export default function AlertBanners() {
    const legacyBanners = useLegacyAlertBanners()
    const banners = useBannersContext()

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
