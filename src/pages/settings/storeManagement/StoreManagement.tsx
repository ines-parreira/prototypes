import React from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import PageHeader from 'pages/common/components/PageHeader'

const StoreManagement = () => {
    const isMultiStoreEnabled = useFlag(FeatureFlagKey.MultiStore, false)

    if (!isMultiStoreEnabled) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader title="Store Management" />
        </div>
    )
}

export default StoreManagement
