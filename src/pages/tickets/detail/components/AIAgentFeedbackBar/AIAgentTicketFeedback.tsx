import React from 'react'
import classNames from 'classnames'
import pluralize from 'pluralize'

import useAppSelector from 'hooks/useAppSelector'

import {getAIAgentMessages} from 'state/ticket/selectors'

import {TicketFeedback} from 'models/aiAgentFeedback/types'

import css from './AIAgentFeedbackBar.less'
import FeedbackOrders from './FeedbackOrders'
import FeedbackEvents from './FeedbackEvents'
import {QA_FAILED_MESSAGE} from './constants'

type Props = {
    ticketFeedback?: TicketFeedback
}

const AIAgentTicketFeedback: React.FC<Props> = ({ticketFeedback}) => {
    const aiMessages = useAppSelector(getAIAgentMessages)

    if (!ticketFeedback || !ticketFeedback.messages.length) return null

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
            name: string
            url: string
        }[]
    >((orders, message) => {
        return orders.concat(
            message.orders.filter((order) =>
                orders.every((o) => o.id !== order.id)
            )
        )
    }, [])

    const usedResourceCount = guidanceCount + actionCount + knowledgeCount

    const {shopType, shopName} = ticketFeedback.messages[0]
    const ticketFeedbackSummary = ticketFeedback.messages[0].summary

    const isOnlyDraftMessage =
        aiMessages.length === 1 &&
        !!ticketFeedbackSummary &&
        ticketFeedbackSummary.includes(QA_FAILED_MESSAGE)

    return (
        <>
            <div className={css.metadataContainer}>
                <div className={css.metadataSection}>
                    <FeedbackOrders orders={orders} />
                    {publicMessageCount && !isOnlyDraftMessage ? (
                        <div className={css.metadataField}>
                            <div className={css.metadataTitle}>
                                AI Agent sent
                            </div>
                            <div
                                className="body-semibold"
                                data-testid="ticket-feedback-messages"
                            >
                                <div className={css.metadataText}>
                                    {publicMessageCount}{' '}
                                    {pluralize('message', publicMessageCount)}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {usedResourceCount && !isOnlyDraftMessage ? (
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
                                    {actionCount}{' '}
                                    {pluralize('Action', actionCount)}
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
            </div>
            {!isOnlyDraftMessage && (
                <FeedbackEvents
                    messages={aiMessages}
                    shopType={shopType}
                    shopName={shopName}
                />
            )}
            <div className={css.executionId}>
                {ticketFeedback.messages.map((messageFeedback) => (
                    <div key={messageFeedback.executionId}>
                        {messageFeedback.executionId}
                    </div>
                ))}
            </div>
        </>
    )
}

export default AIAgentTicketFeedback
