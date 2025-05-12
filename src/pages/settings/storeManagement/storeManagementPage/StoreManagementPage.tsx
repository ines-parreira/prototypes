import React from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import PageHeader from 'pages/common/components/PageHeader'

import { StoreManagementTable } from '../storeManagementTable/storeManagementTable'

const StoreManagementPage = () => {
    const isMultiStoreEnabled = useFlag(FeatureFlagKey.MultiStore, false)

    if (!isMultiStoreEnabled) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader title="Store Management" />
            <StoreManagementTable />
        </div>
    )
}

export default StoreManagementPage
