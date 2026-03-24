import { reportError } from '@repo/logging'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { Moment } from 'moment'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { PHONE_EVENTS } from 'constants/event'
import useAppSelector from 'hooks/useAppSelector'
import {
    isTicketContactReasonSuggestion,
    isTicketEvent,
    isTicketRuleSuggestion,
    isTicketSatisfactionSurvey,
} from 'models/ticket/predicates'
import type {
    TicketElement,
    TicketEvent,
    TicketMessage,
} from 'models/ticket/types'
import { isVoiceCall } from 'models/voiceCall/types'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import type { HighlightedElements } from 'pages/tickets/detail/components/AuditLogEvent'
import AuditLogEvent, {
    contentfulEventTypesValues,
} from 'pages/tickets/detail/components/AuditLogEvent'
import Event from 'pages/tickets/detail/components/Event'
import PhoneEvent from 'pages/tickets/detail/components/PhoneEvent/PhoneEvent'
import {
    COMMENT_TICKET_PRIVATE_REPLY_EVENT,
    MESSAGING_TICKET_PRIVATE_REPLY_EVENT,
    PRIVATE_REPLY_ACTIONS,
} from 'pages/tickets/detail/components/PrivateReplyEvent/constants'
import PrivateReplyEvent from 'pages/tickets/detail/components/PrivateReplyEvent/PrivateReplyEvent'
import ContactReasonSuggestion from 'pages/tickets/detail/components/RuleSuggestion/AISuggestionContactReason'
import RuleSuggestion from 'pages/tickets/detail/components/RuleSuggestion/RuleSuggestion'
import SatisfactionSurvey from 'pages/tickets/detail/components/SatisfactionSurvey'
import TicketMessages from 'pages/tickets/detail/components/TicketMessages/TicketMessages'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getLastCustomerMessage, getTicketState } from 'state/ticket/selectors'

import type { TicketEventPrivateReplyData } from '../../../../models/event/types'
import type { ShoppingAssistantEvent } from '../hooks/useInsertShoppingAssistantEventElements'
import { isShoppingAssistantEvent } from '../utils'
import { InfluencedOrderEvent } from './ShoppingAssistantEvent/InfluencedOrderEvent'
import TicketVoiceCall from './TicketVoiceCall/TicketVoiceCall'

interface Props {
    element: TicketElement | TicketMessage[] | ShoppingAssistantEvent
    hasCursor: boolean
    highlightedElements: HighlightedElements | null
    index: number
    isLast: boolean
    lastMessageDatetimeAfterMount: Moment | null
    setHighlightedElements: (highlightedElements: HighlightedElements) => void
    setStatus?: (s: string) => void
}

const TicketBodyElement = ({
    element,
    hasCursor,
    highlightedElements,
    index,
    isLast,
    lastMessageDatetimeAfterMount,
    setHighlightedElements,
    setStatus,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)
    const lastCustomerMessage = useAppSelector(getLastCustomerMessage)
    const ticket = useAppSelector(getTicketState)

    const isDeprecatedPrivateEvent = (ticketEvent: TicketEvent) => {
        if (!ticketEvent.data) {
            return false
        }
        const eventData = ticketEvent.data as TicketEventPrivateReplyData
        const eventType = eventData.payload.private_reply_event_type
        if (
            eventType === MESSAGING_TICKET_PRIVATE_REPLY_EVENT &&
            (eventData.facebook_comment_ticket_id ||
                eventData.instagram_comment_ticket_id)
        ) {
            return true
        }
        if (
            eventType === COMMENT_TICKET_PRIVATE_REPLY_EVENT &&
            (eventData.messenger_ticket_id ||
                eventData.instagram_direct_message_ticket_id)
        ) {
            return true
        }
        return false
    }

    if (Array.isArray(element)) {
        return (
            <TicketMessages
                customer={ticket.get('customer')}
                hasCursor={hasCursor}
                highlightedElements={highlightedElements}
                lastCustomerMessage={lastCustomerMessage}
                lastMessageDatetimeAfterMount={lastMessageDatetimeAfterMount}
                messages={element}
                setStatus={setStatus}
                ticketId={ticket.get('id')}
                timezone={currentUser.get('timezone')}
                ticketMeta={ticket.get('meta')}
                messagePosition={index}
            />
        )
    }

    const elementMap: Map<any, any> = fromJS(element)
    const elementType = elementMap.get('type')

    if (isTicketSatisfactionSurvey(element)) {
        return (
            <SatisfactionSurvey
                customer={ticket.get('customer')}
                isLast={isLast}
                satisfactionSurvey={elementMap}
            />
        )
    }

    if (isTicketContactReasonSuggestion(element)) {
        return <ContactReasonSuggestion ticket={ticket.toJS()} />
    }

    if (isTicketRuleSuggestion(element)) {
        return (
            <ErrorBoundary
                sentryTags={{
                    section: 'rule-suggestion',
                    team: SentryTeam.CONVAI_KNOWLEDGE,
                }}
            >
                <RuleSuggestion isCollapsed={!isLast} ticket={ticket.toJS()} />
            </ErrorBoundary>
        )
    }

    if (isVoiceCall(element)) {
        return <TicketVoiceCall voiceCall={element} />
    }

    if (isShoppingAssistantEvent(element)) {
        return <InfluencedOrderEvent event={element} isLast={isLast} />
    }

    if (!isTicketEvent(element)) {
        reportError(new Error('Null ticket element'), {
            extra: { element },
        })

        return null
    }

    if (contentfulEventTypesValues.includes(elementType)) {
        return (
            <AuditLogEvent
                event={elementMap}
                isLast={isLast}
                setHighlightedElements={setHighlightedElements}
            />
        )
    }

    if (PHONE_EVENTS.includes(elementType)) {
        return <PhoneEvent event={elementMap} isLast={isLast} />
    }

    const actionName = elementMap.getIn(['data', 'action_name'])
    if (!!actionName && PRIVATE_REPLY_ACTIONS.includes(actionName)) {
        if (isDeprecatedPrivateEvent(element))
            return <PrivateReplyEvent event={elementMap} isLast={isLast} />
        return null // Private Reply will be handled in TicketMessage
    }

    return <Event event={elementMap} isLast={isLast} />
}

export default TicketBodyElement
