// eventLogger.ts
import { logEvent, SegmentEvent } from 'common/segment'

import { ShoppingAssistantEventType } from '../types/ShoppingAssistant'

export const logShoppingAssistantEvent = (
    eventType: ShoppingAssistantEventType,
) => {
    const validEvents = [
        ShoppingAssistantEventType.StartTrial,
        ShoppingAssistantEventType.Demo,
        ShoppingAssistantEventType.Learn,
        ShoppingAssistantEventType.NotifyAdmin,
    ]

    if (validEvents.includes(eventType)) {
        logEvent(SegmentEvent.TrialBannerOverviewCTAClicked, { CTA: eventType })
    } else {
        console.warn(`Unsupported event type: ${eventType}`)
    }
}
