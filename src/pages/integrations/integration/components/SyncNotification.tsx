import React from 'react'

import {useLocalStorage} from 'react-use'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

type SyncNotificationProps = {
    platform: string
    shopName: string
    isSyncComplete: boolean
}

const SyncNotification = ({
    platform,
    shopName,
    isSyncComplete,
}: SyncNotificationProps) => {
    const [isAlertClosed, setAlertClosed] = useLocalStorage(
        `${platform}_${shopName}_sync_notification`,
        false
    )

    if (!isSyncComplete) {
        return (
            <Alert className="mb-4" type={AlertType.Loading} icon>
                Import in progress. We typically sync 3,000 customers an hour.
                We will send you an email once it is done. Feel free to leave
                this page.
            </Alert>
        )
    }

    if (isAlertClosed) {
        return null
    }

    return (
        <LinkAlert
            className="mb-4"
            actionLabel="View Customers"
            actionHref="/app/customers"
            type={AlertType.Success}
            icon
            onClose={() => setAlertClosed(true)}
        >
            Import complete. The real-time sync with {platform} is active.
        </LinkAlert>
    )
}

export default SyncNotification
