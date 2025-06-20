import React from 'react'

import { Link } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'

import { useStoreManagementState } from '../StoreManagementProvider'
import { StoreManagementTable } from '../storeManagementTable/storeManagementTable'

import css from './StoreManagementPage.less'

const StoreManagementPage = () => {
    const isMultiStoreEnabled = useFlag(FeatureFlagKey.MultiStore, false)

    const { filter, setFilter } = useStoreManagementState()

    if (!isMultiStoreEnabled) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader title="Store Management">
                <div className={css.headerActions}>
                    <Search
                        value={filter}
                        onChange={setFilter}
                        placeholder="Search by store"
                        searchDebounceTime={500}
                    />
                    <Link to={`/app/settings/integrations?category=Ecommerce`}>
                        <Button id="create-tag-button">Add new store</Button>
                    </Link>
                </div>
            </PageHeader>
            <StoreManagementTable />
        </div>
    )
}

export default StoreManagementPage
