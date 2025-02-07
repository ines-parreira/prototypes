import {List} from 'immutable'

import React from 'react'
import {useHistory, useLocation} from 'react-router-dom'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import {getInactiveEmailChannels} from 'state/integrations/selectors'

export const useEmailDisconnectedBanner = () => {
    const {addBanner, removeBanner} = useBanners()

    const bannerList: Record<string, boolean> = useFlag(
        FeatureFlagKey.GlobalBannerRefactor,
        {
            emailDisconnectedBanner: false,
        }
    )

    const state: List<Map<string, any>> = useAppSelector(
        getInactiveEmailChannels
    )
    const history = useHistory()
    const location = useLocation()

    const reconnectPageURL = `/app/settings/channels/email`

    const shouldHideBanner =
        !bannerList?.emailDisconnectedBanner ||
        state.isEmpty() ||
        location.pathname.startsWith(reconnectPageURL)

    if (shouldHideBanner) {
        removeBanner(
            BannerCategories.EMAIL_DISCONNECTED,
            'email-disconnected-banner'
        )
        return null
    }

    const email = state?.first()?.get('address')

    const banner: ContextBanner = {
        'aria-label': 'Email Disconnect Banner',
        category: BannerCategories.EMAIL_DISCONNECTED,
        type: AlertBannerTypes.Warning,
        instanceId: 'email-disconnected-banner',
        preventDismiss: true,
        message: (
            <>
                <strong>{email}</strong> may be disconnected. If you’re having
                trouble sending emails, reconnect it to fix the issue.
            </>
        ),
        CTA: {
            type: 'action',
            text: 'Reconnect',
            onClick: () => {
                history.push(reconnectPageURL)
            },
        },
    }

    addBanner(banner)
}
