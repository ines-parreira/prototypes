import { Fragment } from 'react'
import type { FC } from 'react'

import { logEventWithSampling, SegmentEvent } from '@repo/logging'

import type { TicketMessage } from 'models/ticket/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import TicketTag from 'pages/common/components/TicketTag'

import { useAIAgentMessageEvents } from '../../hooks/useAIAgentMessageEvents'
import TicketEvent from './TicketEvent'
import { TicketEventEnum } from './types'

import css from './AIAgentFeedbackBar.less'

type Props = {
    messages: TicketMessage[]
    shopType: string
    shopName: string
}

const FeedbackEvents: FC<Props> = ({ messages, shopName }) => {
    const events = useAIAgentMessageEvents(messages)

    const aiAgentNavigation = useAiAgentNavigation({ shopName })

    if (!messages.length) {
        return null
    }

    const filteredEvents = events.filter(
        (event) => event.tags.length > 0 || event.action,
    )

    const eventCount = filteredEvents.length

    if (!eventCount) {
        return null
    }

    const aiAgentLink = aiAgentNavigation.routes.main

    return (
        <div className={css.ticketEventsContainer}>
            <div className={css.title}>Ticket events</div>
            <div
                className={css.ticketImproveInfo}
                data-testid="ticket-feedback-improve-info"
            >
                Improve ticket actions by adjusting handover topics and tagging
                behavior in{' '}
                <a
                    href={aiAgentLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                        logEventWithSampling(
                            SegmentEvent.AiAgentFeedbackResourceClicked,
                            {
                                type: 'ai_agent_configuration_link',
                            },
                        )
                    }}
                >
                    AI Agent Configuration
                </a>
            </div>
            {filteredEvents.map((event, index) => (
                <Fragment key={index}>
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
                                        text={tag.name}
                                        decoration={tag.decoration}
                                    />
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
                </Fragment>
            ))}
        </div>
    )
}

export default FeedbackEvents
