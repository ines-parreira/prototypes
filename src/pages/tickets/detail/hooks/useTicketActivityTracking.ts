import {useEffect} from 'react'

import {
    ActivityEvents,
    logActivityEvent,
    registerActivityTrackerHooks,
} from 'services/activityTracker'

export default function useTicketActivityTracking(ticketId?: number) {
    useEffect(() => {
        let unregisterBrowserHooks: (() => void) | undefined

        if (!!ticketId) {
            const eventProperties = {
                entityId: ticketId,
                entityType: 'ticket',
            }

            logActivityEvent(
                ActivityEvents.UserStartedWorkingOnTicket,
                eventProperties
            )
            const registerHooks = async () => {
                unregisterBrowserHooks = await registerActivityTrackerHooks({
                    focusEvent: {
                        eventTrigger: ActivityEvents.UserStartedWorkingOnTicket,
                        properties: eventProperties,
                    },
                    blurEvent: {
                        eventTrigger: ActivityEvents.UserStoppedWorkingOnTicket,
                        properties: eventProperties,
                    },
                    terminationEvent: {
                        eventTrigger: ActivityEvents.UserStoppedWorkingOnTicket,
                        properties: eventProperties,
                    },
                })
            }

            void registerHooks()
        }

        return () => {
            if (!!ticketId) {
                logActivityEvent(ActivityEvents.UserStoppedWorkingOnTicket, {
                    entityId: ticketId,
                    entityType: 'ticket',
                })

                unregisterBrowserHooks?.()
            }
        }
    }, [ticketId])
}
