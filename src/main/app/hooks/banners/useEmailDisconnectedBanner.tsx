import React, { useEffect, useMemo } from 'react'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getDeactivatedOAuthEmailIntegrations } from 'state/integrations/selectors'

const defaultBannerProps = {
    'aria-label': 'Email Disconnect Banner',
    category: BannerCategories.EMAIL_DISCONNECTED,
    preventDismiss: true,
}

function getBanner(
    isForAdminUser: boolean,
    integrationAddress: string,
    integrationReconnectUrl: string,
): ContextBanner {
    const [message, alertBannerType, cta] = isForAdminUser
        ? [
              <React.Fragment key={`${integrationAddress}-admin-message`}>
                  Your email account {integrationAddress} is disconnected.
                  Follow the steps in the reconnection email to restore email
                  access.
              </React.Fragment>,
              AlertBannerTypes.Error,
              {
                  type: 'external' as const,
                  text: 'Reconnect Now',
                  opensInNewTab: true,
                  href: integrationReconnectUrl,
              },
          ]
        : [
              <React.Fragment key={`${integrationAddress}-user-message`}>
                  The email account {integrationAddress} is disconnected. Only
                  the Account Owner or an Admin can reconnect it. Please contact
                  them for assistance.
              </React.Fragment>,
              AlertBannerTypes.Warning,
          ]

    return {
        ...defaultBannerProps,
        instanceId: `email-disconnected-banner-${integrationAddress}`,
        type: alertBannerType,
        message,
        CTA: cta,
    }
}

export const useEmailDisconnectedBanner = () => {
    const { addBanner, removeCategory } = useBanners()

    const bannerList = useFlag(FeatureFlagKey.GlobalBannerRefactor, {
        emailDisconnectedBanner: false,
    })
    const isBannerEnabled = !!bannerList?.emailDisconnectedBanner

    const currentUser = useAppSelector(getCurrentUser)
    const isForAdminUser =
        currentUser.getIn(['role', 'name']) === UserRole.Admin

    const deactivatedOAuthEmailIntegrations = useAppSelector(
        getDeactivatedOAuthEmailIntegrations,
    )

    const banners = useMemo(
        () =>
            deactivatedOAuthEmailIntegrations.map((integration) =>
                getBanner(
                    isForAdminUser,
                    integration.address,
                    integration.reconnectUrl,
                ),
            ),
        [isForAdminUser, deactivatedOAuthEmailIntegrations],
    )

    useEffect(() => {
        removeCategory(defaultBannerProps.category)
        if (isBannerEnabled) {
            banners.forEach(addBanner)
        }
    }, [addBanner, removeCategory, isBannerEnabled, banners])
}
