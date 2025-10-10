import React from 'react'

import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'

import NoStoresPage from '../noStoresPage/NoStoresPage'
import { useStoreManagementState } from '../StoreManagementProvider'
import { StoreManagementTable } from '../storeManagementTable/storeManagementTable'

import css from './StoreManagementPage.less'

const StoreManagementPage = () => {
    const { filter, setFilter, stores, isLoading } = useStoreManagementState()

    if (!isLoading && stores.length === 0) {
        return <NoStoresPage />
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
