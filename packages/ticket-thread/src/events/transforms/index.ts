import type { Prettify } from '@repo/types'
import { slidingWindow } from '@repo/utils'

import type { Event } from '@gorgias/helpdesk-queries'

import { TicketThreadItemTag } from '../../thread/itemTags'
import type { TicketThreadItem } from '../../thread/types'
import {
    isActionExecutedEvent,
    isAuditLogEvent,
    isPhoneEvent,
    isPrivateReplyEvent,
    isSatisfactionSurveyRespondedEvent,
    isSingleEventItem,
} from '../predicates'
import type { TicketEventSchema } from '../schemas'
import type {
    TicketThreadAuditLogAttribution,
    TicketThreadAuditLogEvent,
    TicketThreadAuditLogEventItem,
    TicketThreadEventSource,
    TicketThreadSingleEventItem,
} from '../types'

export function toTaggedEvent(
    event: TicketThreadEventSource,
    options?: {
        auditLogAttribution?: TicketThreadAuditLogAttribution
    },
): TicketThreadSingleEventItem {
    const datetime = event.created_datetime ?? ''

    if (isActionExecutedEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
            data: event,
            datetime,
        }
    }

    if (isPhoneEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.PhoneEvent,
            data: event,
            datetime,
        }
    }

    if (isPrivateReplyEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.PrivateReplyEvent,
            data: event,
            datetime,
        }
    }

    if (isSatisfactionSurveyRespondedEvent(event)) {
        return {
            _tag: TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent,
            data: event,
            datetime,
        }
    }

    if (isAuditLogEvent(event)) {
        const auditLogEvent = event as TicketThreadAuditLogEvent

        return {
            _tag: TicketThreadItemTag.Events.AuditLogEvent,
            type: auditLogEvent.type,
            data: auditLogEvent,
            datetime,
            meta: {
                attribution: options?.auditLogAttribution ?? 'none',
            },
        } as TicketThreadAuditLogEventItem
    }

    return {
        _tag: TicketThreadItemTag.Events.TicketEvent,
        data: event as Prettify<Event & TicketEventSchema>,
        datetime,
    }
}

export function groupConsecutiveEvents(
    items: TicketThreadItem[],
): TicketThreadItem[] {
    const groupedItems: TicketThreadItem[] = []

    const isGroupable = (i: TicketThreadItem) =>
        isSingleEventItem(i) &&
        i._tag !== TicketThreadItemTag.Events.ActionExecutedEvent

    for (const [item, previousItem] of slidingWindow(items)) {
        if (previousItem && isGroupable(previousItem) && isGroupable(item)) {
            const previousGroupedItem = groupedItems[groupedItems.length - 1]

            if (
                previousGroupedItem?._tag ===
                TicketThreadItemTag.Events.GroupedEvents
            ) {
                previousGroupedItem.data.push(item)
            } else {
                groupedItems[groupedItems.length - 1] = {
                    _tag: TicketThreadItemTag.Events.GroupedEvents,
                    data: [previousItem, item],
                    datetime: previousItem.datetime,
                }
            }

            continue
        }

        groupedItems.push(item)
    }

    return groupedItems
}

export function shouldRenderTicketThreadEvent(
    event: TicketThreadEventSource,
): boolean {
    return (
        isPhoneEvent(event) ||
        isPrivateReplyEvent(event) ||
        isSatisfactionSurveyRespondedEvent(event) ||
        isAuditLogEvent(event) ||
        isActionExecutedEvent(event)
    )
}
