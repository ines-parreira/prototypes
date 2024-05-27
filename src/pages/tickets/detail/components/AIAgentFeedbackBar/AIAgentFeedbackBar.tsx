import React, {useEffect, useState} from 'react'
import classNames from 'classnames'

import {fromJS} from 'immutable'
import useAppSelector from 'hooks/useAppSelector'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import IconButton from 'pages/common/components/button/IconButton'
import {useAIAgentMessageEvents} from 'pages/tickets/detail/hooks/useAIAgentMessageEvents'
import TicketTag from 'pages/common/components/TicketTag'

import ReportIssueSelect from './ReportIssueSelect'
import css from './AIAgentFeedbackBar.less'
import {TicketEventEnum} from './types'
import TicketEvent from './TicketEvent'

export const FEEDBACK_TICKET_SUMMARY_TEST_ID = 'feedback-bar'
export const FEEDBACK_MESSAGE_CONTAINER_TEST_ID = 'feedback-message-container'
export const FEEDBACK_MESSAGE_ACTIONS_TEST_ID = 'feedback-message-actions'
export const FEEDBACK_MESSAGE_GUIDANCE_TEST_ID = 'feedback-message-guidance'
export const FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID = 'feedback-message-knowledge'

const AIAgentFeedbackBar = () => {
    const [reportIssues, setReportIssues] = useState<ReportIssueOption[]>([])

    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const {data} = useGetAiAgentFeedback(selectedAIMessage?.ticket_id || 0, {
        refetchOnWindowFocus: false,
        enabled: !!selectedAIMessage,
    })

    const ticketFeedback = data?.data

    const messageFeedback = selectedAIMessage
        ? ticketFeedback?.messages?.find(
              (messageFeedback) =>
                  messageFeedback.messageId === selectedAIMessage.id
          )
        : null

    useEffect(() => {
        if (messageFeedback?.reportedIssues) {
            setReportIssues(messageFeedback?.reportedIssues)
        }
    }, [messageFeedback])

    const {tags, action} = useAIAgentMessageEvents(selectedAIMessage)

    if (!messageFeedback) {
        return (
            <div data-testid={FEEDBACK_TICKET_SUMMARY_TEST_ID}>
                Generic data for ticket
            </div>
        )
    }

    return (
        <div
            className={css.container}
            data-testid={FEEDBACK_MESSAGE_CONTAINER_TEST_ID}
        >
            <div className={css.title}>Improve AI Agent responses</div>
            <div className={css.summary}>{messageFeedback?.summary}</div>
            {messageFeedback?.actions && messageFeedback?.actions.length > 0 && (
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
            )}
            {messageFeedback?.guidance && messageFeedback.guidance.length > 0 && (
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
            )}
            {messageFeedback?.knowledge &&
                messageFeedback?.knowledge.length > 0 && (
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
                                    <i className="material-icons">
                                        open_in_new
                                    </i>
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
                )}
            {messageFeedback?.orders?.[0]?.id && (
                <div className={css.orderContainer}>
                    <div className={css.subtitle}>Order data</div>
                    <div className={css.order}>
                        <div>#{messageFeedback?.orders[0].id}</div>
                        <i className="material-icons">open_in_new</i>
                    </div>
                </div>
            )}
            {(tags.length > 0 || !!action) && (
                <div className={css.ticketEventsContainer}>
                    <div className={css.subtitle}>Ticket events</div>
                    {tags.length > 0 && (
                        <div className={css.eventTypeContainer}>
                            <TicketEvent
                                eventType={TicketEventEnum.TAGGED}
                                isFirst
                                isLast={action === null}
                            >
                                {tags.map((tag) => (
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
                    {!!action && (
                        <TicketEvent
                            isFirst={tags.length === 0}
                            isLast
                            eventType={action}
                        />
                    )}
                </div>
            )}
            <div className={css.reportIssueContainer}>
                <ReportIssueSelect
                    value={reportIssues}
                    onChange={setReportIssues}
                />
            </div>
        </div>
    )
}

export default AIAgentFeedbackBar
