import React, {useEffect, useMemo, useState} from 'react'
import classNames from 'classnames'

import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {
    DeleteMessageFeedback,
    Feedback,
    FeedbackOnResource,
    SubmitMessageFeedback,
    isIssueFeedbackOnMessage,
    MessageFeedback,
} from 'models/aiAgentFeedback/types'

import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'

import IconButton from 'pages/common/components/button/IconButton'

import useAppSelector from 'hooks/useAppSelector'

import {useAIAgentResources} from '../../hooks/useAIAgentResources'
import {useAIAgentSendFeedback} from '../../hooks/useAIAgentSendFeedback'

import {getActionUrl, getGuidanceUrl, getKnowledgeUrl} from './utils'

import ReportIssueSelect from './ReportIssueSelect'

import FeedbackOrders from './FeedbackOrders'
import FeedbackEvents from './FeedbackEvents'

import css from './AIAgentFeedbackBar.less'

export const FEEDBACK_MESSAGE_ACTIONS_TEST_ID = 'feedback-message-actions'
export const FEEDBACK_MESSAGE_GUIDANCE_TEST_ID = 'feedback-message-guidance'
export const FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID = 'feedback-message-knowledge'

type Props = {
    messageFeedback: MessageFeedback
}

const AIAgentMessageFeedback: React.FC<Props> = ({messageFeedback}) => {
    const [reportIssues, setReportIssues] = useState<ReportIssueOption[]>([])

    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const {
        aiAgentSendFeedback: submitFeedback,
        aiAgentDeleteFeedback: deleteFeedback,
    } = useAIAgentSendFeedback()

    const issues = useMemo(
        () =>
            messageFeedback?.feedbackOnMessage?.filter(
                isIssueFeedbackOnMessage
            ) || [],
        [messageFeedback]
    )

    const {actions, guidance, knowledge} = useAIAgentResources(messageFeedback)

    useEffect(() => {
        if (
            messageFeedback?.feedbackOnMessage &&
            messageFeedback.feedbackOnMessage.length > 0
        ) {
            setReportIssues(issues.map((resource) => resource.feedback))
        }
    }, [messageFeedback, issues])

    const handleSubmitFeedback = (
        resourceId: number,
        resourceType: FeedbackOnResource['resourceType'],
        feedback: Feedback
    ) => {
        const payload: SubmitMessageFeedback = {
            feedbackOnResource: [
                {resourceId, resourceType, type: 'binary', feedback},
            ],
        }

        if (selectedAIMessage) {
            void submitFeedback(selectedAIMessage, payload)
        }
    }

    const handleSubmitReportIssues = () => {
        const newIssues = reportIssues.filter(
            (issue) => !issues.map((issue) => issue.feedback).includes(issue)
        )
        const payload: SubmitMessageFeedback = {
            feedbackOnMessage: newIssues.map((issue) => ({
                type: 'issue',
                feedback: issue,
            })),
        }

        const payloadForDelete: DeleteMessageFeedback = {
            feedbackOnMessage: issues
                .filter((issue) => !reportIssues.includes(issue.feedback))
                .map((issue) => ({
                    type: 'issue',
                    feedback: issue.feedback,
                })),
        }

        if (selectedAIMessage) {
            if (newIssues.length > 0) {
                void submitFeedback(selectedAIMessage, payload)
            }

            if (payloadForDelete.feedbackOnMessage.length > 0) {
                void deleteFeedback(selectedAIMessage, payloadForDelete)
            }
        }
    }

    const handleDeleteReportIssues = (items: ReportIssueOption[]) => {
        const payload: DeleteMessageFeedback = {
            feedbackOnMessage: items.map((item) => ({
                type: 'issue',
                feedback: item,
            })),
        }

        if (selectedAIMessage) {
            void deleteFeedback(selectedAIMessage, payload)
        }
    }

    return (
        <>
            {actions && actions.length > 0 && (
                <div className={css.sectionContainer}>
                    <div className={css.subtitle}>Actions</div>
                    {actions?.map((action) => (
                        <a
                            key={action.id}
                            href={getActionUrl(
                                action,
                                messageFeedback.shopType,
                                messageFeedback.shopName
                            )}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={classNames(css.section, css.clickable)}
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
                                    onClick={() =>
                                        handleSubmitFeedback(
                                            action.id,
                                            'action',
                                            action.feedback === 'thumbs_up'
                                                ? null
                                                : 'thumbs_up'
                                        )
                                    }
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
                                    onClick={() =>
                                        handleSubmitFeedback(
                                            action.id,
                                            'action',
                                            action.feedback === 'thumbs_down'
                                                ? null
                                                : 'thumbs_down'
                                        )
                                    }
                                >
                                    thumb_down
                                </IconButton>
                            </div>
                        </a>
                    ))}
                </div>
            )}
            {guidance && guidance.length > 0 && (
                <div className={css.sectionContainer}>
                    <div className={css.subtitle}>Guidance</div>
                    {guidance?.map((guide) => (
                        <a
                            key={guide.id}
                            href={getGuidanceUrl(
                                guide,
                                messageFeedback.shopType,
                                messageFeedback.shopName
                            )}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={classNames(css.section, css.clickable)}
                            data-testid={FEEDBACK_MESSAGE_GUIDANCE_TEST_ID}
                        >
                            <div className={css.sectionText}>
                                <div>{guide.name}</div>
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
                                        guide.feedback === 'thumbs_up'
                                            ? 'material-icons'
                                            : 'material-icons-outlined'
                                    }
                                    className={classNames({
                                        [css.positiveFeedback]:
                                            guide.feedback === 'thumbs_up',
                                    })}
                                    onClick={() =>
                                        handleSubmitFeedback(
                                            guide.id,
                                            'guidance',
                                            guide.feedback === 'thumbs_up'
                                                ? null
                                                : 'thumbs_up'
                                        )
                                    }
                                >
                                    thumb_up
                                </IconButton>
                                <IconButton
                                    fillStyle="fill"
                                    intent="secondary"
                                    size="small"
                                    iconClassName={
                                        guide.feedback === 'thumbs_down'
                                            ? 'material-icons'
                                            : 'material-icons-outlined'
                                    }
                                    className={classNames({
                                        [css.negativeFeedback]:
                                            guide.feedback === 'thumbs_down',
                                    })}
                                    onClick={() =>
                                        handleSubmitFeedback(
                                            guide.id,
                                            'guidance',
                                            guide.feedback === 'thumbs_down'
                                                ? null
                                                : 'thumbs_down'
                                        )
                                    }
                                >
                                    thumb_down
                                </IconButton>
                            </div>
                        </a>
                    ))}
                </div>
            )}
            {knowledge && knowledge.length > 0 && (
                <div className={css.sectionContainer}>
                    <div className={css.subtitle}>Knowledge</div>
                    {knowledge?.map((knowledge) => (
                        <a
                            key={knowledge.id}
                            href={getKnowledgeUrl(
                                knowledge,
                                messageFeedback.shopType,
                                messageFeedback.shopName
                            )}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={classNames(css.section, css.clickable)}
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
                                            knowledge.feedback === 'thumbs_up',
                                    })}
                                    onClick={() =>
                                        handleSubmitFeedback(
                                            knowledge.id,
                                            knowledge.type,
                                            knowledge.feedback === 'thumbs_up'
                                                ? null
                                                : 'thumbs_up'
                                        )
                                    }
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
                                    onClick={() =>
                                        handleSubmitFeedback(
                                            knowledge.id,
                                            knowledge.type,
                                            knowledge.feedback === 'thumbs_down'
                                                ? null
                                                : 'thumbs_down'
                                        )
                                    }
                                >
                                    thumb_down
                                </IconButton>
                            </div>
                        </a>
                    ))}
                </div>
            )}
            <FeedbackOrders orders={messageFeedback?.orders} />
            <FeedbackEvents
                messages={selectedAIMessage ? [selectedAIMessage] : []}
                shopType={messageFeedback.shopType}
                shopName={messageFeedback.shopName}
            />
            <div className={css.reportIssueContainer}>
                <ReportIssueSelect
                    value={reportIssues}
                    onChange={setReportIssues}
                    onClose={handleSubmitReportIssues}
                    onRemove={handleDeleteReportIssues}
                />
            </div>
        </>
    )
}

export default AIAgentMessageFeedback
