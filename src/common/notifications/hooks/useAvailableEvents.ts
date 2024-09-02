import {useMemo} from 'react'

import {enabledEvents} from 'common/notifications/data'
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import type {Event} from 'common/notifications/types'

export default function useAvailableEvents() {
    const isTicketMessageCreatedEnabled = useFlag(
        FeatureFlagKey.NotificationsTicketMessageCreated,
        false
    )

    const availableEvents = useMemo(
        () =>
            enabledEvents.reduce((acc, event) => {
                if (
                    isTicketMessageCreatedEnabled &&
                    event.type === 'ticket-message.created'
                ) {
                    return acc
                }
                return [...acc, event]
            }, [] as Event[]),
        [isTicketMessageCreatedEnabled]
    )

    return useMemo(() => availableEvents, [availableEvents])
}
