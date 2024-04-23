import {FeedItem} from '@knocklabs/client'

import {Notification, RawNotification} from '../types'

export default function transformKnockNotification(
    item: FeedItem<RawNotification>
): Notification | null {
    const {data, id} = item
    if (!data) return null

    return {
        id,
        type: data.type,
        payload: data.payload,
    }
}
