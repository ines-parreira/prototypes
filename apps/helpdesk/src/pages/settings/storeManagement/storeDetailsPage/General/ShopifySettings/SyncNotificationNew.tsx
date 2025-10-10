import React from 'react'

import { useLocalStorage } from '@repo/hooks'
import { Link } from 'react-router-dom'

import { Banner, LegacyButton as Button, LoadingSpinner } from '@gorgias/axiom'

type SyncNotificationProps = {
    platform: string
    shopName: string
    isSyncComplete: boolean
    isActive: boolean
}

const SyncNotification = ({
    isActive,
    platform,
    shopName,
    isSyncComplete,
}: SyncNotificationProps) => {
    const [isBannerClosed, setBannerClosed] = useLocalStorage(
        `${platform}_${shopName}_sync_notification`,
        false,
    )

    if (!isActive) {
        return (
            <Banner type="warning" fillStyle="fill">
                Your store is disconnected. Please reconnect your store to keep
                syncing data with Gorgias.
            </Banner>
        )
    }

    if (!isSyncComplete) {
        return (
            <Banner
                icon={<LoadingSpinner color="dark" size="small" />}
                type="info"
                fillStyle="fill"
            >
                Import in progress. We typically sync 3,000 customers an hour.
                We will send you an email once it is done. Feel free to leave
                this page.
            </Banner>
        )
    }

    if (isBannerClosed) {
        return null
    }

    return (
        <div>
            <Banner
                action={
                    <Link to="/app/customers">
                        <Button fillStyle="ghost" intent="primary">
                            View Customers
                        </Button>
                    </Link>
                }
                fillStyle="fill"
                type="success"
                onClose={() => setBannerClosed(true)}
            >
                Import complete. The real-time sync is active.
            </Banner>
        </div>
    )
}

export default SyncNotification
