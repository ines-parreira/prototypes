import React, {useEffect, useMemo, useState} from 'react'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {ReportIssueOption} from 'models/aiAgentFeedback/constants'
import {
    DeleteMessageFeedback,
    Feedback,
    FeedbackOnResource,
    SubmitMessageFeedback,
    isIssueFeedbackOnMessage,
    MessageFeedback,
    Knowledge,
    Guidance,
    Action,
    ResourceFeedbackOnMessage,
} from 'models/aiAgentFeedback/types'

import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'

import IconButton from 'pages/common/components/button/IconButton'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'

import {FeatureFlagKey} from 'config/featureFlags'

import {useAIAgentResourcesWithFeedback} from '../../hooks/useAIAgentResourcesWithFeedback'
import {useAIAgentSendFeedback} from '../../hooks/useAIAgentSendFeedback'

import {getActionUrl, getGuidanceUrl, getKnowledgeUrl} from './utils'

import FeedbackOrders from './FeedbackOrders'
import FeedbackEvents from './FeedbackEvents'
import FeedbackReportIssue from './FeedbackReportIssue'
import FeedbackCreateResource from './FeedbackCreateResource'
import FeedbackOtherResourcesSelect from './FeedbackOtherResourcesSelect'

import css from './AIAgentFeedbackBar.less'

export const FEEDBACK_MESSAGE_ACTIONS_TEST_ID = 'feedback-message-actions'
export const FEEDBACK_MESSAGE_GUIDANCE_TEST_ID = 'feedback-message-guidance'
export const FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID = 'feedback-message-knowledge'

type FeedbackResourceSectionProps = {
    resource: (Knowledge | Guidance | Action) & {feedback: Feedback}
    resourceType: FeedbackOnResource['resourceType']
    handleSubmitFeedback: (
        resourceId: number | string,
        resourceType: FeedbackOnResource['resourceType'],
        feedback: Feedback
    ) => void
    href?: string
    dataTestId?: string
}

const FeedbackResourceSection: React.FC<FeedbackResourceSectionProps> = ({
    resource,
    resourceType,
    handleSubmitFeedback,
    href,
    dataTestId,
}) => {
    const hasAgentPrivileges = useHasAgentPrivileges()

    return (
        <a
            href={hasAgentPrivileges ? href : undefined}
            target="_blank"
            rel="noreferrer noopener"
            className={classNames(css.section, {
                [css.clickable]: hasAgentPrivileges,
            })}
            data-testid={dataTestId}
        >
            <div className={css.sectionText}>
                <div className={css.text}>{resource.name}</div>
                <i className={classNames('material-icons', css.openIcon)}>
                    open_in_new
                </i>
            </div>
            <div className={css.feedback}>
                <IconButton
                    fillStyle="fill"
                    intent="secondary"
                    size="small"
                    iconClassName={
                        resource.feedback === 'thumbs_up'
                            ? 'material-icons'
                            : 'material-icons-outlined'
                    }
                    className={classNames({
                        [css.positiveFeedback]:
                            resource.feedback === 'thumbs_up',
                    })}
                    onClick={(ev) => {
                        ev.preventDefault()

                        if (resource.feedback === 'thumbs_up') {
                            return
                        }

                        handleSubmitFeedback(
                            resource.id,
                            resourceType,
                            'thumbs_up'
                        )
                    }}
                    title="Mark as Correct"
                >
                    thumb_up
                </IconButton>
                <IconButton
                    fillStyle="fill"
                    intent="secondary"
                    size="small"
                    iconClassName={
                        resource.feedback === 'thumbs_down'
                            ? 'material-icons'
                            : 'material-icons-outlined'
                    }
                    className={classNames({
                        [css.negativeFeedback]:
                            resource.feedback === 'thumbs_down',
                    })}
                    onClick={(ev) => {
                        ev.preventDefault()

                        if (resource.feedback === 'thumbs_down') {
                            return
                        }

                        handleSubmitFeedback(
                            resource.id,
                            resourceType,
                            'thumbs_down'
                        )
                    }}
                    title="Mark as Incorrect"
                >
                    thumb_down
                </IconButton>
            </div>
        </a>
    )
}

type Props = {
    messageFeedback: MessageFeedback
}

