import React from 'react'
import {Link} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

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

    if (!isLimitAlmostReached && !isLimitReached) {
        return null
    }

    return (
        <Alert
            type={isLimitAlmostReached ? AlertType.Warning : AlertType.Error}
            className="d-inline-flex"
            icon
        >
            <span className="d-flex align-items-center">
                You have reached {totalIntegrations}/{maxIntegrations}{' '}
                integrations. To add more, you must
                <Link to="/app/settings/billing/plans" className="ml-1 mr-1">
                    upgrade
                </Link>
                to a higher plan.
            </span>
        </Alert>
    )
}
