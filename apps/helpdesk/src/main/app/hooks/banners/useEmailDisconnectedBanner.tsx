import React, { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'
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
    const { addBanner, removeBanner } = useBanners()
    const [__, setBannerState] = useState(new Array<string>())

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

    const banners = useMemo(() => {
        if (!isBannerEnabled) {
            return []
        }
        return deactivatedOAuthEmailIntegrations.map((integration) =>
            getBanner(
                isForAdminUser,
                integration.address,
                integration.reconnectUrl,
            ),
        )
    }, [isForAdminUser, isBannerEnabled, deactivatedOAuthEmailIntegrations])

    useEffect(() => {
        setBannerState((prevBannerState) => {
            const newBannerState = banners.map((banner) => banner.instanceId)
            // remove banners that do not exist anymore
            prevBannerState
                .filter((id) => !newBannerState.includes(id))
                .forEach((id) => removeBanner(defaultBannerProps.category, id))
            // add new banners
            banners
                .filter(
                    (banner) => !prevBannerState.includes(banner.instanceId),
                )
                .forEach(addBanner)
            // update banners state
            return newBannerState
        })
    }, [addBanner, removeBanner, banners])
}
