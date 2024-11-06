import type {
    Feed,
    FeedEventPayload,
    FeedRealTimeCallback,
} from '@knocklabs/client'

import type {Notification, RawNotification} from './types'
import transformKnockNotification from './utils/transformKnockNotification'

export default class Client {
    private feedClient: Feed
    private listeners: ((notification: Notification) => void)[]

    constructor(feedClient: Feed) {
        this.feedClient = feedClient
        this.listeners = []
    }

    subscribe(listener: (notification: Notification) => void) {
        if (this.listeners.length === 0) {
            this.feedClient.on(
                'items.received.realtime',
                // remove cast after consultation with knock team
                this.receive as unknown as FeedRealTimeCallback
            )
        }

        this.listeners.push(listener)

        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener)

            if (this.listeners.length === 0) {
                this.feedClient.off(
                    'items.received.realtime',
                    // remove cast after consultation with knock team
                    this.receive as unknown as FeedRealTimeCallback
                )
            }
        }
    }

    receive = ({items}: FeedEventPayload<RawNotification>) => {
        const mappedItems = items
            .map(transformKnockNotification)
            .filter((notification) => !!notification) as Notification[]

        if (!mappedItems.length) return

        this.listeners.forEach((listener) => {
            mappedItems.forEach((item) => listener(item))
        })
    }
}
