import { useCallback, useEffect, useMemo, useState } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import classNames from 'classnames'

import { Badge, LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { AiAgentMessageType } from 'models/aiAgentPlayground/types'
import {
    ReasoningResponseType,
    useGetMessageAiReasoning,
} from 'models/knowledgeService/queries'
import { TicketMessage } from 'models/ticket/types'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { isSessionImpersonated } from 'services/activityTracker/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { useFeedbackTracking } from '../AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useKnowledgeSourceSideBar } from '../AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { useGetResourcesReasoningMetadata } from '../AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'
import { AiAgentReasoningFeedback } from './AiAgentReasoningFeedback'
import { AiAgentReasoningContent } from './AiReasoningContent'
import { useReasoningTracking } from './hooks/useReasoningTracking'

import css from './AiAgentReasoning.less'

type AiAgentReasoningState =
    | 'loading'
    | 'collapsed'
    | 'expanded'
    | 'error'
    | 'static'
type AiAgentReasoningProps = {
    message: TicketMessage
}

export const coerceResourceType = (parts: string[]) => {
    const [resourceType, ...additionalParts] = parts

    switch (resourceType) {
        case 'action_execution':
            return AiAgentKnowledgeResourceTypeEnum.ACTION
        case 'product':
            const subType = additionalParts[1]
            if (subType === 'knowledge') {
                return AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE
            }
            if (subType === 'recommendation') {
                return AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION
            }
            return AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE
        default:
            return resourceType.toUpperCase() as AiAgentKnowledgeResourceTypeEnum
    }
}

export const parseReasoningResources = (
    content: string,
    resources: NonNullable<
        ReturnType<typeof useGetMessageAiReasoning>['data']
    >['resources'],
): KnowledgeReasoningResource[] => {
    return (content.match(/<<<(.*?)>>>/g) || [])
        .map((resourceString) => {
            const stringParts = resourceString
                .replace('<<<', '')
                .replace('>>>', '')
                .split('::')
            let metadata

            const resourceType = coerceResourceType(stringParts)

            switch (resourceType) {
                case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
                case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
                case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
                case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
                    metadata = resources.find(
                        (resource) =>
                            resource.resourceId === stringParts[2] &&
                            resource.resourceType === resourceType &&
                            resource.resourceSetId === stringParts[1],
                    )
                    return {
                        resourceType,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                        resourceTitle: metadata?.resourceTitle,
                    }
                case AiAgentKnowledgeResourceTypeEnum.ACTION:
                    metadata = resources.find(
                        (resource) =>
                            resource.resourceSetId === stringParts[1] &&
                            resource.resourceType === resourceType,
                    )
                    return {
                        resourceType,
                        resourceId: metadata?.resourceId || '',
                        resourceTitle: metadata?.resourceTitle,
                    }
                case AiAgentKnowledgeResourceTypeEnum.ORDER:
                case AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE:
                case AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION:
                    metadata = resources.find(
                        (resource) =>
                            resource.resourceId === stringParts[1] &&
                            resource.resourceType === resourceType,
                    )
                    return {
                        resourceType,
                        resourceId: stringParts[1],
                        resourceTitle: metadata?.resourceTitle,
                    }
                default:
                    return null
            }
        })
        .filter(
            (resource): resource is NonNullable<typeof resource> =>
                resource !== null,
        )
}

