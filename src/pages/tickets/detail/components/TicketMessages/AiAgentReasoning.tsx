import React, { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { Button } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import {
    ReasoningResponseType,
    useGetMessageAiReasoning,
} from 'models/knowledgeService/queries'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import KnowledgeSourcePopover from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'
import { mapToKnowledgeSourceType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { getTicketState } from 'state/ticket/selectors'
import { changeActiveTab, getActiveTab } from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'

import css from './AiAgentReasoning.less'

type AiAgentReasoningState = 'loading' | 'collapsed' | 'expanded' | 'error'
type AiAgentReasoningProps = {
    messageId: number
}

export const parseReasoningResources = (
    content: string,
): KnowledgeReasoningResource[] => {
    return (content.match(/\{\{[^}]+\}\}/g) || [])
        .map((resourceString) => {
            const stringParts = resourceString
                .replace('{{', '')
                .replace('}}', '')
                .split('::')
            switch (stringParts[0]) {
                case 'ARTICLE':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'GUIDANCE':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'ACTION':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[1],
                    }
                case 'MACRO':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'FILE_EXTERNAL_SNIPPET':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'EXTERNAL_SNIPPET':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'ORDER':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                        resourceTitle: stringParts[3],
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
    const ticketId: number = ticket.get('id')

    const activeTab = useAppSelector(getActiveTab)
    const dispatch = useAppDispatch()

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

            const content = `**Reasoning:**\n\n${outcomeReasoning?.value}\n\n&nbsp;\n\n**Full details:**\n\n${fullDetailsReasoning?.map((resource) => resource.value.replace(/\\n/g, '\n\n')).join('\n\n')}\n\n&nbsp;\n\n**Outcome:**\n\n ${responseReasoning?.value}`

            return {
                reasoningContent: content,
                reasoningResources: parseReasoningResources(content),
            }
        }
        return {
            reasoningContent: null,
            reasoningResources: [],
        }
    }, [messageAiReasoning?.reasoning])

    const { data, isLoading: isResourcesReasoningMetadataLoading } =
        useGetResourcesReasoningMetadata({
            queriesEnabled: state !== 'collapsed',
            resources: reasoningResources.filter(
                (resource): resource is NonNullable<typeof resource> =>
                    resource !== null,
            ),
            ticketId,
            storeConfiguration: messageAiReasoning?.storeConfiguration,
        })

    useEffect(() => {
        if (reasoningContent === null) return
        if (state === 'loading' && !isResourcesReasoningMetadataLoading) {
            if (reasoningContent) {
                setState('expanded')
            } else {
                setState('error')
            }
        }
    }, [reasoningContent, state, isResourcesReasoningMetadataLoading])

    const renderContentWithIcons = useMemo(() => {
        if (reasoningContent === null) return null
        const resourceMatches = reasoningContent.match(/\{\{[^}]+\}\}/g) || []

        if (resourceMatches.length === 0) {
            return (
                <div className={css.contentWithIcons}>
                    <ReactMarkdown>{reasoningContent}</ReactMarkdown>
                </div>
            )
        }

        let processedContent = reasoningContent
        resourceMatches.forEach((match, index) => {
            processedContent = processedContent.replace(
                match,
                `<kbd id="${index}" />`,
            )
        })

        return (
            <div className={css.contentWithIcons}>
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        p: ({ children }) => (
                            <div style={{ marginBottom: '4px' }}>
                                {children}
                            </div>
                        ),
                        kbd: ({ id }: { id?: string }) => {
                            const index = parseInt(id as string)
                            const resource = reasoningResources[index]
                            const resourceData = data[index]

                            if (
                                !resource ||
                                !resourceData ||
                                'isDeleted' in resourceData
                            ) {
                                return null
                            }

                            return (
                                <span key={`resource-${index}`}>
                                    <KnowledgeSourcePopover
                                        id={resource.resourceId}
                                        knowledgeResourceType={
                                            resource.resourceType
                                        }
                                        url={resourceData.url ?? ''}
                                        title={resourceData.title}
                                        content={resourceData.content}
                                        shopName={
                                            messageAiReasoning
                                                ?.storeConfiguration
                                                ?.shopName ?? ''
                                        }
                                        shopType={
                                            messageAiReasoning
                                                ?.storeConfiguration
                                                ?.shopType ?? ''
                                        }
                                    >
                                        {(ref, eventHandlers) => (
                                            <span ref={ref} {...eventHandlers}>
                                                <KnowledgeSourceIcon
                                                    type={mapToKnowledgeSourceType(
                                                        resource.resourceType,
                                                    )}
                                                    badgeIconClassname={
                                                        css.knowledgeSourceIcon
                                                    }
                                                />
                                            </span>
                                        )}
                                    </KnowledgeSourcePopover>
                                </span>
                            )
                        },
                    }}
                >
                    {processedContent}
                </ReactMarkdown>
            </div>
        )
    }, [
        reasoningContent,
        reasoningResources,
        data,
        messageAiReasoning?.storeConfiguration,
    ])

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
                {renderContentWithIcons}
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
