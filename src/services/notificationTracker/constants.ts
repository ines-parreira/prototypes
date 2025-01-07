import {EventTrigger} from '@gorgias/event-tracker-api'

export const NotificationEvent: EventTrigger = {
    eventType: 'command.process',
    version: '1.0.0',
    subject: 'notification',
}
