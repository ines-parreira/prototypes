import type { EventTrigger } from '@gorgias/event-tracker-api'
import { Duration } from '@gorgias/toolkit'

export const AGENT_ACTIVITY_HEALTHCHECK_INTERVAL = Duration.minutes(5)

export const ActivityEvents: Record<string, EventTrigger> = {
    UserOpenedApp: {
        eventType: 'user.opened-app',
        version: '1.0.0',
        subject: 'user',
    },
    UserClosedApp: {
        eventType: 'user.closed-app',
        version: '1.0.0',
        subject: 'user',
    },
    UserIsActive: {
        eventType: 'user.is-active',
        version: '1.0.0',
        subject: 'user',
    },
    UserStartedDraftingTicket: {
        eventType: 'user.started-drafting-ticket',
        version: '1.0.0',
        subject: 'user',
    },
    UserStoppedDraftingTicket: {
        eventType: 'user.stopped-drafting-ticket',
        version: '1.0.0',
        subject: 'user',
    },
    UserCreatedTicket: {
        eventType: 'user.created-ticket',
        version: '1.0.0',
        subject: 'user',
    },
    UserStartedWorkingOnTicket: {
        eventType: 'user.started-working-on-ticket',
        version: '1.0.0',
        subject: 'user',
    },
    UserStoppedWorkingOnTicket: {
        eventType: 'user.stopped-working-on-ticket',
        version: '1.0.0',
        subject: 'user',
    },
    UserStartedPhoneCall: {
        eventType: 'user.started-phone-call',
        version: '1.0.0',
        subject: 'user',
    },
    UserFinishedPhoneCall: {
        eventType: 'user.finished-phone-call',
        version: '1.0.0',
        subject: 'user',
    },
}
