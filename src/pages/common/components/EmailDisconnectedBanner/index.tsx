import {List} from 'immutable'
import React from 'react'
import {useHistory, useLocation} from 'react-router-dom'

import {AlertBanner, AlertBannerTypes} from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import {getInactiveEmailChannels} from 'state/integrations/selectors'

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

    const message = (
        <>
            <strong>{email}</strong> may be disconnected. If you’re having
            trouble sending emails, reconnect it to fix the issue.
        </>
    )

    return (
        <AlertBanner
            message={message}
            CTA={{
                type: 'action',
                text: 'Reconnect',
                onClick: () => {
                    history.push(reconnectPageURL)
                },
            }}
            type={AlertBannerTypes.Warning}
        />
    )
}
