import { useCallback, useEffect, useMemo, useState } from 'react'

import { useReasoningTracking } from '@repo/ai-agent'
import classNames from 'classnames'
import { useLocation } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { useAiAgentReasoning } from 'pages/aiAgent/hooks/useAiAgentReasoning'
import type { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import type { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'
import { AiAgentReasoningContent } from 'pages/tickets/detail/components/TicketMessages/AiReasoningContent'
import { isSessionImpersonated } from 'services/activityTracker/utils'

import { useCoreContext } from '../../contexts/CoreContext'

import css from './PlaygroundReasoning.less'

type ReasoningStatus = 'loading' | 'error' | 'collapsed' | 'expanded' | 'static'

type LoadingState = 'loading' | 'loaded' | 'timeout'

type PreviewParams = {
    id: string
    url: string
    title: string
    content: string
    knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum
    helpCenterId?: string
}

interface ReasoningTitleProps {
    status: ReasoningStatus
    onRetry: () => void
    onToggle: () => void
}

const ReasoningTitle = ({ status, onRetry, onToggle }: ReasoningTitleProps) => {
    const { useV3 } = useCoreContext()
    if (useV3) {
        return (
            <span className={classNames(css.text)} aria-live="polite">
                Reasoning not yet available for V3
            </span>
        )
    }

    if (status === 'loading') {
        return (
            <span
                className={classNames(css.text, css.loading)}
                aria-live="polite"
            >
                Generating reasoning...
            </span>
        )
    }

    if (status === 'error') {
        return (
            <div className={css.errorContainer}>
                <span className={css.textError}>
                    Couldn&apos;t load reasoning. Please try again.
                </span>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRetry}
                    className={css.errorButton}
                >
                    Try again
                </Button>
            </div>
        )
    }

    const isExpanded = status === 'expanded'
    const icon = isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
    const label = isExpanded ? 'Hide reasoning' : 'Show reasoning'

    return (
        <button
            className={css.titleButton}
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={label}
        >
            <i className={classNames('material-icons', css.expandIcon)}>
                {icon}
            </i>
            <span className={css.titleButtonText}>{label}</span>
        </button>
    )
}

interface ReasoningBodyProps {
    status: ReasoningStatus
    reasoningContent: string | null
    reasoningResources: KnowledgeReasoningResource[]
    reasoningMetadata?: ReturnType<typeof useGetResourcesReasoningMetadata>
    staticMessage?: string
    storeConfiguration?: {
        shopName?: string
        shopType?: string
    } | null
    onOpenPreview: (params: PreviewParams) => void
}

const ReasoningBody = ({
    status,
    reasoningContent,
    reasoningResources,
    reasoningMetadata,
    staticMessage,
    storeConfiguration,
    onOpenPreview,
}: ReasoningBodyProps) => {
    return (
        <div className={css.body}>
            {status === 'static' ? (
                <span>{staticMessage}</span>
            ) : (
                <AiAgentReasoningContent
                    reasoningContent={reasoningContent}
                    reasoningResources={reasoningResources}
                    data={reasoningMetadata?.data}
                    storeConfiguration={storeConfiguration}
                    openPreview={onOpenPreview}
                />
            )}
        </div>
    )
}

export interface PlaygroundReasoningStatelessProps {
    status: ReasoningStatus
    reasoningContent: string | null
    reasoningResources: KnowledgeReasoningResource[]
    reasoningMetadata?: ReturnType<typeof useGetResourcesReasoningMetadata>
    staticMessage?: string
    storeConfiguration?: {
        shopName?: string
        shopType?: string
        executionId?: string
    } | null
    shouldDisplayExecutionId?: boolean
    onToggle: () => void
    onRetry: () => void
    onOpenPreview: (params: PreviewParams) => void
}

export const PlaygroundReasoningStateless = ({
    status,
    reasoningContent,
    reasoningResources,
    reasoningMetadata,
    staticMessage,
    storeConfiguration,
    shouldDisplayExecutionId,
    onToggle,
    onRetry,
    onOpenPreview,
}: PlaygroundReasoningStatelessProps) => {
    const isStatic = status === 'static'
    const shouldRenderBody = !(status === 'error' || status === 'loading')

    return (
        <div
            className={classNames(css.container, {
                [css.loading]: status === 'loading',
                [css.error]: status === 'error',
                [css.expanded]: status === 'expanded',
                [css.static]: status === 'static',
            })}
            aria-busy={status === 'loading'}
        >
            {!isStatic && (
                <ReasoningTitle
                    status={status}
                    onRetry={onRetry}
                    onToggle={onToggle}
                />
            )}

            <div
                className={classNames(css.bodyContainer, {
                    [css.expanded]: status === 'expanded',
                })}
            >
                <div className={css.bodyInnerContainer}>
                    {shouldRenderBody && (
                        <ReasoningBody
                            status={status}
                            reasoningContent={reasoningContent}
                            reasoningResources={reasoningResources}
                            reasoningMetadata={reasoningMetadata}
                            staticMessage={staticMessage}
                            storeConfiguration={storeConfiguration}
                            onOpenPreview={onOpenPreview}
                        />
                    )}
                    {shouldDisplayExecutionId &&
                        storeConfiguration?.executionId && (
                            <div className={css.executionId}>
                                Execution ID: {storeConfiguration?.executionId}
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

export interface PlaygroundReasoning {
    accountId: number
    userId: number
    testSessionId: string
    messageId: string
    storeConfiguration?: {
        shopName?: string
        shopType?: string
        executionId?: string
    } | null
}

export const PlaygroundReasoning = ({
    accountId,
    userId,
    testSessionId,
    messageId,
    storeConfiguration,
}: PlaygroundReasoning) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [loadingState, setLoadingState] = useState<LoadingState>('loading')
    const { search } = useLocation()

    const {
        reasoningContent,
        reasoningResources,
        reasoningMetadata,
        staticMessage,
        storeConfiguration: reasoningStoreConfig,
        refetch,
    } = useAiAgentReasoning({
        objectId: testSessionId,
        objectType: 'TEST_MODE_SESSION',
        messageId: messageId,
        enabled: !!messageId,
        refetchInterval: loadingState === 'loading' ? 2000 : false,
    })

    useEffect(() => {
        const loaded = reasoningContent && reasoningContent.length > 0

        if (loadingState === 'loading') {
            if (loaded) {
                setLoadingState('loaded')
                return
            }

            const timeout = setTimeout(() => {
                setLoadingState('timeout')
            }, 30000)

            return () => clearTimeout(timeout)
        }
    }, [loadingState, reasoningContent, messageId])

    const status: ReasoningStatus = useMemo(() => {
        if (loadingState === 'timeout') {
            return 'error'
        }
        if (loadingState === 'loading') {
            return 'loading'
        }
        if (staticMessage) {
            return 'static'
        }
        return isExpanded ? 'expanded' : 'collapsed'
    }, [staticMessage, loadingState, isExpanded])

    const handleRetry = useCallback(() => {
        setLoadingState('loading')
        refetch()
    }, [refetch])

    const { onReasoningOpened } = useReasoningTracking({
        accountId,
        userId,
        ticketId: Number(testSessionId),
        messageId: Number(messageId) || 0,
    })

    const handleToggle = useCallback(() => {
        setIsExpanded((prev) => {
            if (!prev) {
                onReasoningOpened()
            }
            return !prev
        })
    }, [onReasoningOpened])

    const searchParams = useMemo(() => new URLSearchParams(search), [search])
    const shouldDisplayExecutionId =
        isSessionImpersonated() ||
        searchParams.get('showAiAgentExecutionIds') === 'true'

    return (
        <PlaygroundReasoningStateless
            status={status}
            reasoningContent={reasoningContent}
            reasoningResources={reasoningResources}
            reasoningMetadata={reasoningMetadata}
            staticMessage={staticMessage}
            storeConfiguration={storeConfiguration || reasoningStoreConfig}
            shouldDisplayExecutionId={shouldDisplayExecutionId}
            onToggle={handleToggle}
            onRetry={handleRetry}
            onOpenPreview={(params) =>
                window.open(params.url, '_blank', 'noopener,noreferrer')
            }
        />
    )
}
