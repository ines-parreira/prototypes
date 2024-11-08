import {registerCategory, registerNotification} from 'common/notifications'

jest.mock('common/notifications', () => ({
    registerCategory: jest.fn(),
    registerNotification: jest.fn(),
}))

describe('init', () => {
    it('should register categories and notifications', () => {
        require('../init')

        const categories = ['ticket-updates', 'ticket-message-created']
        categories.forEach((categoryType) => {
            expect(registerCategory).toHaveBeenCalledWith(
                expect.objectContaining({type: categoryType})
            )
        })

        const notifications = [
            'legacy-chat-and-messaging',
            'user.mentioned',
            'ticket.snooze-expired',
            'ticket.assigned',
            'ticket-message.created.email',
            'ticket-message.created.chat',
            'ticket-message.created.phone',
            'ticket-message.created.sms',
            'ticket-message.created.facebook',
            'ticket-message.created.instagram',
            'ticket-message.created.whatsapp',
            'ticket-message.created.yotpo',
            'ticket-message.created.aircall',
            'ticket-message.created',
        ]
        notifications.forEach((notificationType) => {
            expect(registerNotification).toHaveBeenCalledWith(
                expect.objectContaining({type: notificationType})
            )
        })
    })
})
