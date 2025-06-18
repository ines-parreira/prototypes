import React from 'react'

import { NavLink, Redirect, Route, Switch, useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { StoreIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import ChannelsTab from './Channels/ChannelsTab'
import General from './General/General'
import useStoreGetter from './General/hooks/useStoreGetter'

export default function StoreDetailsPage() {
    const isMultiStoreEnabled = useFlag(FeatureFlagKey.MultiStore, false)
    const { id } = useParams<{ id: string }>()

    const { isFetching, data, refetchStore } = useStoreGetter(Number(id))

    if (!isMultiStoreEnabled) {
        return null
    }

    if (isFetching) {
        return <Loader role="status" />
    }

    return (
        <div className="full-width">
            <PageHeader title="Store Details" />
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
                    <ChannelsTab storeId={id} />
                </Route>
                <Route path={`/app/settings/store-management/:id/settings`}>
                    {data?.data && (
                        <General
                            refetchStore={refetchStore}
                            store={data?.data as unknown as StoreIntegration}
                        />
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
