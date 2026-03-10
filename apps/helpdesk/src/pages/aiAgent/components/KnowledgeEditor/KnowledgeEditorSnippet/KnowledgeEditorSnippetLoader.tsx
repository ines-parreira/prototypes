import { useCallback, useEffect, useMemo } from 'react'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import {
    useGetArticleIngestionLogs,
    useGetFileIngestion,
    useGetHelpCenterArticle,
    useGetIngestedResource,
} from 'models/helpCenter/queries'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { LocaleCode } from 'models/helpCenter/types'
import type { IngestedResourceWithArticleId } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'
import { getTimezone } from 'state/currentUser/selectors'

import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
import { useSnippetRecentTickets } from './hooks/useSnippetRecentTickets'
import { KnowledgeEditorSnippetView } from './KnowledgeEditorSnippetView'

type SnippetSourceData = {
    url: string
    downloadUrl: string
} | null

type Props = {
    snippetId: number
    snippetType: SnippetType
    helpCenterId: number
    shopIntegrationId: number
    locale: LocaleCode
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    onUpdated?: () => void
    isFullscreen: boolean
    isPlaygroundOpen?: boolean
    onToggleFullscreen: () => void
    onTest: () => void
    handleVisibilityUpdate?: (visibility: string) => void
    shouldHideFullscreenButton: boolean
}
export const KnowledgeEditorSnippetLoader = ({
    snippetId,
    snippetType,
    helpCenterId,
    shopIntegrationId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    isFullscreen,
    isPlaygroundOpen,
    onToggleFullscreen,
    onTest,
    handleVisibilityUpdate,
    shouldHideFullscreenButton,
}: Props) => {
    const { error: notifyError } = useNotify()
    const timezone = useAppSelector(getTimezone)
    const { mutateAsync: updateTranslationMutation } =
        useUpdateArticleTranslation(helpCenterId)

    const {
        data: articleData,
        isInitialLoading: isSnippetLoading,
        isError,
        error,
    } = useGetHelpCenterArticle(snippetId, helpCenterId, locale, 'current', {
        throwOn404: true,
    })

    useEffect(() => {
        if (isError && error) {
            // Check if it's a 404 error
            const is404 =
                isGorgiasApiError(error) && error.response.status === 404

            const message = is404
                ? 'This snippet is no longer available. It may have been deleted.'
                : 'Unable to load this snippet. Please try again or contact support.'

            notifyError(message)
            onClose()
        }
    }, [isError, error, notifyError, onClose])

    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    const resourceImpact = useResourceMetrics({
        resourceSourceId: snippetId,
        resourceSourceSetId: helpCenterId,
        shopIntegrationId,
        timezone: timezone ?? 'UTC',
        enabled: true,
        dateRange,
    })

    const recentTickets = useSnippetRecentTickets({
        snippetId,
        helpCenterId,
        shopIntegrationId,
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
                articleData.translation.visibility_status ||
                VisibilityStatusEnum.UNLISTED,
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
                articleData.translation.visibility_status ===
                VisibilityStatusEnum.PUBLIC
            const newVisibility = currentVisibility
                ? VisibilityStatusEnum.UNLISTED
                : VisibilityStatusEnum.PUBLIC

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

            handleVisibilityUpdate?.(newVisibility)
        } catch {
            notifyError('An error occurred while updating snippet.')
        }
    }, [
        articleData,
        updateTranslationMutation,
        helpCenterId,
        snippetId,
        locale,
        notifyError,
        handleVisibilityUpdate,
    ])

    const isLoading =
        isSnippetLoading ||
        isIngestedResourceLoading ||
        isIngestionLogsLoading ||
        isFileIngestionLogsLoading

    if (isLoading || !snippet) {
        return <KnowledgeEditorLoadingShell />
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
            isPlaygroundOpen={isPlaygroundOpen}
            snippet={snippet}
            shouldHideFullscreenButton={shouldHideFullscreenButton}
            impact={{
                tickets: resourceImpact.data?.tickets,
                handoverTickets: resourceImpact.data?.handoverTickets,
                csat: resourceImpact.data?.csat,
                intents: resourceImpact.data?.intents?.map(
                    ({ intent }) => intent,
                ),
                isLoading: resourceImpact.isLoading,
            }}
            recentTickets={recentTickets}
            helpCenterId={helpCenterId}
            locale={locale}
        />
    )
}
