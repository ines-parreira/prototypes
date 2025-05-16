import React from 'react'

import { NavLink, Redirect, Route, Switch, useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import ChannelsTab from './Channels/ChannelsTab'

export default function StoreDetailsPage() {
    const isMultiStoreEnabled = useFlag(FeatureFlagKey.MultiStore, false)
    const { id } = useParams<{ id: string }>()

    if (!isMultiStoreEnabled) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader title="Store Details" />
            <SecondaryNavbar>
                <NavLink
                    to={`/app/settings/store-management/${id}/channels`}
                    exact
                >
                    Channels
                </NavLink>
            </SecondaryNavbar>
            <Switch>
                <Route path={`/app/settings/store-management/:id/channels`}>
                    <ChannelsTab />
                </Route>
                <Route path={`/app/settings/store-management/:id/`}>
                    <Redirect
                        to={`/app/settings/store-management/${id}/channels`}
                    />
                </Route>
            </Switch>
        </div>
    )
}
