import {
    mentionNotification,
    notification,
} from 'common/notifications/fixtures/fixtures'

import getNotificationSound from '../getNotificationSound'

describe('getNotificationSound', () => {
    it('should return default sound when sound is not defined', () => {
        const eventSettings = {}
        expect(getNotificationSound(notification, eventSettings)).toBe(
            'default'
        )
    })

    it('should return sound when sound is defined in settings', () => {
        const eventSettings = {
            'user.mentioned': {
                sound: 'juntos' as const,
            },
        }
        expect(getNotificationSound(mentionNotification, eventSettings)).toBe(
            'juntos'
        )
    })

    it('should return sound when notification is of ticket-message.created type, and lookup depending on the ticket channel', () => {
        const eventSettings = {
            'ticket-message.created.email': {
                sound: 'definite' as const,
            },
        }
        expect(getNotificationSound(notification, eventSettings)).toBe(
            'definite'
        )
    })
})
