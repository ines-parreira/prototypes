import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import {
    useGetArticleIngestionLogs,
    useGetFileIngestion,
    useGetHelpCenterArticle,
    useGetIngestedResource,
} from 'models/helpCenter/queries'
import type { LocaleCode } from 'models/helpCenter/types'
import type { IngestedResourceWithArticleId } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'
import { getTimezone } from 'state/currentUser/selectors'

import { KnowledgeEditorSnippetView } from './KnowledgeEditorSnippetView'

import css from './KnowledgeEditorSnippet.less'

type SnippetSourceData = {
    url: string
    downloadUrl: string
} | null

type Props = {
    snippetId: number
    snippetType: SnippetType
    helpCenterId: number
    locale: LocaleCode
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    onUpdated?: () => void
    isFullscreen: boolean
    onToggleFullscreen: () => void
    onTest: () => void
}
export const KnowledgeEditorSnippetLoader = ({
    snippetId,
    snippetType,
    helpCenterId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    onUpdated,
    isFullscreen,
    onToggleFullscreen,
    onTest,
}: Props) => {
    const { error: notifyError } = useNotify()
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)
    const { mutateAsync: updateTranslationMutation } =
        useUpdateArticleTranslation(helpCenterId)

    const { data: articleData, isInitialLoading: isSnippetLoading } =
        useGetHelpCenterArticle(snippetId, helpCenterId, locale)

    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    const resourceImpact = useResourceMetrics({
        resourceSourceId: snippetId,
        resourceSourceSetId: helpCenterId,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled,
        dateRange,
    })

    const {
        data: ingestedResourceData,
        isInitialLoading: isIngestedResourceLoading,
    } = useGetIngestedResource(
        {
            help_center_id: helpCenterId,
            id: articleData?.ingested_resource_id ?? 0,
        },
        {
            enabled: !!articleData?.ingested_resource_id,
        },
    )

    const shouldFetchUrlIngestionLogs =
        snippetType === SnippetType.URL || snippetType === SnippetType.Store

    const {
        data: articleIngestionLogs,
        isInitialLoading: isIngestionLogsLoading,
    } = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId,
            sources: ['url', 'domain'],
        },
        {
            enabled: shouldFetchUrlIngestionLogs,
        },
    )

    const shouldFetchFileIngestionLogs = snippetType === SnippetType.Document

    const {
        data: fileIngestionLogs,
        isInitialLoading: isFileIngestionLogsLoading,
    } = useGetFileIngestion(
        {
            help_center_id: helpCenterId,
        },
        {
            enabled: shouldFetchFileIngestionLogs,
        },
    )

    const source = useMemo<SnippetSourceData>(() => {
        if (snippetType === SnippetType.Store && ingestedResourceData) {
            return null
        }

        if (snippetType === SnippetType.URL) {
            if (!articleIngestionLogs) {
                return null
            }

            const ingestionLog = articleIngestionLogs.find((log) =>
                log.article_ids.includes(snippetId),
            )

            return {
                url: ingestionLog?.url ?? '',
                downloadUrl: '',
            }
        }

        if (snippetType === SnippetType.Document) {
            if (!fileIngestionLogs) {
                return null
            }
            const fileIngestionLog = fileIngestionLogs.data.find((log) =>
                log.snippets_article_ids.includes(snippetId),
            )

            return {
                url: fileIngestionLog?.filename ?? '',
                downloadUrl: fileIngestionLog?.google_storage_url ?? '',
            }
        }

        return null
    }, [
        articleIngestionLogs,
        fileIngestionLogs,
        snippetId,
        snippetType,
        ingestedResourceData,
    ])

    const snippet = useMemo(() => {
        if (!articleData) return null
        const baseSnippet = {
            id: articleData.id,
            title: articleData.translation.title,
            content: articleData.translation.content,
            aiAgentEnabled:
                articleData.translation.visibility_status || 'UNLISTED',
            createdDatetime: new Date(articleData.created_datetime),
            lastUpdatedDatetime: new Date(articleData.updated_datetime),
        }

        if (snippetType === SnippetType.URL) {
            return {
                ...baseSnippet,
                type: SnippetType.URL as const,
                source: source?.url || '',
            }
        }

        if (snippetType === SnippetType.Document) {
            return {
                ...baseSnippet,
                type: SnippetType.Document as const,
                source: source?.url || '',
                googleStorageUrl: source?.downloadUrl || '',
            }
        }

        if (snippetType === SnippetType.Store) {
            const typedIngestedResource =
                ingestedResourceData as unknown as IngestedResourceWithArticleId
            const urls =
                typedIngestedResource?.web_pages.map((page) => page.url) ?? []

            const domainIngestionLog = articleIngestionLogs?.find(
                (articleIngestionLog) =>
                    articleIngestionLog.source === 'domain',
            )
            const domain = domainIngestionLog?.url
            return {
                ...baseSnippet,
                type: SnippetType.Store as const,
                sources: urls,
                domain: domain ?? undefined,
            }
        }

        throw new Error(`Unknown snippet type: ${snippetType}`)
    }, [
        articleData,
        snippetType,
        source,
        ingestedResourceData,
        articleIngestionLogs,
    ])

    const onToggleAIAgentEnabled = useCallback(async () => {
        if (!articleData) return

        try {
            const currentVisibility =
                articleData.translation.visibility_status === 'PUBLIC'
            const newVisibility = currentVisibility ? 'UNLISTED' : 'PUBLIC'

            await updateTranslationMutation([
                undefined,
                {
                    help_center_id: helpCenterId,
                    article_id: snippetId,
                    locale,
                },
                {
                    visibility_status: newVisibility,
                    is_current: true,
                },
            ])

            onUpdated?.()
        } catch {
            notifyError('An error occurred while updating snippet.')
        }
    }, [
        articleData,
        updateTranslationMutation,
        helpCenterId,
        snippetId,
        locale,
        onUpdated,
        notifyError,
    ])

    const isLoading =
        isSnippetLoading ||
        isIngestedResourceLoading ||
        isIngestionLogsLoading ||
        isFileIngestionLogsLoading

    if (isLoading || !snippet) {
        return (
            <div className={css.loader}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <KnowledgeEditorSnippetView
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            onToggleFullscreen={onToggleFullscreen}
            onToggleAIAgentEnabled={onToggleAIAgentEnabled}
            onTest={onTest}
            isFullscreen={isFullscreen}
            snippet={snippet}
            impact={
                isPerformanceStatsEnabled
                    ? {
                          tickets: resourceImpact.data?.tickets,
                          handoverTickets: resourceImpact.data?.handoverTickets,
                          csat: resourceImpact.data?.csat,
                          intents: resourceImpact.data?.intents,
                          isLoading: resourceImpact.isLoading,
                      }
                    : undefined
            }
        />
    )
}
