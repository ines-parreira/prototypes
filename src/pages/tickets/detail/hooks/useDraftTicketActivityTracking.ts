import {useEffect} from 'react'

import {
    ActivityEvents,
    logActivityEvent,
    registerActivityTrackerHooks,
} from 'services/activityTracker'

export default function useDraftTicketActivityTracking(
    draftTicketId: string | null
) {
    useEffect(() => {
        let unregisterBrowserHooks: (() => void) | undefined

        if (draftTicketId) {
            const eventProperties = {
                temporaryId: draftTicketId,
                entityType: 'ticket-draft',
            }

            logActivityEvent(
                ActivityEvents.UserStartedDraftingTicket,
                eventProperties
            )

            const registerHooks = async () => {
                unregisterBrowserHooks = await registerActivityTrackerHooks({
                    focusEvent: {
                        eventTrigger: ActivityEvents.UserStartedDraftingTicket,
                        properties: eventProperties,
                    },
                    blurEvent: {
                        eventTrigger: ActivityEvents.UserStoppedDraftingTicket,
                        properties: eventProperties,
                    },
                    terminationEvent: {
                        eventTrigger: ActivityEvents.UserStoppedDraftingTicket,
                        properties: eventProperties,
                    },
                })
            }

            void registerHooks()
        }

        return () => {
            if (draftTicketId) {
                logActivityEvent(ActivityEvents.UserStoppedDraftingTicket, {
                    temporaryId: draftTicketId,
                    entityType: 'ticket-draft',
                })

                unregisterBrowserHooks?.()
            }
        }
    }, [draftTicketId])
}
