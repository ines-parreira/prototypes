import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchArticleRecommendations,
    useArticleRecommendations,
} from 'domains/reporting/models/articleRecommendations'
import type {
    ArticleRecommendationApiItem,
    ArticleRecommendationsParams,
} from 'domains/reporting/models/articleRecommendations'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportFetch } from 'domains/reporting/pages/dashboards/types'
import {
    ARTICLE_RECOMMENDATION_COLUMNS,
    ARTICLE_RECOMMENDATION_TABLE,
} from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import { createCsv } from 'utils/file'

export type ArticleRecommendationRow = {
    entity: string
    automationRate: number | null
    automatedInteractions: number | null
    handoverInteractions: number | null
}

export type ArticleRecommendationMetricsData = {
    data: ArticleRecommendationRow[]
    isLoading: boolean
    isError: boolean
    loadingStates: {
        automationRate: boolean
        automatedInteractions: boolean
        handoverInteractions: boolean
    }
    displayNames: Record<string, string>
}

function buildParams(statsFilters: StatsFilters): ArticleRecommendationsParams {
    return {
        start_datetime: statsFilters.period.start_datetime,
        end_datetime: statsFilters.period.end_datetime,
        ...(statsFilters.storeIntegrations?.values[0] !== undefined && {
            store_integration_id: statsFilters.storeIntegrations.values[0],
        }),
        ...(statsFilters.channels?.values[0] !== undefined && {
            channel: statsFilters.channels.values[0],
        }),
    }
}

function transformResponse(data?: ArticleRecommendationApiItem): {
    rows: ArticleRecommendationRow[]
    displayNames: Record<string, string>
} {
    const items = data?.data ?? []

    const rows = items.map((item) => ({
        entity: item.article_url,
        automationRate: item.automation_rate,
        automatedInteractions: item.successful_count,
        handoverInteractions: item.handover_count,
    }))

    const displayNames = Object.fromEntries(
        items.map((item) => [item.article_url, item.article_title]),
    )

    return { rows, displayNames }
}

export const useArticleRecommendationMetrics =
    (): ArticleRecommendationMetricsData => {
        const { cleanStatsFilters } = useStatsFilters()
        const params = useMemo(
            () => buildParams(cleanStatsFilters),
            [cleanStatsFilters],
        )

        const { data, isLoading, isError } = useArticleRecommendations(params)

        const { rows, displayNames } = useMemo(
            () => transformResponse(data?.data),
            [data],
        )

        const loadingStates = useMemo(
            () => ({
                automationRate: isLoading,
                automatedInteractions: isLoading,
                handoverInteractions: isLoading,
            }),
            [isLoading],
        )

        return {
            data: rows,
            isLoading,
            isError,
            loadingStates,
            displayNames,
        }
    }

const ARTICLE_RECOMMENDATION_FILENAME = `${ARTICLE_RECOMMENDATION_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchArticleRecommendationMetrics = async (
    statsFilters: StatsFilters,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const params = buildParams(statsFilters)
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        ARTICLE_RECOMMENDATION_FILENAME,
    )

    const response = await fetchArticleRecommendations(params)
    const { rows, displayNames } = transformResponse(response.data)

    if (rows.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        ARTICLE_RECOMMENDATION_TABLE.title,
        ...ARTICLE_RECOMMENDATION_COLUMNS.map((col) => col.label),
    ]
    const csvRows = rows.map((row) => [
        displayNames[row.entity] ?? row.entity,
        ...ARTICLE_RECOMMENDATION_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof ArticleRecommendationRow
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return {
        fileName,
        files: { [fileName]: createCsv([headers, ...csvRows]) },
    }
}

export const fetchArticleRecommendationReport: ReportFetch = async (
    statsFilters,
) => ({
    isLoading: false,
    ...(await fetchArticleRecommendationMetrics(statsFilters)),
})
