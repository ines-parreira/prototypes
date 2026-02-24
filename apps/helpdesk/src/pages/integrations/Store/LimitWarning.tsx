import useAppSelector from 'hooks/useAppSelector'
import { AlertType } from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {
    getCurrentHelpdeskMaxIntegrations,
    getCurrentHelpdeskPlanName,
} from 'state/billing/selectors'
import { getCurrentSubscription } from 'state/currentAccount/selectors'
import { getActiveIntegrations } from 'state/integrations/selectors'

export default function LimitWarning({ className }: { className?: string }) {
    const helpdeskName = useAppSelector(getCurrentHelpdeskPlanName)
    const activeIntegrationsNumber = useAppSelector(getActiveIntegrations).size
    const maxIntegrations = useAppSelector(getCurrentHelpdeskMaxIntegrations)

    const remainingIntegrations = maxIntegrations - activeIntegrationsNumber
    const plural = activeIntegrationsNumber > 1
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isCurrentSubscriptionCanceled = currentSubscription.isEmpty()

    if (remainingIntegrations > 3) {
        return null
    }

    return (
        <LinkAlert
            type={
                remainingIntegrations > 0 ? AlertType.Warning : AlertType.Error
            }
            icon
            actionLabel={
                isCurrentSubscriptionCanceled
                    ? 'Go to billing settings'
                    : 'Upgrade your plan'
            }
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
            ) : isCurrentSubscriptionCanceled ? (
                <span>
                    <strong>
                        Your account has reached the integration limit.{' '}
                    </strong>
                    Need more?
                </span>
            ) : (
                <span>
                    <strong>
                        Your account has expired. Please resubscribe to continue
                        using integrations.
                    </strong>
                </span>
            )}
        </LinkAlert>
    )
}
