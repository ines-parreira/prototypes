import { registerCategory, registerNotification } from 'common/notifications'

jest.mock('common/notifications', () => ({
    registerCategory: jest.fn(),
    registerNotification: jest.fn(),
}))

const registerNotificationMock = registerNotification as jest.Mock

describe('initTicketUpdates', () => {
    it('should register categories and notifications', () => {
        require('../initTicketUpdates')

        const categoryType = 'ticket-updates'
        expect(registerCategory).toHaveBeenCalledWith(
            expect.objectContaining({ type: categoryType }),
        )

        const notifications = [
            {
                type: 'ticket-message.created.chat.unassigned',
                title: 'New message',
            },
            { type: 'user.mentioned', title: 'New mention' },
            { type: 'ticket.snooze-expired', title: 'Snooze expired' },
            {
                type: 'ticket.assigned',
                title: "You've been assigned to a ticket",
            },
            {
                type: 'ticket.last-message-failed',
                title: 'Message not delivered',
            },
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
