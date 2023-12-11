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
                <>
                    As of <strong>January 10, 2024</strong>, routing rules will
                    no longer be in use. Admins need to review and update their
                    Voice settings prior to the implementation of this
                    modification. Find additional information here.
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
            dismissible={true}
            allowHTML={true}
            showIcon={true}
        />
    )
}
