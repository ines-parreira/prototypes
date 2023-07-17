import React from 'react'
import {Link} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {FeatureFlagKey} from 'config/featureFlags'

type Props = {
    totalIntegrations: number
    maxIntegrations: number
}

export default function IntegrationListLimitAlert({
    totalIntegrations,
    maxIntegrations,
}: Props): JSX.Element | null {
    const isLimitAlmostReached =
        maxIntegrations > 1 && totalIntegrations === maxIntegrations - 1
    const isLimitReached = totalIntegrations >= maxIntegrations
    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

    if (!isLimitAlmostReached && !isLimitReached) {
        return null
    }

    const upgradePath = hasAccessToNewBilling
        ? '/app/settings/billing'
        : '/app/settings/billing/plans'

    return (
        <Alert
            type={isLimitAlmostReached ? AlertType.Warning : AlertType.Error}
            className="d-inline-flex"
            icon
        >
            <span className="d-flex align-items-center">
                You have reached {totalIntegrations}/{maxIntegrations}{' '}
                integrations. To add more, you must
                <Link to={upgradePath} className="ml-1 mr-1">
                    upgrade
                </Link>
                to a higher plan.
            </span>
        </Alert>
    )
}
