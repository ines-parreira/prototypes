import {logEvent, SegmentEvent} from 'common/segment'

import {ShopifyTagSelectionEventData} from '../types'

export const getLoggerOnTagSelectionEvent = (
    eventData: ShopifyTagSelectionEventData,
    action: SegmentEvent
) => {
    function logTagSelectionEvent(tag: string) {
        eventData.tag = tag

        if (action) {
            logEvent(action, eventData)
        }
    }

    return logTagSelectionEvent
}
