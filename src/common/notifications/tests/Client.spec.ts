import type {Feed, FeedEventPayload} from '@knocklabs/client'

import Client from '../Client'
import type {RawNotification} from '../types'
import transformKnockNotification from '../utils/transformKnockNotification'

jest.mock('../utils/transformKnockNotification', () =>
    jest.fn((n: unknown) => n)
)
const transformKnockNotificationMock = transformKnockNotification as jest.Mock

describe('Client', () => {
    let feedClient: Feed
    let onMock: jest.Mock

    beforeEach(() => {
        onMock = jest.fn()
        feedClient = {
            off: jest.fn(),
            on: onMock,
        } as unknown as Feed
    })

    it('should subscribe and unsubscribe to changes on the feed client for a single subscription', () => {
        const client = new Client(feedClient)

        const unsub = client.subscribe(jest.fn())
        expect(onMock).toHaveBeenCalledWith(
            'items.received.realtime',
            expect.any(Function)
        )

        const [[, fn]] = onMock.mock.calls
        unsub()
        expect(feedClient.off).toHaveBeenCalledWith(
            'items.received.realtime',
            fn
        )
    })

    it('should subscribe and unsubscribe to changes on the feed client for multiple subscription', () => {
        const client = new Client(feedClient)

        const unsub1 = client.subscribe(jest.fn())
        expect(onMock).toHaveBeenCalledWith(
            'items.received.realtime',
            expect.any(Function)
        )

        const unsub2 = client.subscribe(jest.fn())
        expect(onMock).toHaveBeenCalledTimes(1)

        const [[, fn]] = onMock.mock.calls
        unsub1()
        expect(feedClient.off).not.toHaveBeenCalled()

        unsub2()
        expect(feedClient.off).toHaveBeenCalledWith(
            'items.received.realtime',
            fn
        )
    })

    it('should call all subscribed listeners for received notifications', () => {
        const client = new Client(feedClient)

        const listener1 = jest.fn()
        const listener2 = jest.fn()
        const unsub1 = client.subscribe(listener1)
        const unsub2 = client.subscribe(listener2)

        const [[, fn]] = onMock.mock.calls as [
            [string, (payload: FeedEventPayload<RawNotification>) => void],
        ]
        const payload = {
            items: [{id: 1}],
        } as unknown as FeedEventPayload<RawNotification>
        fn(payload)

        expect(listener1).toHaveBeenCalledWith({id: 1})
        expect(listener2).toHaveBeenCalledWith({id: 1})

        unsub1()
        unsub2()
    })

    it('should not call subscribed listeners for notifications that cannot be transformed', () => {
        transformKnockNotificationMock.mockReturnValue(null)
        const client = new Client(feedClient)

        const listener = jest.fn()
        const unsub = client.subscribe(listener)

        const [[, fn]] = onMock.mock.calls as [
            [string, (payload: FeedEventPayload<RawNotification>) => void],
        ]
        const payload = {
            items: [{id: 1}],
        } as unknown as FeedEventPayload<RawNotification>
        fn(payload)

        expect(listener).not.toHaveBeenCalled()

        unsub()
    })
})
