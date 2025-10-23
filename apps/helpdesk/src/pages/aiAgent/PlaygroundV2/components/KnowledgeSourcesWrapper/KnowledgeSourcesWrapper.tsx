import React, { useEffect, useMemo } from 'react'

import cn from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import { StoreConfiguration } from 'models/aiAgent/types'
import { TicketOutcome } from 'models/aiAgentPlayground/types'
import { ticketOutcomeToLabel } from 'pages/aiAgent/components/TicketEvent/TicketEvent'
import { useSubscribeToEvent } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import KnowledgeSourceRenderer from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceRenderer'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useEnrichFeedbackData } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useEnrichFeedbackData'

import { useFeedbackPolling } from '../../hooks/useFeedbackPolling'
import { PlaygroundEvent } from '../../types'

import css from './KnowledgeSourcesWrapper.less'

type KnowledgeSourcesWrapperProps = {
    executionId: string
    storeConfiguration: StoreConfiguration
    outcome?: TicketOutcome
}

const OPEN_IN_NEW_TAB_ICON = 'open_in_new'

const KnowledgeSourcesWrapper: React.FC<KnowledgeSourcesWrapperProps> = ({
    executionId,
    storeConfiguration,
    outcome,
}) => {
    const { feedback, isPolling, startPolling, stopPolling } =
        useFeedbackPolling({
            executionId,
        })

    const { enrichedData, isLoading: isEnrichmentLoading } =
        useEnrichFeedbackData({
            storeConfiguration,
            data: feedback,
        })

    const hasReceivedData =
        feedback?.executions && feedback.executions.length > 0
    const isLoading = isPolling || isEnrichmentLoading || !hasReceivedData

    // Start polling when executionId is available
    useEffect(() => {
        if (executionId && !hasReceivedData) {
            startPolling()
        }
    }, [executionId, hasReceivedData, startPolling])

    // Stop polling when conversation is reset
    useSubscribeToEvent(PlaygroundEvent.RESET_CONVERSATION, stopPolling)

    const knowledgeSources = useMemo(() => {
        if (!enrichedData || !enrichedData.knowledgeResources) return []

        const sources: Array<{
            id: string
            resourceType: string
            title: string
            content: string
            url: string
            helpCenterId: string
            isDeleted: boolean
        }> = []

        enrichedData.knowledgeResources.forEach(
            (knowledgeResource: KnowledgeResource) => {
                if (
                    knowledgeResource.resource &&
                    knowledgeResource.resource.resourceType &&
                    knowledgeResource.resource.resourceTitle
                ) {
                    sources.push({
                        id:
                            knowledgeResource.resource.id ||
                            `${knowledgeResource.resource.resourceType}-${knowledgeResource.resource.resourceTitle}`,
                        resourceType: knowledgeResource.resource.resourceType,
                        title: knowledgeResource.resource.resourceTitle,
                        content: knowledgeResource.metadata.content,
                        url: knowledgeResource.metadata.url || '',
                        helpCenterId: knowledgeResource.resource.resourceId,
                        isDeleted:
                            knowledgeResource.metadata.isDeleted || false,
                    })
                }
            },
        )

        return sources
    }, [enrichedData])

    if (isLoading) {
        if (!isPolling && !isEnrichmentLoading && !knowledgeSources.length)
            return null
        return <Skeleton width="100%" height={40} />
    }

    if (!isLoading && !knowledgeSources.length) {
        return null
    }

    return (
        <div className={css.knowledgeSourcesWrapper}>
            <div className={css.header}>
                <span className={css.headerLine}>
                    AI Agent sent a response and{' '}
                    {outcome && ticketOutcomeToLabel[outcome]} the ticket.
                </span>
                <span className={css.headerLineSecond}>
                    AI Agent used the following sources:
                </span>
            </div>
            <div className={css.sourcesList}>
                {knowledgeSources.map((source) => (
                    <KnowledgeSourceRenderer
                        key={source.id}
                        id={source.id}
                        resourceType={
                            source.resourceType as AiAgentKnowledgeResourceTypeEnum
                        }
                        title={source.title}
                        content={source.content}
                        url={source.url}
                        helpCenterId={source.helpCenterId}
                        shopName={storeConfiguration?.storeName || ''}
                        shopType={storeConfiguration?.shopType || ''}
                        isDeleted={source.isDeleted}
                        renderCustomContent={({
                            icon,
                            title: renderedTitle,
                        }) => (
                            <a
                                href={source.url}
                                id={`knowledge-source-${source.id}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                className={cn(css.sourceLink, {
                                    [css.deleted]: source.isDeleted,
                                    [css.hasLink]: !source.isDeleted,
                                })}
                            >
                                {isLoading ? (
                                    <div className={css.iconSkeleton}>
                                        <Skeleton
                                            width={20}
                                            height={20}
                                            circle
                                        />
                                    </div>
                                ) : (
                                    icon
                                )}
                                {renderedTitle}
                                <i
                                    className={cn(
                                        css.openInNewTabIcon,
                                        'material-icons',
                                    )}
                                >
                                    {OPEN_IN_NEW_TAB_ICON}
                                </i>
                            </a>
                        )}
                    />
                ))}
            </div>
            <div className={css.footer}>{executionId}</div>
        </div>
    )
}

export default KnowledgeSourcesWrapper
