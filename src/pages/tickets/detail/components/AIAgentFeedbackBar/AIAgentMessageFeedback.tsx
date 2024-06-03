import React, {useEffect, useState} from 'react'
import {fromJS} from 'immutable'
import classNames from 'classnames'

import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {MessageFeedback} from 'models/aiAgentFeedback/types'

import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'

import IconButton from 'pages/common/components/button/IconButton'
import TicketTag from 'pages/common/components/TicketTag'

import useAppSelector from 'hooks/useAppSelector'

import {useAIAgentMessageEvents} from '../../hooks/useAIAgentMessageEvents'

import ReportIssueSelect from './ReportIssueSelect'
import TicketEvent from './TicketEvent'

import {TicketEventEnum} from './types'

import css from './AIAgentFeedbackBar.less'

export const FEEDBACK_MESSAGE_ACTIONS_TEST_ID = 'feedback-message-actions'
export const FEEDBACK_MESSAGE_GUIDANCE_TEST_ID = 'feedback-message-guidance'
export const FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID = 'feedback-message-knowledge'

type Props = {
    messageFeedback?: MessageFeedback
}

const AIAgentMessageFeedback: React.FC<Props> = ({messageFeedback}) => {
    const [reportIssues, setReportIssues] = useState<ReportIssueOption[]>([])

    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const {tags, action} = useAIAgentMessageEvents(selectedAIMessage)

    useEffect(() => {
        if (messageFeedback?.reportedIssues) {
            setReportIssues(messageFeedback?.reportedIssues)
        }
    }, [messageFeedback])

    return (
        <>
            {messageFeedback?.actions && messageFeedback?.actions.length > 0 && (
                <div className={css.sectionContainer}>
                    <div className={css.subtitle}>Actions</div>
                    {messageFeedback?.actions?.map((action) => (
                        <div
                            className={classNames(css.section, css.clickable)}
                            key={action.id}
                            data-testid={FEEDBACK_MESSAGE_ACTIONS_TEST_ID}
                        >
                            <div className={css.sectionText}>
                                <div>{action.name}</div>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.openIcon
                                    )}
                                >
                                    open_in_new
                                </i>
                            </div>
                            <div className={css.feedback}>
                                <IconButton
                                    fillStyle="fill"
                                    intent="secondary"
                                    size="small"
                                    iconClassName={
                                        action.feedback === 'thumbs_up'
                                            ? 'material-icons'
                                            : 'material-icons-outlined'
                                    }
                                    className={classNames({
                                        [css.positiveFeedback]:
                                            action.feedback === 'thumbs_up',
                                    })}
                                >
                                    thumb_up
                                </IconButton>
                                <IconButton
                                    fillStyle="fill"
                                    intent="secondary"
                                    size="small"
                                    iconClassName={
                                        action.feedback === 'thumbs_down'
                                            ? 'material-icons'
                                            : 'material-icons-outlined'
                                    }
                                    className={classNames({
                                        [css.negativeFeedback]:
                                            action.feedback === 'thumbs_down',
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
                            className={classNames(css.section, css.clickable)}
                            key={guidance.id}
                            data-testid={FEEDBACK_MESSAGE_GUIDANCE_TEST_ID}
                        >
                            <div className={css.sectionText}>
                                <div>{guidance.name}</div>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.openIcon
                                    )}
                                >
                                    open_in_new
                                </i>
                            </div>
                            <div className={css.feedback}>
                                <IconButton
                                    fillStyle="fill"
                                    intent="secondary"
                                    size="small"
                                    iconClassName={
                                        guidance.feedback === 'thumbs_up'
                                            ? 'material-icons'
                                            : 'material-icons-outlined'
                                    }
                                    className={classNames({
                                        [css.positiveFeedback]:
                                            guidance.feedback === 'thumbs_up',
                                    })}
                                >
                                    thumb_up
                                </IconButton>
                                <IconButton
                                    fillStyle="fill"
                                    intent="secondary"
                                    size="small"
                                    iconClassName={
                                        guidance.feedback === 'thumbs_down'
                                            ? 'material-icons'
                                            : 'material-icons-outlined'
                                    }
                                    className={classNames({
                                        [css.negativeFeedback]:
                                            guidance.feedback === 'thumbs_down',
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
                                className={classNames(
                                    css.section,
                                    css.clickable
                                )}
                                key={knowledge.id}
                                data-testid={FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID}
                            >
                                <div className={css.sectionText}>
                                    <div>{knowledge.name}</div>
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.openIcon
                                        )}
                                    >
                                        open_in_new
                                    </i>
                                </div>
                                <div className={css.feedback}>
                                    <IconButton
                                        fillStyle="fill"
                                        intent="secondary"
                                        size="small"
                                        iconClassName={
                                            knowledge.feedback === 'thumbs_up'
                                                ? 'material-icons'
                                                : 'material-icons-outlined'
                                        }
                                        className={classNames({
                                            [css.positiveFeedback]:
                                                knowledge.feedback ===
                                                'thumbs_up',
                                        })}
                                    >
                                        thumb_up
                                    </IconButton>
                                    <IconButton
                                        fillStyle="fill"
                                        intent="secondary"
                                        size="small"
                                        iconClassName={
                                            knowledge.feedback === 'thumbs_down'
                                                ? 'material-icons'
                                                : 'material-icons-outlined'
                                        }
                                        className={classNames({
                                            [css.negativeFeedback]:
                                                knowledge.feedback ===
                                                'thumbs_down',
                                        })}
                                    >
                                        thumb_down
                                    </IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            {messageFeedback?.orders && (
                <div className={css.orderContainer}>
                    <div className={css.subtitle}>Order data</div>
                    {messageFeedback?.orders.map((order) => (
                        <div key={order.id} className={css.order}>
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
        </>
    )
}

export default AIAgentMessageFeedback
