import {registerCategory, registerNotification} from 'common/notifications'

jest.mock('common/notifications', () => ({
    registerCategory: jest.fn(),
    registerNotification: jest.fn(),
}))

describe('initNewMessages', () => {
    it('should register categories and notifications', () => {
        require('../initNewMessages')

        const categoryType = 'ticket-message-created'
        expect(registerCategory).toHaveBeenCalledWith(
            expect.objectContaining({type: categoryType})
        )

        const notifications = [
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
