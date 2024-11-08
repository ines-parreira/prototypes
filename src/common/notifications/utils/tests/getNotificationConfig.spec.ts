import type {Notification} from '../../types'

import getNotificationConfig from '../getNotificationConfig'

jest.mock('../../data', () => ({
    notifications: {
        'ticket-message.created': {
            type: 'ticket-message.created',
            mapType: (n: Notification<{ticket: {channel: string}}>) => {
                const {channel} = n.payload.ticket
                return channel === 'chat'
                    ? 'ticket-message.created.chat'
                    : channel === 'email'
                      ? 'ticket-message.created.email'
                      : 'ticket-message.created'
            },
        },
        'ticket-message.created.email': {type: 'ticket-message.created.email'},
        'user.mentioned': {type: 'user.mentioned'},
    },
}))

describe('getNotificationSpec', () => {
    it('should return a config for a type that is not mapped', () => {
        const result = getNotificationConfig({
            type: 'user.mentioned',
        } as Notification)
        expect(result.type).toEqual('user.mentioned')
    })

    it('should return a config for a type that is mapped', () => {
        const result = getNotificationConfig({
            type: 'ticket-message.created',
            payload: {ticket: {channel: 'email'}},
        } as Notification)
        expect(result.type).toEqual('ticket-message.created.email')
    })

    it('should return a config for a type that could not be mapped to another type', () => {
        const result = getNotificationConfig({
            type: 'ticket-message.created',
            payload: {ticket: {channel: 'api'}},
        } as Notification)
        expect(result.type).toEqual('ticket-message.created')
    })

    it('should return a config for a type that was mapped but does not exist', () => {
        const result = getNotificationConfig({
            type: 'ticket-message.created',
            payload: {ticket: {channel: 'chat'}},
        } as Notification)
        expect(result.type).toEqual('ticket-message.created')
    })
})
