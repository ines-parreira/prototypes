import React from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
import {usePersistedState} from 'common/hooks'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentUser} from 'state/currentUser/selectors'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import useAppSelector from 'hooks/useAppSelector'
import {getEmailIntegrations} from 'state/integrations/selectors'
import {
    isBaseEmailIntegration,
    isOutboundDomainVerified,
} from 'pages/integrations/integration/components/email/helpers'
import {isAdmin} from 'utils'

const BANNER_VISIBILITY_KEY = 'email-domain-verification-banner-visibility'

export default function EmailDomainVerificationBanner() {
    const [isBannerVisible, setIsBannerVisible] = usePersistedState<
        Maybe<boolean>
    >(BANNER_VISIBILITY_KEY, true)

    const emailIntegrations = useAppSelector(getEmailIntegrations)
    const currentUser = useAppSelector(getCurrentUser)
    const isUserAdmin = isAdmin(currentUser)

    const emailIntegrationsBaseExcluded = emailIntegrations.filter(
        (integration: Map<any, any>) =>
            !isBaseEmailIntegration(integration.toJS())
    )

    const allEmailIntegrationsHaveDomainVerified =
        emailIntegrationsBaseExcluded.every((integration: Map<any, any>) =>
            isOutboundDomainVerified(integration.toJS())
        )

    if (
        !isBannerVisible ||
        allEmailIntegrationsHaveDomainVerified ||
        !isUserAdmin
    ) {
        return null
    }

    const message = (
        <span data-testid="email-domain-verification-banner">
            As of February 1st, 2024, Gmail and Yahoo have stricter email
            sending rules. Some of your email addresses need to update their
            settings to comply.{' '}
            <Link to="/app/settings/channels/email">Verify them now.</Link>
        </span>
    )

    return (
        <BannerNotification
            message={message}
            status={NotificationStatus.Warning}
            id={'domain-verification-banner'}
            dismissible={false}
            closable={true}
            onClose={() => setIsBannerVisible(false)}
            allowHTML={true}
            showIcon={true}
        />
    )
}