export const AiAgentReasoning = ({ message }: AiAgentReasoningProps) => {
    const [state, setState] = useState<AiAgentReasoningState>('collapsed')
    const [isRetriable] = useState(true)

    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)

    const isImpersonated = useMemo(() => isSessionImpersonated(), [])

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')
    const messageId = message.id || 0
    const isHandover =
        (message.meta as Record<string, unknown>)?.ai_agent_message_type ===
        AiAgentMessageType.HANDOVER_TO_AGENT

    const { activeTab, onChangeTab } = useTicketInfobarNavigation()

    const { openPreview } = useKnowledgeSourceSideBar()

    const { onFeedbackTabOpened, onKnowledgeResourceClick } =
        useFeedbackTracking({
            ticketId,
            accountId,
            userId,
        })

    const { onReasoningOpened } = useReasoningTracking({
        ticketId,
        accountId,
        userId,
        messageId,
    })

    const { data: messageAiReasoning, refetch: refetchMessageAiReasoning } =
        useGetMessageAiReasoning(
            {
                objectId: ticketId.toString(),
                objectType: 'TICKET',
                messageId: messageId.toString(),
            },
            {
                enabled: state !== 'collapsed' && !!messageId,
            },
        )

    const { reasoningContent, reasoningResources, staticMessage } =
        useMemo(() => {
            if (messageAiReasoning?.reasoning) {
                const outcomeReasoning = messageAiReasoning.reasoning.find(
                    (reasoning) =>
                        reasoning.responseType ===
                        ReasoningResponseType.OUTCOME,
                )
                const responseReasoning = messageAiReasoning.reasoning.find(
                    (reasoning) =>
                        reasoning.responseType ===
                        ReasoningResponseType.RESPONSE,
                )
                const fullDetailsReasoning =
                    messageAiReasoning.reasoning.filter(
                        (reasoning) =>
                            reasoning.responseType ===
                                ReasoningResponseType.TASK &&
                            (!messageAiReasoning.usedTasks ||
                                messageAiReasoning.usedTasks.includes(
                                    reasoning.targetId,
                                )),
                    )

                const hasFullDetails = fullDetailsReasoning.length > 0
                const hasOutcome = !!outcomeReasoning?.value

                let responseReasoningContent = responseReasoning?.value ?? ''
                if (
                    responseReasoningContent &&
                    (hasFullDetails || hasOutcome)
                ) {
                    responseReasoningContent = `${responseReasoningContent}\n\n&nbsp;\n\n`
                }

                let fullDetailsReasoningContent = ''
                let outcomeReasoningContent = ''
                if (hasFullDetails && hasOutcome) {
                    fullDetailsReasoningContent = `<div class="fullDetailsContainer"><div class="fullDetailsHeader">Full details:</div>\n\n${fullDetailsReasoning
                        .map(
                            (resource, index) =>
                                `<div class="taskItem">\n\n${index + 1}. ${resource.value.replace(/\\n/g, '\n\n')}\n\n</div>`,
                        )
                        .join(
                            '\n\n',
                        )}\n\n<div class="taskItem">\n\n${fullDetailsReasoning.length + 1}. **Outcome**\n\n${outcomeReasoning.value}\n\n</div></div>\n\n`
                    outcomeReasoningContent = ''
                } else if (hasFullDetails && !hasOutcome) {
                    fullDetailsReasoningContent = `<div class="fullDetailsContainer"><div class="fullDetailsHeader">Full details:</div>\n\n${fullDetailsReasoning
                        .map(
                            (resource, index) =>
                                `<div class="taskItem">\n\n${index + 1}. ${resource.value.replace(/\\n/g, '\n\n')}\n\n</div>`,
                        )
                        .join('\n\n')}</div>\n\n&nbsp;\n\n`
                } else if (!hasFullDetails && hasOutcome) {
                    outcomeReasoningContent = `**Outcome:**\n\n${outcomeReasoning.value}`
                }

                if (
                    !responseReasoningContent &&
                    !outcomeReasoningContent &&
                    !fullDetailsReasoningContent
                ) {
                    if (isHandover) {
                        return {
                            reasoningContent: '',
                            staticMessage:
                                'AI Agent was not confident in its answer and handed the ticket over to your team.',
                            reasoningResources: [],
                        }
                    }
                    if (messageAiReasoning.execution?.endDatetime) {
                        return {
                            reasoningContent: '',
                            staticMessage:
                                'Reasoning unavailable for this message.',
                            reasoningResources: [],
                        }
                    }
                }

                const content = [
                    responseReasoningContent,
                    fullDetailsReasoningContent,
                    outcomeReasoningContent,
                ]
                    .filter(Boolean)
                    .join('')

                return {
                    reasoningContent: content,
                    reasoningResources: [
                        ...parseReasoningResources(
                            responseReasoningContent,
                            messageAiReasoning.resources,
                        ),
                        ...fullDetailsReasoning.flatMap((taskReasoning) =>
                            parseReasoningResources(
                                taskReasoning.value,
                                messageAiReasoning.resources.filter(
                                    (resource) =>
                                        resource.taskIds.includes(
                                            taskReasoning.targetId,
                                        ),
                                ),
                            ),
                        ),
                        ...parseReasoningResources(
                            outcomeReasoningContent,
                            messageAiReasoning.resources,
                        ),
                    ],
                }
            }
            return {
                reasoningContent: null,
                staticMessage: "Couldn't load reasoning. Please try again.",
                reasoningResources: [],
            }
        }, [
            messageAiReasoning?.reasoning,
            messageAiReasoning?.resources,
            messageAiReasoning?.execution?.endDatetime,
            messageAiReasoning?.usedTasks,
            isHandover,
        ])

    const reasoningMetadata = useGetResourcesReasoningMetadata({
        queriesEnabled: state !== 'collapsed',
        resources: reasoningResources.filter(
            (resource): resource is NonNullable<typeof resource> =>
                resource !== null,
        ),
        storeConfiguration: messageAiReasoning?.storeConfiguration,
    })

    useEffect(() => {
        if (reasoningContent === null) return
        if (staticMessage) {
            setState('static')
        } else if (state === 'loading' && !reasoningMetadata?.isLoading) {
            if (reasoningContent) {
                setState('expanded')
            } else {
                setState('error')
            }
        }
    }, [reasoningContent, staticMessage, state, reasoningMetadata?.isLoading])

    const handleToggleExpansion = useCallback(() => {
        if (state === 'collapsed') {
            setState('loading')
            onReasoningOpened()
        } else if (state === 'expanded') {
            setState('collapsed')
        }
    }, [state, onReasoningOpened])

    const handleTryAgain = useCallback(() => {
        setState('loading')
        refetchMessageAiReasoning()
    }, [refetchMessageAiReasoning])

    const handleGiveFeedback = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        onFeedbackTabOpened('give-feedback-buton-from-reasoning')
        onChangeTab(TicketInfobarTab.AIFeedback)
    }

    const isLoading = state === 'loading'
    const isError = state === 'error'
    const isExpanded = state === 'expanded'
    const isStatic = state === 'static'
    const isLoaded = state === 'collapsed' || state === 'expanded'

    const renderTitle = () => {
        if (isLoading) {
            return (
                <span className={classNames(css.text, css.loading)}>
                    Loading reasoning...
                </span>
            )
        }

        if (isError) {
            return (
                <>
                    <span className={css.textError}>
                        Couldn&apos;t load reasoning. Please try again.
                    </span>
                    {isRetriable && (
                        <Button
                            intent="secondary"
                            size="small"
                            fillStyle="fill"
                            onClick={handleTryAgain}
                            className={css.errorButton}
                        >
                            Try again
                        </Button>
                    )}
                </>
            )
        }

        return (
            <div className={css.titleContainer}>
                <div className={css.titleContent}>
                    {!isExpanded && (
                        <i
                            className={classNames(
                                'material-icons',
                                css.expandIcon,
                            )}
                        >
                            keyboard_arrow_down
                        </i>
                    )}
                    {isExpanded && (
                        <i
                            className={classNames(
                                'material-icons',
                                css.expandIcon,
                            )}
                        >
                            keyboard_arrow_up
                        </i>
                    )}
                    <span className={css.text}>
                        {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
                        <Badge
                            type={'light-grey'}
                            className={css.betaBadge}
                            upperCase={false}
                        >
                            Beta
                        </Badge>
                    </span>
                </div>
            </div>
        )
    }

    const renderBody = () => {
        if (isError) {
            return null
        }

        return (
            <div
                className={classNames(css.body, {
                    [css.expanded]: isExpanded || isStatic,
                    [css.loading]: isLoading,
                })}
            >
                {isStatic ? (
                    <span>{staticMessage}</span>
                ) : (
                    <>
                        <AiAgentReasoningContent
                            reasoningContent={reasoningContent}
                            reasoningResources={reasoningResources}
                            data={reasoningMetadata?.data}
                            storeConfiguration={
                                messageAiReasoning?.storeConfiguration
                            }
                            openPreview={openPreview}
                            onKnowledgeResourceClick={onKnowledgeResourceClick}
                        />
                    </>
                )}
            </div>
        )
    }

    const renderFooter = () => {
        const executionId = messageAiReasoning?.storeConfiguration?.executionId

        if (!executionId) {
            return null
        }

        const renderExecutionId = () => {
            if (!isImpersonated) {
                return null
            }

            return (
                <div className={css.executionId}>
                    {`Execution ID: ${executionId}`}
                </div>
            )
        }

        const renderFeedbackSection = () => {
            if (isError) {
                return null
            }

            return (
                <div className={css.feedbackContainer}>
                    <AiAgentReasoningFeedback
                        ticketId={ticketId}
                        accountId={accountId}
                        userId={userId}
                        executionId={executionId}
                        messageId={messageId}
                    />
                </div>
            )
        }

        const content = (
            <>
                {renderFeedbackSection()}
                {renderExecutionId()}
            </>
        )

        if (isError) {
            {
                renderExecutionId()
            }
        }

        return (
            <div
                className={classNames(css.footer, {
                    [css.expanded]: isExpanded,
                    [css.loading]: isLoading,
                    [css.static]: isStatic,
                })}
            >
                {content}
            </div>
        )
    }

    return (
        <>
            <div
                className={classNames(css.container, {
                    [css.loading]: isLoading,
                    [css.error]: isError,
                    [css.expanded]: isExpanded,
                    [css.static]: isStatic,
                })}
            >
                {!isStatic && (
                    <div
                        className={classNames(css.title, {
                            [css.clickable]: isLoaded,
                        })}
                        onClick={isLoaded ? handleToggleExpansion : undefined}
                    >
                        {renderTitle()}
                    </div>
                )}
                {renderBody()}
                {renderFooter()}
            </div>
            <Button
                intent="secondary"
                size="small"
                fillStyle="fill"
                isDisabled={activeTab === TicketInfobarTab.AIFeedback}
                onClick={handleGiveFeedback}
                className={classNames(css.reviewButton, {
                    [css.activeButton]:
                        activeTab === TicketInfobarTab.AIFeedback,
                })}
            >
                Give Feedback
            </Button>
        </>
    )
}
