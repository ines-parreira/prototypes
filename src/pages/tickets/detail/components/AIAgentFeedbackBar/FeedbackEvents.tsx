import React from 'react'
import {fromJS} from 'immutable'

import TicketTag from 'pages/common/components/TicketTag'
import {TicketMessage} from 'models/ticket/types'

import {useAIAgentMessageEvents} from '../../hooks/useAIAgentMessageEvents'

import {TicketEventEnum} from './types'

import TicketEvent from './TicketEvent'

import css from './AIAgentFeedbackBar.less'

type Props = {
    messages: TicketMessage[]
    shopType: string
    shopName: string
}

const FeedbackEvents: React.FC<Props> = ({messages, shopType, shopName}) => {
    const events = useAIAgentMessageEvents(messages)

    if (!messages.length) {
        return null
    }

    const filteredEvents = events.filter(
        (event) => event.tags.length > 0 || event.action
    )

    const eventCount = filteredEvents.length

    if (!eventCount) {
        return null
    }

    const aiAgentLink = `/app/automation/${shopType}/${shopName}/ai-agent`

    return (
        <div className={css.ticketEventsContainer}>
            <div className={css.title}>Ticket events</div>
            <div
                className={css.ticketImproveInfo}
                data-testid="ticket-feedback-improve-info"
            >
                Improve ticket actions by adjusting handover topics and tagging
                behavior in{' '}
                <a href={aiAgentLink} target="_blank" rel="noreferrer">
                    AI Agent Configuration
                </a>
            </div>
            {filteredEvents.map((event, index) => (
                <React.Fragment key={index}>
                    {event.tags.length > 0 && (
                        <div className={css.eventTypeContainer}>
                            <TicketEvent
                                eventType={TicketEventEnum.TAGGED}
                                isFirst={index === 0}
                                isLast={
                                    index === filteredEvents.length - 1 &&
                                    event.action === null
                                }
                            >
                                {event.tags.map((tag) => (
                                    <TicketTag
                                        key={tag.id}
                                        decoration={fromJS(tag.decoration)}
                                        className={css.tag}
                                    >
                                        {tag.name}
                                    </TicketTag>
                                ))}
                            </TicketEvent>
                        </div>
                    )}
                    {!!event.action && (
                        <TicketEvent
                            isFirst={index === 0 && event.tags.length === 0}
                            isLast={index === filteredEvents.length - 1}
                            eventType={event.action}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

export default FeedbackEvents
