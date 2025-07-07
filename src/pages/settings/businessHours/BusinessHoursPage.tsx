import React from 'react'

import { Switch, useRouteMatch } from 'react-router'
import { Route } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import BusinessHours from './BusinessHours'
import CustomBusinessHours from './CustomBusinessHours'
import EditCustomBusinessHoursPage from './EditCustomBusinessHoursPage'

export default function BusinessHoursPage() {
    const isCBHEnabled = useFlag(FeatureFlagKey.CustomBusinessHours)

    const { path } = useRouteMatch()

    if (!isCBHEnabled) {
        return <BusinessHours />
    }

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <BusinessHours>
                    <CustomBusinessHours />
                </BusinessHours>
            </Route>
            <Route path={`${path}/:id`} exact>
                <EditCustomBusinessHoursPage />
            </Route>
        </Switch>
    )
}
