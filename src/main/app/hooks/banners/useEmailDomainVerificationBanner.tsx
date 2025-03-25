import React, { useEffect, useMemo } from 'react'

import { Map } from 'immutable'
import { Link } from 'react-router-dom'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import {
    canIntegrationDomainBeVerified,
    isOutboundDomainVerified,
} from 'pages/integrations/integration/components/email/helpers'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getEmailIntegrations } from 'state/integrations/selectors'
import { isAdmin } from 'utils'

const INSTANCE_ID = 'email-domain-verification'
const banner: ContextBanner = {
    'aria-label': 'Email Domain Verification',
    category: BannerCategories.EMAIL_DOMAIN_VERIFICATION,
    type: AlertBannerTypes.Warning,
    instanceId: INSTANCE_ID,
    message: (
        <span>
            In order for your email messages to reach your audience’s inbox, you
            need to verify your domains.{' '}
            <Link to="/app/settings/channels/email">Click to verify.</Link>
        </span>
    ),
}

export const useEmailDomainVerificationBanner = () => {
    const bannerList: Record<string, boolean> = useFlag(
        FeatureFlagKey.GlobalBannerRefactor,
        {
            emailDomainVerificationBanner: false,
        },
    )

    const { addBanner, removeBanner } = useBanners()

    const emailIntegrations = useAppSelector(getEmailIntegrations)
    const currentUser = useAppSelector(getCurrentUser)
    const isUserAdmin = isAdmin(currentUser)

    const canIntegrationDomainBeVerifiedList = useMemo(() => {
        return emailIntegrations.filter((integration: Map<any, any>) =>
            canIntegrationDomainBeVerified(integration.toJS()),
        )
    }, [emailIntegrations])

    const allEmailIntegrationsHaveDomainVerified =
        canIntegrationDomainBeVerifiedList.every((integration: Map<any, any>) =>
            isOutboundDomainVerified(integration.toJS()),
        )

    const shouldNotShowBanner = useMemo(() => {
        return (
            !bannerList?.emailDomainVerificationBanner ||
            allEmailIntegrationsHaveDomainVerified ||
            !isUserAdmin
        )
    }, [
        bannerList?.emailDomainVerificationBanner,
        allEmailIntegrationsHaveDomainVerified,
        isUserAdmin,
    ])

    useEffect(() => {
        if (shouldNotShowBanner) {
            removeBanner(banner?.category, banner?.instanceId)
        } else {
            addBanner(banner)
        }
    }, [addBanner, removeBanner, shouldNotShowBanner])
}
