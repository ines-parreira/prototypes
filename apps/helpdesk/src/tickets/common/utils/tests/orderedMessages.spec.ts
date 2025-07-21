import orderedMessages from '../orderedMessages'

describe('orderedMessages', () => {
    it('order messages', () => {
        const messages = [
            {
                id: 1,
                created_datetime: '2017-07-01T18:00:00',
            },
            {
                id: 2,
                created_datetime: '2017-07-02T18:00:00',
            },
        ]

        expect(
            orderedMessages(messages as any)
                .map((message: Map<any, any>) => message.get('id') as number)
                .toJS(),
        ).toEqual([1, 2])

        const reversedMessages = [
            {
                id: 1,
                created_datetime: '2017-07-02T18:00:00',
            },
            {
                id: 2,
                created_datetime: '2017-07-01T18:00:00',
            },
        ]

        expect(
            orderedMessages(reversedMessages as any)
                .map((message: Map<any, any>) => message.get('id') as number)
                .toJS(),
        ).toEqual([2, 1])
    })
})
