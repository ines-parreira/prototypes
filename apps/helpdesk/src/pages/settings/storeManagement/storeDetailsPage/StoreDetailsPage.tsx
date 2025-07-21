import React from 'react'

import {
    Link,
    NavLink,
    Redirect,
    Route,
    Switch,
    useParams,
} from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { StoreIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import { useStoreManagementState } from '../StoreManagementProvider'
import ChannelsTab from './Channels/ChannelsTab'
import General from './General/General'
import useStoreGetter from './General/hooks/useStoreGetter'
import StoreManagementStoreSelector from './StoreManagmentStoreSelector'

import css from './StoreDetailsPage.less'

export default function StoreDetailsPage() {
    const { id } = useParams<{ id: string }>()

    const {
        isFetching: isFetchingStore,
        data,
        refetchStore,
    } = useStoreGetter(Number(id))
    const { isLoading: isFetchingStoresWithMaps } = useStoreManagementState()

    const isFetching = isFetchingStore || isFetchingStoresWithMaps

    const store = data?.data as unknown as StoreIntegration

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/store-management">
                                Store Management
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>{store?.name}</BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <StoreManagementStoreSelector />
            </PageHeader>
            <SecondaryNavbar>
                <NavLink
                    to={`/app/settings/store-management/${id}/settings`}
                    exact
                >
                    General
                </NavLink>
                <NavLink
                    to={`/app/settings/store-management/${id}/channels`}
                    exact
                >
                    Channels
                </NavLink>
            </SecondaryNavbar>
            <Switch>
                <Route path={`/app/settings/store-management/:id/channels`}>
                    {isFetching ? (
                        <section className={css.detailsContainer}>
                            <Loader role="status" />
                        </section>
                    ) : (
                        <ChannelsTab storeId={id} />
                    )}
                </Route>
                <Route path={`/app/settings/store-management/:id/settings`}>
                    {isFetching ? (
                        <section className={css.detailsContainer}>
                            <Loader role="status" />
                        </section>
                    ) : (
                        data?.data && (
                            <General
                                refetchStore={refetchStore}
                                store={
                                    data?.data as unknown as StoreIntegration
                                }
                            />
                        )
                    )}
                </Route>
                <Route path={`/app/settings/store-management/:id/`}>
                    <Redirect
                        to={`/app/settings/store-management/${id}/settings`}
                    />
                </Route>
            </Switch>
        </div>
    )
}
