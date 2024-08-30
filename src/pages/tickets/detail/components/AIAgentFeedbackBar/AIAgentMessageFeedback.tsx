import React, {useEffect, useMemo, useState} from 'react'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {Tooltip} from '@gorgias/ui-kit'
import {useCookies} from 'react-cookie'
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
    NoteFeedbackOnMessage,
} from 'models/aiAgentFeedback/types'

import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'

import IconButton from 'pages/common/components/button/IconButton'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'

import {FeatureFlagKey} from 'config/featureFlags'

import {getAgentMessageFeedbackStatus} from 'state/agents/selectors'
import {useAIAgentResourcesWithFeedback} from '../../hooks/useAIAgentResourcesWithFeedback'
import {useAIAgentSendFeedback} from '../../hooks/useAIAgentSendFeedback'

import {getActionUrl, getGuidanceUrl, getKnowledgeUrl} from './utils'

import FeedbackOrders from './FeedbackOrders'
import FeedbackEvents from './FeedbackEvents'
import FeedbackReportIssue from './FeedbackReportIssue'
import FeedbackCreateResource from './FeedbackCreateResource'
import FeedbackOtherResourcesSelect from './FeedbackOtherResourcesSelect'

import css from './AIAgentFeedbackBar.less'
import InfoIconWithTooltip from './InfoIconWithTooltip'
import FeedbackNote from './FeedbackNote'
import FeedbackStatusBadge from './FeedbackStatusBadge'
import {FeedbackStatus, ResourceSection} from './types'

export const FEEDBACK_MESSAGE_ACTIONS_TEST_ID = 'feedback-message-actions'
export const FEEDBACK_MESSAGE_GUIDANCE_TEST_ID = 'feedback-message-guidance'
export const FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID = 'feedback-message-knowledge'

type FeedbackResourceSectionProps = {
    resource: (Knowledge | Guidance | Action) & {feedback: Feedback}
    resourceType: FeedbackOnResource['resourceType']
    resourceSection: ResourceSection
    handleSubmitFeedback: (
        resourceId: number | string,
        resourceType: FeedbackOnResource['resourceType'],
        feedback: Feedback,
        resourceSection?: ResourceSection
    ) => void
    href?: string
    dataTestId?: string
    resourceId: number | string
}

type FeedbackSectionTitleContainerProps = {
    resourceSection: ResourceSection
    messageFeedbackStatus: Record<ResourceSection, FeedbackStatus>
}
const FeedbackSectionTitleContainer = ({
    messageFeedbackStatus,
    resourceSection,
}: FeedbackSectionTitleContainerProps) => {
    if (!messageFeedbackStatus || !messageFeedbackStatus[resourceSection]) {
        return null
    }

    return (
        <div className={css.sectionWithBadge}>
            <div className={css.subtitle}>{resourceSection}</div>
            <FeedbackStatusBadge
                status={messageFeedbackStatus[resourceSection]}
                resourceSection={resourceSection}
            />
        </div>
    )
}

export const TOOLTIP_COOKIE_NAME =
    'helpdesk-show-ticket-ai-agent-message-feedback-tooltip'

