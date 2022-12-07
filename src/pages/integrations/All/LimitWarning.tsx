import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    getCurrentHelpdeskMaxIntegrations,
    getCurrentHelpdeskName,
} from 'state/billing/selectors'
import {getActiveIntegrations} from 'state/integrations/selectors'
import {AlertType} from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'

export default function LimitWarning({className}: {className?: string}) {
    const helpdeskName = useAppSelector(getCurrentHelpdeskName)
    const activeIntegrationsNumber = useAppSelector(getActiveIntegrations).size
    const maxIntegrations = useAppSelector(getCurrentHelpdeskMaxIntegrations)

    const remainingIntegrations = maxIntegrations - activeIntegrationsNumber
    const plural = activeIntegrationsNumber > 1

    if (remainingIntegrations > 3) {
        return null
    }

    return (
        <LinkAlert
            type={
                remainingIntegrations > 0 ? AlertType.Warning : AlertType.Error
            }
            icon
            actionLabel="Upgrade your plan"
            actionHref={'/app/settings/billing'}
            className={className}
        >
            {remainingIntegrations > 0 ? (
                <span>
                    You are using{' '}
                    <strong>
                        {activeIntegrationsNumber}{' '}
                        {plural ? 'integrations' : 'integration'} of{' '}
                        {maxIntegrations}
                    </strong>{' '}
                    allowed on your <strong>{helpdeskName} plan.</strong> Need
                    more?
                </span>
            ) : (
                <span>
                    <strong>
                        Your account has reached the integration limit.{' '}
                    </strong>
                    Need more?
                </span>
            )}
        </LinkAlert>
    )
}
