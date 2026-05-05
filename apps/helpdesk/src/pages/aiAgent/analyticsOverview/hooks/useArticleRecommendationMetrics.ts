import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import {
    fetchArticleRecommendations,
    useArticleRecommendations,
} from 'domains/reporting/models/articleRecommendations'
import type {
    ArticleRecommendationApiItem,
    ArticleRecommendationsParams,
} from 'domains/reporting/models/articleRecommendations'
import { hasFilter } from 'domains/reporting/models/queryFactories/utils'
import type { FilterGroup } from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import {
    ARTICLE_RECOMMENDATION_COLUMNS,
    ARTICLE_RECOMMENDATION_TABLE,
} from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
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
    const filters: FilterGroup[] = [
        {
            member: 'periodStart',
            operator: ReportingFilterOperator.AfterDate,
            values: [
                formatReportingQueryDate(statsFilters.period.start_datetime),
            ],
        },
        {
            member: 'periodEnd',
            operator: ReportingFilterOperator.BeforeDate,
            values: [
                formatReportingQueryDate(statsFilters.period.end_datetime),
            ],
        },
    ]

    if (statsFilters.stores && hasFilter(statsFilters.stores)) {
        filters.push({
            member: 'storeIntegrationId',
            operator: statsFilters.stores.operator,
            values: statsFilters.stores.values,
        })
    }

    if (statsFilters.channels && hasFilter(statsFilters.channels)) {
        filters.push({
            member: 'channel',
            operator: statsFilters.channels.operator,
            values: statsFilters.channels.values,
        })
    }

    return { filters }
}

function transformResponse(data?: ArticleRecommendationApiItem): {
    rows: ArticleRecommendationRow[]
    displayNames: Record<string, string>
} {
    const items = data ?? []

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
        const { statsFilters } = useAiAgentStatsFilters()
        const params = useMemo(() => buildParams(statsFilters), [statsFilters])

        const { data, isLoading, isError } = useArticleRecommendations(params)

        const { rows, displayNames } = useMemo(
            () => transformResponse(data),
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

export const fetchArticleRecommendationAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters) => {
        const { files } = await fetchArticleRecommendationMetrics(filters)
        return { files }
    }
