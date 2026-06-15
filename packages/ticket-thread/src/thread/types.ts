import type { TicketThreadEventItem } from '../events/types'
import type { TicketThreadSatisfactionSurveyItem } from '../satisfaction-surveys/types'
import type { TicketThreadShoppingAssistantItem } from '../shopping-assistant/types'
import type { TicketThreadContactReasonSuggestionItem } from '../suggestions/contact-reason-prediction/types'
import type { TicketThreadRuleSuggestionItem } from '../suggestions/rule-suggestions/types'
import type { TicketThreadMessageItem } from '../ticket-messages/types'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from '../voice-calls/types'

export { TicketThreadItemTag } from './itemTags'

export type TicketThreadItem =
    | TicketThreadMessageItem
    | TicketThreadEventItem
    | TicketThreadVoiceCallItem
    | TicketThreadOutboundVoiceCallItem
    | TicketThreadShoppingAssistantItem
    | TicketThreadSatisfactionSurveyItem
    | TicketThreadRuleSuggestionItem
    | TicketThreadContactReasonSuggestionItem
