import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import { useFeedbackTracking } from '@repo/ai-agent'
import { logEventWithSampling, SegmentEvent } from '@repo/logging'

import useAppSelector from 'hooks/useAppSelector'
import type { ReportIssueOption } from 'models/aiAgentFeedback/constants'
import type {
    DeleteMessageFeedback,
    Feedback,
    FeedbackOnResource,
    MessageFeedback,
    NoteFeedbackOnMessage,
    ResourceFeedbackOnMessage,
    SubmitMessageFeedback,
} from 'models/aiAgentFeedback/types'
import { isIssueFeedbackOnMessage } from 'models/aiAgentFeedback/types'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { getAgentMessageFeedbackStatus } from 'state/agents/selectors'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'

import InfoIconWithTooltip from '../../../common/components/InfoIconWithTooltip'
import { useAIAgentResourcesWithFeedback } from '../../hooks/useAIAgentResourcesWithFeedback'
import { useAIAgentSendFeedback } from '../../hooks/useAIAgentSendFeedback'
import FeedbackCreateResource from './FeedbackCreateResource'
import FeedbackEvents from './FeedbackEvents'
import FeedbackNote from './FeedbackNote'
import FeedbackOrders from './FeedbackOrders'
import FeedbackOtherResourcesSelect from './FeedbackOtherResourcesSelect'
import FeedbackReportIssue from './FeedbackReportIssue'
import { FeedbackResourceSection } from './FeedbackResourceSection'
import FeedbackStatusBadge from './FeedbackStatusBadge'
import type { FeedbackStatus } from './types'
import { ResourceSection } from './types'
import { getActionUrl, getGuidanceUrl, getKnowledgeUrl } from './utils'

import css from './AIAgentFeedbackBar.less'

export const FEEDBACK_MESSAGE_ACTIONS_TEST_ID = 'feedback-message-actions'
export const FEEDBACK_MESSAGE_GUIDANCE_TEST_ID = 'feedback-message-guidance'
export const FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID = 'feedback-message-knowledge'

type FeedbackSectionTitleContainerProps = {
    resourceSection: ResourceSection
    messageFeedbackStatus: Record<ResourceSection, FeedbackStatus>
}
const FeedbackSectionTitleContainer = ({
    messageFeedbackStatus,
    resourceSection,
}: FeedbackSectionTitleContainerProps) => {
    return (
        <div className={css.sectionWithBadge}>
            <div className={css.subtitle}>{resourceSection}</div>
            {messageFeedbackStatus &&
                messageFeedbackStatus[resourceSection] && (
                    <FeedbackStatusBadge
                        status={messageFeedbackStatus[resourceSection]}
                        resourceSection={resourceSection}
                    />
                )}
        </div>
    )
}

type Props = {
    messageFeedback: MessageFeedback
}

