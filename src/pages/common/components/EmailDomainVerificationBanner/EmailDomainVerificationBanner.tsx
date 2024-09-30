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
        <span>
            In order for your email messages to reach your audience’s inbox, you
            need to verify your domains.{' '}
            <Link to="/app/settings/channels/email">Click to verify.</Link>
        </span>
    )

    return (
        <BannerNotification
            aria-label="Email domain verification"
            message={message}
            status={NotificationStatus.Warning}
            id="domain-verification-banner"
            dismissible={false}
            closable={true}
            onClose={() => setIsBannerVisible(false)}
            showIcon={true}
        />
    )
}