export const FeedbackResourceSection: React.FC<FeedbackResourceSectionProps> =
    ({
        resource,
        resourceType,
        resourceSection,
        handleSubmitFeedback,
        href,
        dataTestId,
        resourceId,
    }) => {
        const hasAgentPrivileges = useHasAgentPrivileges()
        const [cookies, setCookie] = useCookies([TOOLTIP_COOKIE_NAME])

        const handleClick = (ev: React.MouseEvent, buttonType: Feedback) => {
            ev.preventDefault()

            if (resource.feedback === buttonType) {
                return
            }

            handleSubmitFeedback(
                resource.id,
                resourceType,
                buttonType,
                resourceSection
            )
        }

        const handleBlur = () => {
            if (!cookies[TOOLTIP_COOKIE_NAME]) {
                setCookie(TOOLTIP_COOKIE_NAME, true)
            }
        }

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
                            handleClick(ev, 'thumbs_up')
                        }}
                        onBlur={handleBlur}
                        title="Mark as Correct"
                        id={`thumbs_up-${resourceId}-${resourceType}`}
                    >
                        thumb_up
                    </IconButton>
                    {!cookies[TOOLTIP_COOKIE_NAME] && (
                        <Tooltip
                            target={`thumbs_up-${resourceId}-${resourceType}`}
                            placement="bottom-start"
                            className={css.tooltip}
                            data-testid={`thumbs_up-${resourceId}`}
                            trigger={['click']}
                        >
                            Thanks for the feedback! AI Agent will be{' '}
                            <span className={css.tooltipSpecialText}>
                                more likely
                            </span>{' '}
                            to use this on similar tickets in future
                        </Tooltip>
                    )}
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
                            handleClick(ev, 'thumbs_down')
                        }}
                        onBlur={handleBlur}
                        title="Mark as Incorrect"
                        id={`thumbs-down-${resourceId}-${resourceType}`}
                    >
                        thumb_down
                    </IconButton>
                    {!cookies[TOOLTIP_COOKIE_NAME] && (
                        <Tooltip
                            target={`thumbs-down-${resourceId}-${resourceType}`}
                            placement="bottom-start"
                            className={css.tooltip}
                            data-testid={`thumbs-down-${resourceId}`}
                            trigger={['click']}
                        >
                            Thanks for the feedback! AI Agent will be{' '}
                            <span className={css.tooltipSpecialText}>
                                less likely
                            </span>{' '}
                            to use this on similar tickets in future
                        </Tooltip>
                    )}
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

    const noteInitial = useMemo(() => {
        const feedbackOnMessage = messageFeedback?.feedbackOnMessage

        const noteFeedbackMessage = feedbackOnMessage.filter(
            (feedback): feedback is NoteFeedbackOnMessage =>
                feedback.type === 'note'
        )

        return noteFeedbackMessage[0]?.feedback ?? ''
    }, [messageFeedback])

    const {actions, guidance, knowledge} =
        useAIAgentResourcesWithFeedback(messageFeedback)

    const messageFeedbackStatus = useAppSelector((state) =>
        getAgentMessageFeedbackStatus(state)
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
        resourceSection?: ResourceSection
    ) => {
        const payload: SubmitMessageFeedback = {
            feedbackOnMessage: [],
            feedbackOnResource: [
                {resourceId, resourceType, type: 'binary', feedback},
            ],
        }

        if (selectedAIMessage) {
            void submitFeedback(selectedAIMessage, payload, resourceSection)
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

    const buildSubmitMessageFeedback = (
        feedback: string
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
                <div className={css.subsectionTitle}>
                    Feedback
                    <InfoIconWithTooltip
                        id="tooltip-message-feedback"
                        tooltipProps={{autohide: true, placement: 'bottom'}}
                    >
                        <>
                            Provide feedback on the resources AI Agent used to
                            improve future responses:
                            <br /> 1. Use thumbs up/down to indicate if AI Agent
                            used the right resource
                            <br /> 2. Edit a resource if it didn’t work as
                            expected
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
                                        messageFeedback.shopName
                                    )}
                                    dataTestId={
                                        FEEDBACK_MESSAGE_ACTIONS_TEST_ID
                                    }
                                    resourceId={action.id}
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
                                        messageFeedback.shopName
                                    )}
                                    dataTestId={
                                        FEEDBACK_MESSAGE_GUIDANCE_TEST_ID
                                    }
                                    resourceId={guidance.id}
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
                                    href={getKnowledgeUrl(knowledge)}
                                    dataTestId={
                                        FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID
                                    }
                                    resourceId={knowledge.id}
                                />
                            ))}
                        </div>
                    )}
                    <div>
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
                    </div>
                    <FeedbackReportIssue
                        value={reportIssues}
                        onChange={setReportIssues}
                        onClose={handleSubmitReportIssues}
                        onRemove={handleDeleteReportIssues}
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
