import React from 'react'
import {Alert} from 'reactstrap'
import {Link} from 'react-router-dom'

type Props = {
    totalIntegrations: number
    maxIntegrations: number
}

export default function PhoneIntegrationListAlert({
    totalIntegrations,
    maxIntegrations,
}: Props): JSX.Element | null {
    const isLimitAlmostReached = totalIntegrations === maxIntegrations - 1
    const isLimitReached = totalIntegrations >= maxIntegrations

    if (!isLimitAlmostReached && !isLimitReached) {
        return null
    }

    return (
        <Alert
            color={isLimitAlmostReached ? 'warning' : 'danger'}
            className="d-inline-flex"
        >
            <span className="d-flex align-items-center">
                <i className="material-icons mr-2">info</i>
                You have reached {totalIntegrations}/{maxIntegrations} numbers.
                To add more, you must
                <Link to="/app/settings/billing/plans" className="ml-1 mr-1">
                    upgrade
                </Link>
                to a higher plan.
            </span>
        </Alert>
    )
}
