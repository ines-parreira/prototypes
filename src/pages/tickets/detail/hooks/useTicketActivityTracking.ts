import {useEffect} from 'react'

import {ActivityEvents, logActivityEvent} from 'services/activityTracker'

export function useTicketActivityTracking(ticketId: number | undefined) {
    useEffect(() => {
        if (!!ticketId) {
            logActivityEvent(ActivityEvents.UserStartedWorkingOnTicket, {
                entityId: ticketId,
                entityType: 'ticket',
            })
        }

        return () => {
            if (!!ticketId) {
                logActivityEvent(ActivityEvents.UserStoppedWorkingOnTicket, {
                    entityId: ticketId,
                    entityType: 'ticket',
                })
            }
        }
    }, [ticketId])
}
