import React from 'react'
import classNames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import IconButton from 'pages/common/components/button/IconButton'

import css from './AIAgentFeedbackBar.less'

export const FEEDBACK_TICKET_SUMMARY_TEST_ID = 'feedback-bar'
export const FEEDBACK_MESSAGE_CONTAINER_TEST_ID = 'feedback-message-container'
export const FEEDBACK_MESSAGE_ACTIONS_TEST_ID = 'feedback-message-actions'
export const FEEDBACK_MESSAGE_GUIDANCE_TEST_ID = 'feedback-message-guidance'
export const FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID = 'feedback-message-knowledge'

const AIAgentFeedbackBar = () => {
    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const {data} = useGetAiAgentFeedback(selectedAIMessage?.ticket_id || 0, {
        refetchOnWindowFocus: false,
        enabled: !!selectedAIMessage,
    })

    if (!selectedAIMessage) {
        return (
            <div data-testid={FEEDBACK_TICKET_SUMMARY_TEST_ID}>
                Generic data for ticket
            </div>
        )
    }

    const ticketFeedback = data?.data

    const messageFeedback = ticketFeedback?.messages?.find(
        (messageFeedback) => messageFeedback.messageId === selectedAIMessage.id
    )

    return (
        <div
            className={css.container}
            data-testid={FEEDBACK_MESSAGE_CONTAINER_TEST_ID}
        >
            <div className={css.title}>Improve AI Agent responses</div>
            <div className={css.summary}>{messageFeedback?.summary}</div>
            <div className={css.sectionContainer}>
                <div className={css.subtitle}>Actions</div>
                {messageFeedback?.actions?.map((action) => (
                    <div
                        className={css.section}
                        key={action.id}
                        data-testid={FEEDBACK_MESSAGE_ACTIONS_TEST_ID}
                    >
                        <div className={css.sectionText}>
                            <div>{action.name}</div>
                            <i className="material-icons">open_in_new</i>
                        </div>
                        <div className={css.feedback}>
                            <IconButton
                                fillStyle="fill"
                                intent="secondary"
                                size="small"
                                iconClassName={
                                    action.feedback === 1
                                        ? 'material-icons'
                                        : 'material-icons-outlined'
                                }
                                className={classNames({
                                    [css.positiveFeedback]:
                                        action.feedback === 1,
                                })}
                            >
                                thumb_up
                            </IconButton>
                            <IconButton
                                fillStyle="fill"
                                intent="secondary"
                                size="small"
                                iconClassName={
                                    action.feedback === -1
                                        ? 'material-icons'
                                        : 'material-icons-outlined'
                                }
                                className={classNames({
                                    [css.negativeFeedback]:
                                        action.feedback === -1,
                                })}
                            >
                                thumb_down
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>
            <div className={css.sectionContainer}>
                <div className={css.subtitle}>Guidance</div>
                {messageFeedback?.guidance?.map((guidance) => (
                    <div
                        className={css.section}
                        key={guidance.id}
                        data-testid={FEEDBACK_MESSAGE_GUIDANCE_TEST_ID}
                    >
                        <div className={css.sectionText}>
                            <div>{guidance.name}</div>
                            <i className="material-icons">open_in_new</i>
                        </div>
                        <div className={css.feedback}>
                            <IconButton
                                fillStyle="fill"
                                intent="secondary"
                                size="small"
                                iconClassName={
                                    guidance.feedback === 1
                                        ? 'material-icons'
                                        : 'material-icons-outlined'
                                }
                                className={classNames({
                                    [css.positiveFeedback]:
                                        guidance.feedback === 1,
                                })}
                            >
                                thumb_up
                            </IconButton>
                            <IconButton
                                fillStyle="fill"
                                intent="secondary"
                                size="small"
                                iconClassName={
                                    guidance.feedback === -1
                                        ? 'material-icons'
                                        : 'material-icons-outlined'
                                }
                                className={classNames({
                                    [css.negativeFeedback]:
                                        guidance.feedback === -1,
                                })}
                            >
                                thumb_down
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>
            <div className={css.sectionContainer}>
                <div className={css.subtitle}>Knowledge</div>
                {messageFeedback?.knowledge?.map((knowledge) => (
                    <div
                        className={css.section}
                        key={knowledge.id}
                        data-testid={FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID}
                    >
                        <div className={css.sectionText}>
                            <div>{knowledge.name}</div>
                            <i className="material-icons">open_in_new</i>
                        </div>
                        <div className={css.feedback}>
                            <IconButton
                                fillStyle="fill"
                                intent="secondary"
                                size="small"
                                iconClassName={
                                    knowledge.feedback === 1
                                        ? 'material-icons'
                                        : 'material-icons-outlined'
                                }
                                className={classNames({
                                    [css.positiveFeedback]:
                                        knowledge.feedback === 1,
                                })}
                            >
                                thumb_up
                            </IconButton>
                            <IconButton
                                fillStyle="fill"
                                intent="secondary"
                                size="small"
                                iconClassName={
                                    knowledge.feedback === -1
                                        ? 'material-icons'
                                        : 'material-icons-outlined'
                                }
                                className={classNames({
                                    [css.negativeFeedback]:
                                        knowledge.feedback === -1,
                                })}
                            >
                                thumb_down
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>
            {messageFeedback?.orders?.[0]?.id && (
                <div className={css.orderContainer}>
                    <div className={css.subtitle}>Order data</div>
                    <div className={css.order}>
                        <div>#{messageFeedback?.orders[0].id}</div>
                        <i className="material-icons">open_in_new</i>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AIAgentFeedbackBar
