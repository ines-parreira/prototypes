import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { Switch, useRouteMatch } from 'react-router'
import { Route } from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'

import BusinessHoursLegacy from './BusinessHoursLegacy'
import CustomBusinessHours from './CustomBusinessHours'
import DefaultBusinessHours from './DefaultBusinessHours'
import EditCustomBusinessHoursPage from './EditCustomBusinessHoursPage'

import settingsCss from '../settings.less'

export default function BusinessHoursPage() {
    const isCBHEnabled = useFlag(FeatureFlagKey.CustomBusinessHours)

    const { path } = useRouteMatch()

    if (!isCBHEnabled) {
        return <BusinessHoursLegacy />
    }

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                <div className="full-width">
                    <PageHeader title="Business hours" />
                    <div className={settingsCss.pageContainer}>
                        <DefaultBusinessHours />
                        <CustomBusinessHours />
                    </div>
                </div>
            </Route>
            <Route path={`${path}/:id`} exact>
                <EditCustomBusinessHoursPage />
            </Route>
        </Switch>
    )
}
