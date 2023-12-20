import React from 'react'
import {useRouteMatch} from 'react-router-dom'
import {NotificationStatus} from 'state/notifications/types'
import useAppSelector from 'hooks/useAppSelector'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {usePersistedState} from 'common/hooks'
import BannerNotification from '../BannerNotifications/BannerNotification'

const BANNER_VISIBILITY_KEY = 'routing-rule-decomission-banner-visibility'

export default function RoutingRuleDecomissionBanner() {
    const [isBannerVisible, setIsBannerVisible] = usePersistedState<
        Maybe<boolean>
    >(BANNER_VISIBILITY_KEY, true)

    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const isVoiceSettingsPage = useRouteMatch({
        path: ['/app/settings/channels/phone/:id/preferences'],
        exact: true,
    })

    if (!phoneIntegrations?.length || isVoiceSettingsPage || !isBannerVisible) {
        return null
    }

    return (
        <BannerNotification
            message={
                <>
                    We’re introducing a new setting to easily route Voice calls.
                    By <strong>January 10, 2024</strong>, please confirm your
                    settings.
                </>
            }
            actionHTML={
                <a
                    href="https://docs.gorgias.com/en-US/370054-11e7796251594519a1716d29f34d54f2"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn more
                </a>
            }
            status={NotificationStatus.Error}
            id="routing-rule-decomission"
            closable
            onClose={() => setIsBannerVisible(false)}
            allowHTML
            showIcon
        />
    )
}
