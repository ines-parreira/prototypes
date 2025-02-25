import { TicketMessage } from 'models/ticket/types'
import { SYSTEM_SOURCE_TYPES } from 'tickets/common/config'

import lastNonSystemTypeMessage from '../lastNonSystemTypeMessage'

describe('lastNonSystemTypeMessage', () => {
    it('falsy if no message', () => {
        const messages: TicketMessage[] = []

        expect(lastNonSystemTypeMessage(messages)).toBeFalsy()
    })

    it('is correct', () => {
        const lastMessage = lastNonSystemTypeMessage([
            {
                id: 1,
                created_datetime: '2017-07-01T18:00:00',
            },
            {
                id: 2,
                created_datetime: '2017-07-02T18:00:00',
            },
        ] as any)

        if (!lastMessage) {
            throw new Error('lastMessage is undefined')
        }
        expect(lastMessage.get('id')).toEqual(2)

        const lastReversedMessage = lastNonSystemTypeMessage([
            {
                id: 1,
                created_datetime: '2017-07-02T18:00:00',
            },
            {
                id: 2,
                created_datetime: '2017-07-01T18:00:00',
            },
        ] as any)

        if (!lastReversedMessage) {
            throw new Error('lastReversedMessages is undefined')
        }
        expect(lastReversedMessage.get('id')).toEqual(1)
    })

    it('ignores system messages', () => {
        const systemType = SYSTEM_SOURCE_TYPES[0]

        const lastMessage = lastNonSystemTypeMessage([
            {
                id: 1,
                created_datetime: '2017-07-01T18:00:00',
            },
            {
                id: 2,
                created_datetime: '2017-07-02T18:00:00',
            },
            {
                id: 3,
                created_datetime: '2017-07-03T18:00:00',
                source: {
                    type: systemType,
                },
            },
        ] as any)

        if (!lastMessage) {
            throw new Error('lastMessage is undefined')
        }
        expect(lastMessage.get('id')).toEqual(2)
    })
})
