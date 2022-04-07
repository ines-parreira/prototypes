import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {ShopifyTagSelectionEventData} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/types'

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
