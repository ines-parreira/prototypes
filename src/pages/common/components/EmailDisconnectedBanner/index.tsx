import {List} from 'immutable'
import React from 'react'
import {useHistory, useLocation} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getInactiveEmailChannels} from 'state/integrations/selectors'
import {NotificationStatus} from 'state/notifications/types'

import BannerNotification from '../BannerNotifications/BannerNotification'

export default function EmailDisconnectedBanner() {
    const state: List<Map<string, any>> = useAppSelector(
        getInactiveEmailChannels
    )
    const history = useHistory()
    const location = useLocation()

    const reconnectPageURL = `/app/settings/channels/email`

    const shouldHideBanner =
        state.isEmpty() || location.pathname.startsWith(reconnectPageURL)

    if (shouldHideBanner) {
        return null
    }
    const email = state.first().get('address')

    const reconnect = (
        <span className="d-inline-flex align-items-baseline">
            <span className="text-primary">Reconnect</span>
        </span>
    )
    const message = (
        <>
            <strong>{email}</strong> may be disconnected. If you’re having
            trouble sending emails, reconnect it to fix the issue.
        </>
    )

    return (
        <BannerNotification
            message={message}
            actionHTML={reconnect}
            status={NotificationStatus.Error}
            id={'disconnection-status'}
            dismissible={false}
            allowHTML={true}
            showIcon={true}
            onClick={() => {
                history.push(reconnectPageURL)
            }}
        />
    )
}
