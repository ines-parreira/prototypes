import React, { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import {
    ReasoningResponseType,
    useGetMessageAiReasoning,
} from 'models/knowledgeService/queries'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'
import { changeActiveTab, getActiveTab } from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'

import { useFeedbackTracking } from '../AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useKnowledgeSourceSideBar } from '../AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { useGetResourcesReasoningMetadata } from '../AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'
import { AiAgentReasoningContent } from './AiReasoningContent'

import css from './AiAgentReasoning.less'

type AiAgentReasoningState = 'loading' | 'collapsed' | 'expanded' | 'error'
type AiAgentReasoningProps = {
    messageId: number
}

export const coerceResourceType = (resourceType: string) => {
    switch (resourceType) {
        case 'action_execution':
            return AiAgentKnowledgeResourceTypeEnum.ACTION
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

            const resourceType = coerceResourceType(stringParts[0])

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

export const AiAgentReasoning = ({ messageId }: AiAgentReasoningProps) => {
    const [state, setState] = useState<AiAgentReasoningState>('collapsed')
    const [isRetriable] = useState(true)

    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')

    const activeTab = useAppSelector(getActiveTab)
    const dispatch = useAppDispatch()

    const { openPreview } = useKnowledgeSourceSideBar()

    const { onFeedbackTabOpened } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
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

    const { reasoningContent, reasoningResources } = useMemo(() => {
        if (messageAiReasoning?.reasoning) {
            const outcomeReasoning = messageAiReasoning.reasoning.find(
                (reasoning) =>
                    reasoning.responseType === ReasoningResponseType.OUTCOME,
            )
            const responseReasoning = messageAiReasoning.reasoning.find(
                (reasoning) =>
                    reasoning.responseType === ReasoningResponseType.RESPONSE,
            )
            const fullDetailsReasoning = messageAiReasoning.reasoning.filter(
                (reasoning) =>
                    reasoning.responseType === ReasoningResponseType.TASK,
            )

            if (
                !outcomeReasoning ||
                !responseReasoning ||
                !fullDetailsReasoning.length
            ) {
                return {
                    reasoningContent: '',
                    reasoningResources: [],
                }
            }

            const content = `**Reasoning:**\n\n${responseReasoning?.value}\n\n&nbsp;\n\n**Full details:**\n\n${fullDetailsReasoning?.map((resource) => resource.value.replace(/\\n/g, '\n\n')).join('\n\n')}\n\n&nbsp;\n\n**Outcome:**\n\n ${outcomeReasoning?.value}`

            return {
                reasoningContent: content,
                reasoningResources: [
                    ...parseReasoningResources(
                        responseReasoning.value,
                        messageAiReasoning.resources,
                    ),
                    ...fullDetailsReasoning.flatMap((taskReasoning) =>
                        parseReasoningResources(
                            taskReasoning.value,
                            messageAiReasoning.resources.filter((resource) =>
                                resource.taskIds.includes(
                                    taskReasoning.targetId,
                                ),
                            ),
                        ),
                    ),
                    ...parseReasoningResources(
                        outcomeReasoning.value,
                        messageAiReasoning.resources,
                    ),
                ],
            }
        }
        return {
            reasoningContent: null,
            reasoningResources: [],
        }
    }, [messageAiReasoning?.reasoning, messageAiReasoning?.resources])

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
        if (state === 'loading' && !reasoningMetadata?.isLoading) {
            if (reasoningContent) {
                setState('expanded')
            } else {
                setState('error')
            }
        }
    }, [reasoningContent, state, reasoningMetadata?.isLoading])

    const handleToggleExpansion = useCallback(() => {
        if (state === 'collapsed') {
            setState('loading')
        } else if (state === 'expanded') {
            setState('collapsed')
        }
    }, [state])

    const handleTryAgain = useCallback(() => {
        setState('loading')
        refetchMessageAiReasoning()
    }, [refetchMessageAiReasoning])

    const handleGiveFeedback = () => {
        onFeedbackTabOpened('give-feedback-buton-from-reasoning')
        dispatch(
            changeActiveTab({ activeTab: TicketAIAgentFeedbackTab.AIAgent }),
        )
    }

    const isLoading = state === 'loading'
    const isError = state === 'error'
    const isExpanded = state === 'expanded'
    const isLoaded = state === 'collapsed' || state === 'expanded'

    const renderTitle = () => {
        if (isLoading) {
            return (
                <>
                    <i
                        className={classNames(
                            'material-icons',
                            css.sparklesIcon,
                            css.loading,
                        )}
                    >
                        auto_awesome
                    </i>
                    <span className={classNames(css.text, css.loading)}>
                        Loading reasoning...
                    </span>
                </>
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
            <>
                {!isExpanded && (
                    <i className={classNames('material-icons', css.expandIcon)}>
                        keyboard_arrow_down
                    </i>
                )}
                {isExpanded && (
                    <i className={classNames('material-icons', css.expandIcon)}>
                        keyboard_arrow_up
                    </i>
                )}
                <span className={css.text}>
                    {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
                </span>
            </>
        )
    }

    const renderBody = () => {
        if (isError) {
            return null
        }

        return (
            <div
                className={classNames(css.body, {
                    [css.expanded]: isExpanded,
                    [css.loading]: isLoading,
                })}
            >
                <AiAgentReasoningContent
                    reasoningContent={reasoningContent}
                    reasoningResources={reasoningResources}
                    data={reasoningMetadata?.data}
                    storeConfiguration={messageAiReasoning?.storeConfiguration}
                    openPreview={openPreview}
                />
            </div>
        )
    }

    const renderFooter = () => {
        if (isError) {
            return null
        }

        return (
            <div
                className={classNames(css.footer, {
                    [css.expanded]: isExpanded,
                    [css.loading]: isLoading,
                })}
            >
                {isExpanded && (
                    <Button
                        intent="secondary"
                        size="small"
                        fillStyle="fill"
                        isDisabled={
                            activeTab === TicketAIAgentFeedbackTab.AIAgent
                        }
                        onClick={handleGiveFeedback}
                        className={classNames({
                            [css.activeButton]:
                                activeTab === TicketAIAgentFeedbackTab.AIAgent,
                        })}
                    >
                        Give Feedback
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div
            className={classNames(css.container, {
                [css.loading]: isLoading,
                [css.error]: isError,
                [css.expanded]: isExpanded,
            })}
        >
            <div
                className={classNames(css.title, { [css.clickable]: isLoaded })}
                onClick={isLoaded ? handleToggleExpansion : undefined}
            >
                {renderTitle()}
            </div>
            {renderBody()}
            {renderFooter()}
        </div>
    )
}
