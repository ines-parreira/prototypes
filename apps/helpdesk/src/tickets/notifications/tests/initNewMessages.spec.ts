import { registerCategory, registerNotification } from 'common/notifications'

jest.mock('common/notifications', () => ({
    registerCategory: jest.fn(),
    registerNotification: jest.fn(),
}))

const registerNotificationMock = registerNotification as jest.Mock

describe('initNewMessages', () => {
    it('should register categories and notifications', () => {
        require('../initNewMessages')

        const categoryType = 'ticket-message-created'
        expect(registerCategory).toHaveBeenCalledWith(
            expect.objectContaining({ type: categoryType }),
        )

        const notifications = [
            { type: 'ticket-message.created.email', title: 'New message' },
            { type: 'ticket-message.created.chat', title: 'New message' },
            { type: 'ticket-message.created.phone', title: 'New message' },
            { type: 'ticket-message.created.sms', title: 'New message' },
            { type: 'ticket-message.created.facebook', title: 'New message' },
            { type: 'ticket-message.created.instagram', title: 'New message' },
            { type: 'ticket-message.created.whatsapp', title: 'New message' },
            { type: 'ticket-message.created.yotpo', title: 'New message' },
            { type: 'ticket-message.created.aircall', title: 'New message' },
            { type: 'ticket-message.created', title: 'New message' },
        ]
        notifications.forEach((n) => {
            expect(registerNotification).toHaveBeenCalledWith(
                expect.objectContaining({ type: n.type }),
            )

            const entry = registerNotificationMock.mock.calls.find(
                ([c]) => c.type === n.type,
            )[0]

            const dn = entry.getDesktopNotification()
            expect(dn.title).toBe(n.title)
        })
    })
})