const AIAgentMessageFeedback: React.FC<Props> = ({messageFeedback}) => {
    const isFeedbackToAiAgentV3Enabled =
        useFlags()[FeatureFlagKey.FeedbackToAIAgentInTicketViewsV3]

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

    const otherResourcesInitial = useMemo(
        () =>
            messageFeedback?.feedbackOnMessage
                ?.filter(
                    (feedback) =>
                        !isIssueFeedbackOnMessage(feedback) &&
                        feedback.type === 'resource'
                )
                .map((resource) => resource) || [],
        [messageFeedback]
    )

    const {actions, guidance, knowledge} =
        useAIAgentResourcesWithFeedback(messageFeedback)

    useEffect(() => {
        if (
            messageFeedback?.feedbackOnMessage &&
            messageFeedback.feedbackOnMessage.length > 0
        ) {
            setReportIssues(issues.map((resource) => resource.feedback))
        } else {
            setReportIssues([])
        }
    }, [messageFeedback, issues])

    const handleSubmitFeedback = (
        resourceId: number | string,
        resourceType: FeedbackOnResource['resourceType'],
        feedback: Feedback
    ) => {
        const payload: SubmitMessageFeedback = {
            feedbackOnMessage: [],
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
            feedbackOnResource: [],
            feedbackOnMessage: newIssues.map((issue) => ({
                type: 'issue',
                feedback: issue,
            })),
        }

        const payloadForDelete: DeleteMessageFeedback = {
            feedbackOnResource: [],
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
            feedbackOnResource: [],
            feedbackOnMessage: items.map((item) => ({
                type: 'issue',
                feedback: item,
            })),
        }

        if (selectedAIMessage) {
            void deleteFeedback(selectedAIMessage, payload)
        }
    }

    const handleSubmitOtherResources = (
        resources: ResourceFeedbackOnMessage[]
    ) => {
        const payload: SubmitMessageFeedback = {
            feedbackOnMessage: resources,
            feedbackOnResource: [],
        }

        if (selectedAIMessage) {
            void submitFeedback(selectedAIMessage, payload)
        }
    }

    const handleDeleteOtherResources = (
        resources: ResourceFeedbackOnMessage[]
    ) => {
        const payload: DeleteMessageFeedback = {
            feedbackOnMessage: resources,
            feedbackOnResource: [],
        }

        if (selectedAIMessage) {
            void deleteFeedback(selectedAIMessage, payload)
        }
    }

    return (
        <>
            <HelpCenterApiClientProvider>
                <FeedbackOrders orders={messageFeedback?.orders} />
                <div className={css.lineSeparator} />
                {actions && actions.length > 0 && (
                    <div className={css.sectionContainer}>
                        <div className={css.subtitle}>Actions</div>
                        {actions?.map((action) => (
                            <FeedbackResourceSection
                                key={action.id}
                                resource={action}
                                resourceType="action"
                                handleSubmitFeedback={handleSubmitFeedback}
                                href={getActionUrl(
                                    action,
                                    messageFeedback.shopType,
                                    messageFeedback.shopName
                                )}
                                dataTestId={FEEDBACK_MESSAGE_ACTIONS_TEST_ID}
                            />
                        ))}
                    </div>
                )}
                {guidance && guidance.length > 0 && (
                    <div className={css.sectionContainer}>
                        <div className={css.subtitle}>Guidance</div>
                        {guidance?.map((guidance) => (
                            <FeedbackResourceSection
                                key={guidance.id}
                                resource={guidance}
                                resourceType="guidance"
                                handleSubmitFeedback={handleSubmitFeedback}
                                href={getGuidanceUrl(
                                    guidance,
                                    messageFeedback.shopType,
                                    messageFeedback.shopName
                                )}
                                dataTestId={FEEDBACK_MESSAGE_GUIDANCE_TEST_ID}
                            />
                        ))}
                    </div>
                )}
                {knowledge && knowledge.length > 0 && (
                    <div className={css.sectionContainer}>
                        <div className={css.subtitle}>Knowledge</div>
                        {knowledge?.map((knowledge) => (
                            <FeedbackResourceSection
                                key={knowledge.id}
                                resource={knowledge}
                                resourceType={knowledge.type}
                                handleSubmitFeedback={handleSubmitFeedback}
                                href={getKnowledgeUrl(knowledge)}
                                dataTestId={FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID}
                            />
                        ))}
                    </div>
                )}
                {isFeedbackToAiAgentV3Enabled && (
                    <FeedbackOtherResourcesSelect
                        helpCenterId={messageFeedback.helpCenterId}
                        guidanceHelpCenterId={
                            messageFeedback.guidanceHelpCenterId
                        }
                        snippetHelpCenterId={
                            messageFeedback.snippetHelpCenterId
                        }
                        shopName={messageFeedback.shopName}
                        shopType={messageFeedback.shopType}
                        onSubmit={handleSubmitOtherResources}
                        onRemove={handleDeleteOtherResources}
                        initialValues={otherResourcesInitial}
                    />
                )}
                <FeedbackCreateResource
                    shopType={messageFeedback.shopType}
                    shopName={messageFeedback.shopName}
                    helpCenterId={messageFeedback.helpCenterId}
                />
                <FeedbackReportIssue
                    value={reportIssues}
                    onChange={setReportIssues}
                    onClose={handleSubmitReportIssues}
                    onRemove={handleDeleteReportIssues}
                />
                <div className={css.lineSeparator} />
                <FeedbackEvents
                    messages={selectedAIMessage ? [selectedAIMessage] : []}
                    shopType={messageFeedback.shopType}
                    shopName={messageFeedback.shopName}
                />
                <div className={css.executionId}>
                    {messageFeedback.executionId}
                </div>
            </HelpCenterApiClientProvider>
        </>
    )
}

export default AIAgentMessageFeedback
