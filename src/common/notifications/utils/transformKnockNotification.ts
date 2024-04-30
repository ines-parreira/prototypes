import {FeedItem} from '@knocklabs/client'

import {Notification, RawNotification} from '../types'

export default function transformKnockNotification(
    item: FeedItem<RawNotification>
): Notification | null {
    const {data, id, inserted_at, read_at, seen_at} = item
    if (!data) return null

    return {
        id,
        type: data.type,
        payload: data.payload,
        inserted_datetime: inserted_at,
        read_datetime: read_at,
        seen_datetime: seen_at,
    }
}
