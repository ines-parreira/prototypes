import React from 'react'

import LegacyBannerNotifications from 'pages/common/components/BannerNotifications/BannerNotifications'

import useBannerNotifications from '../hooks/useBannerNotifications'

export default function BannerNotifications() {
    const notifications = useBannerNotifications()

    return <LegacyBannerNotifications notifications={notifications} />
}
