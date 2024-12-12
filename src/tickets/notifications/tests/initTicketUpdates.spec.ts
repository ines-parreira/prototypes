import {registerCategory, registerNotification} from 'common/notifications'

jest.mock('common/notifications', () => ({
    registerCategory: jest.fn(),
    registerNotification: jest.fn(),
}))

describe('initTicketUpdates', () => {
    it('should register categories and notifications', () => {
        require('../initTicketUpdates')

        const categoryType = 'ticket-updates'
        expect(registerCategory).toHaveBeenCalledWith(
            expect.objectContaining({type: categoryType})
        )

        const notifications = [
            'legacy-chat-and-messaging',
            'user.mentioned',
            'ticket.snooze-expired',
            'ticket.assigned',
        ]
        notifications.forEach((notificationType) => {
            expect(registerNotification).toHaveBeenCalledWith(
                expect.objectContaining({type: notificationType})
            )
        })
    })
})
