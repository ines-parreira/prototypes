import {useMemo} from 'react'

import {enabledEvents} from 'common/notifications/data'
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import type {Event} from 'common/notifications/types'

export default function useAvailableEvents() {
    const isTicketAssignedEnabled = useFlag(
        FeatureFlagKey.NotificationsTicketAssigned,
        false
    )

    const availableEvents = useMemo(
        () =>
            enabledEvents.reduce((acc, event) => {
                if (
                    !isTicketAssignedEnabled &&
                    event.type === 'ticket.assigned'
                ) {
                    return acc
                }
                return [...acc, event]
            }, [] as Event[]),
        [isTicketAssignedEnabled]
    )

    return useMemo(() => availableEvents, [availableEvents])
}
