import { useMemo } from 'react'

import { useSearchParams } from '@repo/routing'
import { TicketSearchParamsKeys } from '@repo/tickets/utils/routing'

import { TicketThreadSingleEventItem } from '#events/components/TicketThreadEventItem/TicketTheadEventItem'
import { TicketThreadGroupedEventsItem } from '#events/components/TicketThreadEventItem/TicketTheadGroupedEventsItem'
import { TicketThreadSatisfactionSurveyItem } from '#satisfaction-surveys/components/TicketThreadSatisfactionSurveyItem/TicketTheadSatisfactionSurveyItem'
import { assertNever } from '#shared/assertNever'
import { TicketThreadInfluencedOrderItem } from '#shopping-assistant/components/TicketThreadInfluencedOrderItem/TicketThreadInfluencedOrderItem'
import { TicketThreadSuggestionItem } from '#suggestions/components/TicketThreadSuggestions/TicketThreadSuggestionItem'
import { TicketThreadItemTag } from '#thread/itemTags'
import type { TicketThreadItem } from '#thread/types'
import { TicketThreadMessageItem } from '#ticket-messages/components/TicketThreadMessageItem'
import { TicketThreadCallItem } from '#voice-calls/components/TicketThreadCallItem/TicketThreadCallIItem'

type TicketThreadItemProps = {
    item: TicketThreadItem
}

const { key: showTicketEventsKey, parse: parseShowTicketEvents } =
    TicketSearchParamsKeys.showTicketEvents

export function TicketThreadItem({ item }: TicketThreadItemProps) {
    const [searchParams] = useSearchParams()
    const showTicketEvents = useMemo(
        () => parseShowTicketEvents(searchParams.get(showTicketEventsKey)),
        [searchParams],
    )
    switch (item._tag) {
        case TicketThreadItemTag.Messages.Message:
        case TicketThreadItemTag.Messages.InternalNote:
        case TicketThreadItemTag.Messages.AiAgentMessage:
        case TicketThreadItemTag.Messages.AiAgentInternalNote:
        case TicketThreadItemTag.Messages.AiAgentDraftMessage:
        case TicketThreadItemTag.Messages.AiAgentTrialMessage:
        case TicketThreadItemTag.Messages.AiAgentHandoverMessage:
        case TicketThreadItemTag.Messages.SocialMediaFacebookComment:
        case TicketThreadItemTag.Messages.SocialMediaFacebookPost:
        case TicketThreadItemTag.Messages.SocialMediaFacebookMessage:
        case TicketThreadItemTag.Messages.SocialMediaInstagramComment:
        case TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage:
        case TicketThreadItemTag.Messages.SocialMediaInstagramMedia:
        case TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention:
        case TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply:
        case TicketThreadItemTag.Messages.SocialMediaTwitterTweet:
        case TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage:
        case TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage:
        case TicketThreadItemTag.Messages.GroupedMessages:
            return <TicketThreadMessageItem item={item} />
        case TicketThreadItemTag.Events.ActionExecutedEvent:
        case TicketThreadItemTag.Events.PhoneEvent:
            return <TicketThreadSingleEventItem item={item} />
        case TicketThreadItemTag.Events.TicketEvent:
        case TicketThreadItemTag.Events.AuditLogEvent:
        case TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent:
        case TicketThreadItemTag.Events.PrivateReplyEvent: {
            if (showTicketEvents) {
                return <TicketThreadSingleEventItem item={item} />
            }
            return <div />
        }
        case TicketThreadItemTag.Events.GroupedEvents: {
            if (showTicketEvents) {
                return <TicketThreadGroupedEventsItem item={item} />
            }
            const visibleItems = item.data.filter(
                (e) =>
                    e._tag === TicketThreadItemTag.Events.ActionExecutedEvent ||
                    e._tag === TicketThreadItemTag.Events.PhoneEvent,
            )
            if (visibleItems.length === 0) {
                return <div />
            }
            return (
                <TicketThreadGroupedEventsItem
                    item={{ ...item, data: visibleItems }}
                />
            )
        }
        case TicketThreadItemTag.VoiceCalls.VoiceCall:
        case TicketThreadItemTag.VoiceCalls.OutboundVoiceCall:
            return <TicketThreadCallItem item={item} />
        case TicketThreadItemTag.ShoppingAssistant.InfluencedOrder:
            return <TicketThreadInfluencedOrderItem item={item} />
        case TicketThreadItemTag.SatisfactionSurvey:
            return <TicketThreadSatisfactionSurveyItem item={item} />
        case TicketThreadItemTag.RuleSuggestion:
        case TicketThreadItemTag.ContactReasonSuggestion:
            return <TicketThreadSuggestionItem item={item} />
        default:
            return assertNever(item)
    }
}
