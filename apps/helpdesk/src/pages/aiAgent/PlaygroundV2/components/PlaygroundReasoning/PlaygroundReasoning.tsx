import { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@gorgias/axiom'

import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { useAiAgentReasoning } from 'pages/aiAgent/hooks/useAiAgentReasoning'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'
import { AiAgentReasoningContent } from 'pages/tickets/detail/components/TicketMessages/AiReasoningContent'
import { useReasoningTracking } from 'pages/tickets/detail/components/TicketMessages/hooks/useReasoningTracking'

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
            <span className={css.text}>{label}</span>
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
    } | null
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
    onToggle,
    onRetry,
    onOpenPreview,
}: PlaygroundReasoningStatelessProps) => {
    const isStatic = status === 'static'
    const shouldRenderBody = !(
        status === 'error' ||
        status === 'loading' ||
        status === 'collapsed'
    )

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
        if (
            loadingState === 'loading' &&
            reasoningContent &&
            reasoningContent.length > 0
        ) {
            setLoadingState('loaded')
        }
    }, [loadingState, reasoningContent])

    useEffect(() => {
        setIsExpanded(false)
        setLoadingState('loading')
    }, [messageId])

    useEffect(() => {
        if (loadingState !== 'loading') {
            return
        }

        const timeout = setTimeout(() => {
            setLoadingState('timeout')
        }, 30000)

        return () => clearTimeout(timeout)
    }, [loadingState])

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

    return (
        <PlaygroundReasoningStateless
            status={status}
            reasoningContent={reasoningContent}
            reasoningResources={reasoningResources}
            reasoningMetadata={reasoningMetadata}
            staticMessage={staticMessage}
            storeConfiguration={storeConfiguration || reasoningStoreConfig}
            onToggle={handleToggle}
            onRetry={handleRetry}
            onOpenPreview={(params) =>
                window.open(params.url, '_blank', 'noopener,noreferrer')
            }
        />
    )
}
