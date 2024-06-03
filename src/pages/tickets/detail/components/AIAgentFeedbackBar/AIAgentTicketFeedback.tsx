import React from 'react'
import classNames from 'classnames'
import pluralize from 'pluralize'
import {fromJS} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import {getAIAgentMessages} from 'state/ticket/selectors'

import {TicketFeedback} from 'models/aiAgentFeedback/types'

import TicketTag from 'pages/common/components/TicketTag'

import {useAIAgentMultipleMessageEvents} from '../../hooks/useAIAgentMessageEvents'

import {TicketEventEnum} from './types'

import TicketEvent from './TicketEvent'

import css from './AIAgentFeedbackBar.less'

type Props = {
    ticketFeedback?: TicketFeedback
}

const AIAgentTicketFeedback: React.FC<Props> = ({ticketFeedback}) => {
    const aiMessages = useAppSelector(getAIAgentMessages)

    const events = useAIAgentMultipleMessageEvents(aiMessages)

    const filteredEvents = events.filter(
        (event) => event.tags.length > 0 || event.action
    )

    if (!ticketFeedback) return null

    const publicMessageCount = ticketFeedback.messages.filter(
        (ticketFeedbackMessage) =>
            aiMessages.find(
                (aiMessage) => aiMessage.id === ticketFeedbackMessage.messageId
            )?.public
    ).length

    const guidanceCount = ticketFeedback.messages.reduce(
        (count, message) => count + message.guidance.length,
        0
    )

    const actionCount = ticketFeedback.messages.reduce(
        (count, message) => count + message.actions.length,
        0
    )

    const knowledgeCount = ticketFeedback.messages.reduce(
        (count, message) => count + message.knowledge.length,
        0
    )

    const orders = ticketFeedback.messages.reduce<
        {
            id: number
            url: string
        }[]
    >((orders, message) => {
        return orders.concat(message.orders)
    }, [])

    const usedResourceCount = guidanceCount + actionCount + knowledgeCount

    const eventCount = filteredEvents.length

    const aiAgentLink = `/app/automation/${ticketFeedback.shopType}/${ticketFeedback.shopName}/ai-agent`
    const guidanceLink = `${aiAgentLink}/guidance`

    return (
        <>
            {publicMessageCount ? (
                <div className={css.sectionContainer}>
                    <div className={css.subtitle}>AI Agent sent</div>
                    <div
                        className={css.section}
                        data-testid="ticket-feedback-messages"
                    >
                        <div className={css.sectionText}>
                            {publicMessageCount}{' '}
                            {pluralize('message', publicMessageCount)}
                        </div>
                    </div>
                </div>
            ) : null}
            {usedResourceCount ? (
                <div className={css.sectionContainer}>
                    <div className={css.subtitle}>Using</div>
                    {guidanceCount ? (
                        <div
                            className={css.section}
                            data-testid="ticket-feedback-guidances"
                        >
                            <div className={css.sectionText}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.leadIcon
                                    )}
                                >
                                    map
                                </i>
                                {guidanceCount}{' '}
                                {pluralize('Guidance', guidanceCount)}
                            </div>
                        </div>
                    ) : null}
                    {actionCount ? (
                        <div
                            className={css.section}
                            data-testid="ticket-feedback-actions"
                        >
                            <div className={css.sectionText}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.leadIcon
                                    )}
                                >
                                    play_circle_filled
                                </i>
                                {actionCount} {pluralize('Action', actionCount)}
                            </div>
                        </div>
                    ) : null}
                    {knowledgeCount ? (
                        <div
                            className={css.section}
                            data-testid="ticket-feedback-knowledges"
                        >
                            <div className={css.sectionText}>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.leadIcon
                                    )}
                                >
                                    article
                                </i>
                                {knowledgeCount} Knowledge{' '}
                                {pluralize('source', knowledgeCount)}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
            {orders.length ? (
                <div className={css.sectionContainer}>
                    <div className={css.subtitle}>Order Data</div>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className={css.order}
                            data-testid="ticket-feedback-order"
                        >
                            <div>#{order.id}</div>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.openIcon
                                )}
                            >
                                open_in_new
                            </i>
                        </div>
                    ))}
                </div>
            ) : null}
            {eventCount && (
                <div className={css.ticketEventsContainer}>
                    <div className={css.subtitle}>Ticket events</div>
                    {filteredEvents.map((event, index) => (
                        <React.Fragment key={index}>
                            {event.tags.length > 0 && (
                                <div className={css.eventTypeContainer}>
                                    <TicketEvent
                                        eventType={TicketEventEnum.TAGGED}
                                        isFirst={index === 0}
                                        isLast={
                                            index ===
                                                filteredEvents.length - 1 &&
                                            event.action === null
                                        }
                                    >
                                        {event.tags.map((tag) => (
                                            <TicketTag
                                                key={tag.id}
                                                decoration={fromJS(
                                                    tag.decoration
                                                )}
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
                                    isFirst={
                                        index === 0 && event.tags.length === 0
                                    }
                                    isLast={index === filteredEvents.length - 1}
                                    eventType={event.action}
                                />
                            )}
                        </React.Fragment>
                    ))}
                    <div
                        className={css.ticketImproveInfo}
                        data-testid="ticket-feedback-improve-info"
                    >
                        Improve ticket actions with{' '}
                        <a href={guidanceLink} target="_blank" rel="noreferrer">
                            Guidance
                        </a>{' '}
                        and tagging behavior in{' '}
                        <a href={aiAgentLink} target="_blank" rel="noreferrer">
                            AI Agent Configuration
                        </a>
                    </div>
                </div>
            )}
        </>
    )
}

export default AIAgentTicketFeedback
