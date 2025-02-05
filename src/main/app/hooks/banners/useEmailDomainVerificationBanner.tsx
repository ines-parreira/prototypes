import {Map} from 'immutable'
import React from 'react'
import {Link} from 'react-router-dom'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import {
    isBaseEmailIntegration,
    isOutboundDomainVerified,
} from 'pages/integrations/integration/components/email/helpers'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getEmailIntegrations} from 'state/integrations/selectors'
import {isAdmin} from 'utils'

export const useEmailDomainVerificationBanner = () => {
    const bannerList: Record<string, boolean> = useFlag(
        FeatureFlagKey.GlobalBannerRefactor,
        {
            emailDomainVerificationBanner: false,
        }
    )

    const {addBanner} = useBanners()

    const INSTANCE_ID = 'email-domain-verification'

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

    const banner: ContextBanner = {
        'aria-label': 'Email Domain Verification',
        category: BannerCategories.EMAIL_DOMAIN_VERIFICATION,
        type: AlertBannerTypes.Warning,
        instanceId: INSTANCE_ID,
        message: (
            <span>
                In order for your email messages to reach your audience’s inbox,
                you need to verify your domains.{' '}
                <Link to="/app/settings/channels/email">Click to verify.</Link>
            </span>
        ),
    }

    if (
        !bannerList?.emailDomainVerificationBanner ||
        allEmailIntegrationsHaveDomainVerified ||
        !isUserAdmin
    ) {
        return null
    }

    addBanner(banner)
}
