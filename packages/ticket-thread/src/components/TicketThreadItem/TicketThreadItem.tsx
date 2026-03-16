import { TicketThreadItemTag } from '../../hooks/types'
import type { TicketThreadItem } from '../../hooks/types'
import { assertNever } from '../../utils/assertNever'
import { TicketThreadCallItem } from '../TicketThreadCallItem/TicketThreadCallIItem'
import { TicketThreadSingleEventItem } from '../TicketThreadEventItem/TicketTheadEventItem'
import { TicketThreadGroupedEventsItem } from '../TicketThreadEventItem/TicketTheadGroupedEventsItem'
import { TicketThreadMessageItem } from '../TicketThreadMessageItem/TicketThreadMessageItem'
import { TicketThreadSatisfactionSurveyItem } from '../TicketThreadSatisfactionSurveyItem/TicketTheadSatisfactionSurveyItem'
import { TicketThreadSuggestionItem } from '../TicketThreadSuggestions/TicketThreadSuggestionItem'

type TicketThreadItemProps = {
    item: TicketThreadItem
}

export function TicketThreadItem({ item }: TicketThreadItemProps) {
    switch (item._tag) {
        case TicketThreadItemTag.Messages.Message:
        case TicketThreadItemTag.Messages.InternalNote:
        case TicketThreadItemTag.Messages.AiAgentMessage:
        case TicketThreadItemTag.Messages.AiAgentInternalNote:
        case TicketThreadItemTag.Messages.AiAgentDraftMessage:
        case TicketThreadItemTag.Messages.AiAgentTrialMessage:
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
        case TicketThreadItemTag.Events.TicketEvent:
        case TicketThreadItemTag.Events.PhoneEvent:
        case TicketThreadItemTag.Events.AuditLogEvent:
        case TicketThreadItemTag.Events.ActionExecutedEvent:
        case TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent:
        case TicketThreadItemTag.Events.PrivateReplyEvent:
        case TicketThreadItemTag.Events.ShoppingAssistantEvent:
            return <TicketThreadSingleEventItem item={item} />
        case TicketThreadItemTag.Events.GroupedEvents:
            return <TicketThreadGroupedEventsItem item={item} />
        case TicketThreadItemTag.VoiceCalls.VoiceCall:
        case TicketThreadItemTag.VoiceCalls.OutboundVoiceCall:
            return <TicketThreadCallItem item={item} />
        case TicketThreadItemTag.SatisfactionSurvey:
            return <TicketThreadSatisfactionSurveyItem item={item} />
        case TicketThreadItemTag.RuleSuggestion:
        case TicketThreadItemTag.ContactReasonSuggestion:
            return <TicketThreadSuggestionItem item={item} />
        default:
            return assertNever(item)
    }
}
