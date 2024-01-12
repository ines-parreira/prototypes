import React from 'react'
import {useRouteMatch} from 'react-router-dom'
import {NotificationStatus} from 'state/notifications/types'
import useAppSelector from 'hooks/useAppSelector'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import BannerNotification from '../BannerNotifications/BannerNotification'

export default function RoutingRuleDecomissionBanner() {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const isVoiceSettingsPage = useRouteMatch({
        path: ['/app/settings/channels/phone/:id/preferences'],
        exact: true,
    })

    if (!phoneIntegrations?.length || isVoiceSettingsPage) {
        return null
    }

    return (
        <BannerNotification
            message={
                <div data-testid="routing-rule-banner-message">
                    On <strong>January 17th</strong>, we will be introducing our{' '}
                    <a
                        href="https://docs.gorgias.com/en-US/voice-routing-370054"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        new routing settings
                    </a>{' '}
                    to improve the stability our voice service. Please confirm
                    your new voice integration settings are correct or{' '}
                    <strong>
                        you risk a disruption to your routing service
                    </strong>
                    .
                </div>
            }
            status={NotificationStatus.Error}
            id="routing-rule-decomission"
            allowHTML
            showIcon
        />
    )
}