const AIAgentMessageFeedback: React.FC<Props> = ({ messageFeedback }) => {
    const [reportIssues, setReportIssues] = useState<ReportIssueOption[]>([])

    const selectedAIMessage = useAppSelector(getSelectedAIMessage)
    const accountId = useAppSelector(getCurrentAccountId)
    const ticket = useAppSelector(getTicketState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const ticketId: number = ticket.get('id')
    const userId: number = currentUser.get('id')

    const { onFeedbackGiven } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
    })

    const {
        aiAgentSendFeedback: submitFeedback,
        aiAgentDeleteFeedback: deleteFeedback,
    } = useAIAgentSendFeedback()

    const issues = useMemo(
        () =>
            messageFeedback?.feedbackOnMessage?.filter(
                isIssueFeedbackOnMessage,
            ) || [],
        [messageFeedback],
    )

    const otherResourcesInitial = useMemo(
        () =>
            messageFeedback?.feedbackOnMessage
                ?.filter(
                    (feedback) =>
                        !isIssueFeedbackOnMessage(feedback) &&
                        feedback.type === 'resource',
                )
                .map((resource) => resource) || [],
        [messageFeedback],
    )

    const noteInitial = useMemo(() => {
        const feedbackOnMessage = messageFeedback?.feedbackOnMessage

        const noteFeedbackMessage = feedbackOnMessage.filter(
            (feedback): feedback is NoteFeedbackOnMessage =>
                feedback.type === 'note',
        )

        return noteFeedbackMessage[0]?.feedback ?? ''
    }, [messageFeedback])

    const { actions, guidance, knowledge } =
        useAIAgentResourcesWithFeedback(messageFeedback)

    const messageFeedbackStatus = useAppSelector((state) =>
        getAgentMessageFeedbackStatus(state),
    )

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
        feedback: Feedback,
        resourceSection?: ResourceSection,
    ) => {
        const payload: SubmitMessageFeedback = {
            feedbackOnMessage: [],
            feedbackOnResource: [
                { resourceId, resourceType, type: 'binary', feedback },
            ],
        }

        if (selectedAIMessage) {
            void submitFeedback(selectedAIMessage, payload, resourceSection)
        }
    }

    const handleSubmitReportIssues = () => {
        const newIssues = reportIssues.filter(
            (issue) => !issues.map((issue) => issue.feedback).includes(issue),
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

    const buildSubmitMessageFeedback = (
        feedback: string,
    ): DeleteMessageFeedback => {
        return {
            feedbackOnResource: [],
            feedbackOnMessage: [
                {
                    type: 'note',
                    feedback,
                },
            ],
        }
    }

    const handleNoteFeedback = (e: React.ChangeEvent) => {
        const textContent = e.currentTarget?.textContent || ''
        const payload = buildSubmitMessageFeedback(textContent)

        if (selectedAIMessage) {
            if (textContent.length > 0) {
                void submitFeedback(selectedAIMessage, payload)

                onFeedbackGiven('internal-note')
            } else {
                const payloadForDelete = buildSubmitMessageFeedback('')
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
        resources: ResourceFeedbackOnMessage[],
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
        resources: ResourceFeedbackOnMessage[],
    ) => {
        const payload: DeleteMessageFeedback = {
            feedbackOnMessage: resources,
            feedbackOnResource: [],
        }

        if (selectedAIMessage) {
            void deleteFeedback(selectedAIMessage, payload)

            resources.forEach((resource) => {
                logEventWithSampling(
                    SegmentEvent.AiAgentFeedbackOtherReasonSelectRemoveOption,
                    {
                        accountId,
                        sourceType: resource.resourceType,
                    },
                )
            })
        }
    }

    return (
        <>
            <HelpCenterApiClientProvider>
                <FeedbackOrders orders={messageFeedback?.orders} />
                <div className={css.subsectionTitle}>
                    Review Knowledge used by AI Agent
                    <InfoIconWithTooltip
                        id="tooltip-message-feedback"
                        tooltipProps={{ autohide: true, placement: 'bottom' }}
                    >
                        <>
                            Reviewing helps Gorgias monitor how well AI Agent is
                            able to find the right knowledge sources for a
                            customer request.
                        </>
                    </InfoIconWithTooltip>
                </div>
                <div className={css.feedbackSection}>
                    {actions && actions.length > 0 && (
                        <div className={css.sectionContainer}>
                            <FeedbackSectionTitleContainer
                                messageFeedbackStatus={messageFeedbackStatus}
                                resourceSection={ResourceSection.ACTIONS}
                            />
                            {actions.map((action) => (
                                <FeedbackResourceSection
                                    key={action.id}
                                    resource={action}
                                    resourceType={action.type}
                                    resourceSection={ResourceSection.ACTIONS}
                                    handleSubmitFeedback={handleSubmitFeedback}
                                    href={getActionUrl(
                                        action,
                                        messageFeedback.shopType,
                                        messageFeedback.shopName,
                                    )}
                                    dataTestId={
                                        FEEDBACK_MESSAGE_ACTIONS_TEST_ID
                                    }
                                    resourceId={action.id}
                                    accountId={accountId}
                                />
                            ))}
                        </div>
                    )}
                    {guidance && guidance.length > 0 && (
                        <div className={css.sectionContainer}>
                            <FeedbackSectionTitleContainer
                                messageFeedbackStatus={messageFeedbackStatus}
                                resourceSection={ResourceSection.GUIDANCE}
                            />
                            {guidance.map((guidance) => (
                                <FeedbackResourceSection
                                    key={guidance.id}
                                    resource={guidance}
                                    resourceType="guidance"
                                    resourceSection={ResourceSection.GUIDANCE}
                                    handleSubmitFeedback={handleSubmitFeedback}
                                    href={getGuidanceUrl(
                                        guidance,
                                        messageFeedback.shopType,
                                        messageFeedback.shopName,
                                    )}
                                    dataTestId={
                                        FEEDBACK_MESSAGE_GUIDANCE_TEST_ID
                                    }
                                    resourceId={guidance.id}
                                    accountId={accountId}
                                />
                            ))}
                        </div>
                    )}
                    {knowledge && knowledge.length > 0 && (
                        <div className={css.sectionContainer}>
                            <FeedbackSectionTitleContainer
                                messageFeedbackStatus={messageFeedbackStatus}
                                resourceSection={ResourceSection.KNOWLEDGE}
                            />
                            {knowledge.map((knowledge) => (
                                <FeedbackResourceSection
                                    key={knowledge.id}
                                    resource={knowledge}
                                    resourceType={knowledge.type}
                                    resourceSection={ResourceSection.KNOWLEDGE}
                                    handleSubmitFeedback={handleSubmitFeedback}
                                    href={getKnowledgeUrl(
                                        knowledge,
                                        messageFeedback.shopType,
                                        messageFeedback.shopName,
                                    )}
                                    dataTestId={
                                        FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID
                                    }
                                    resourceId={knowledge.id}
                                    accountId={accountId}
                                />
                            ))}
                        </div>
                    )}
                    <div>
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
                            accountId={accountId}
                        />
                        <FeedbackCreateResource
                            shopType={messageFeedback.shopType}
                            shopName={messageFeedback.shopName}
                            helpCenterId={messageFeedback.helpCenterId}
                        />
                    </div>
                    <FeedbackReportIssue
                        value={reportIssues}
                        onChange={setReportIssues}
                        onClose={handleSubmitReportIssues}
                        onRemove={handleDeleteReportIssues}
                        accountId={accountId}
                    />
                    <FeedbackNote
                        onBlur={handleNoteFeedback}
                        value={noteInitial}
                    />
                </div>
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
