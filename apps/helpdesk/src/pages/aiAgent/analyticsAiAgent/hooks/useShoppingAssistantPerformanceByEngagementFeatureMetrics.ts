import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { EntityMetricConfig } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/columns'
import {
    fetchAutomatedInteractionsPerShoppingAssistantEngagementFeature,
    useAutomatedInteractionsPerShoppingAssistantEngagementFeature,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerShoppingAssistantEngagementFeature'
import {
    fetchConversionRatePerShoppingAssistantEngagementFeature,
    useConversionRatePerShoppingAssistantEngagementFeature,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useConversionRatePerShoppingAssistantEngagementFeature'
import {
    fetchHandoverInteractionsPerShoppingAssistantEngagementFeature,
    useHandoverInteractionsPerShoppingAssistantEngagementFeature,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerShoppingAssistantEngagementFeature'
import {
    fetchOrdersInfluencedPerShoppingAssistantEngagementFeature,
    useOrdersInfluencedPerShoppingAssistantEngagementFeature,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useOrdersInfluencedPerShoppingAssistantEngagementFeature'
import {
    fetchRevenuePerInteractionPerShoppingAssistantEngagementFeature,
    useRevenuePerInteractionPerShoppingAssistantEngagementFeature,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useRevenuePerInteractionPerShoppingAssistantEngagementFeature'
import {
    fetchTotalSalesPerShoppingAssistantEngagementFeature,
    useTotalSalesPerShoppingAssistantEngagementFeature,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesPerShoppingAssistantEngagementFeature'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { MAP_ENGAGEMENT_TYPE_NAME } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { createCsv } from 'utils/file'

export type ShoppingAssistantEngagementFeatureName =
    | 'suggested_product_question'
    | 'search_bar'
    | 'ask_anything'
    | 'null'

export const SHOPPING_ASSISTANT_ENGAGEMENT_FEATURE_ENTITIES: ShoppingAssistantEngagementFeatureName[] =
    ['suggested_product_question', 'search_bar', 'ask_anything', 'null']

export type ShoppingAssistantPerformanceByEngagementFeatureEntityMetrics = {
    entity: ShoppingAssistantEngagementFeatureName
    automatedInteractions: number | null
    handoverInteractions: number | null
    conversionRate: number | null
    totalSales: number | null
    ordersInfluenced: number | null
    revenuePerInteraction: number | null
}

type ShoppingAssistantPerformanceByEngagementFeatureMetricKeys =
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'conversionRate'
    | 'totalSales'
    | 'ordersInfluenced'
    | 'revenuePerInteraction'

const normalizeEntityMap = (
    entityMap: Partial<Record<string, number | null | undefined>>,
) => ({
    ...entityMap,
    ...(entityMap[''] !== undefined ? { null: entityMap[''] } : {}),
})

const normalizeEntityData = (
    entityData: Record<
        ShoppingAssistantPerformanceByEngagementFeatureMetricKeys,
        Partial<Record<string, number | null | undefined>>
    >,
) =>
    Object.fromEntries(
        Object.entries(entityData).map(([key, value]) => [
            key,
            normalizeEntityMap(value),
        ]),
    ) as Record<
        ShoppingAssistantPerformanceByEngagementFeatureMetricKeys,
        Partial<Record<string, number | null | undefined>>
    >

const buildShoppingAssistantPerformanceByEngagementFeatureRow =
    (
        entityData: Record<
            ShoppingAssistantPerformanceByEngagementFeatureMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (
        entity: ShoppingAssistantEngagementFeatureName,
    ): ShoppingAssistantPerformanceByEngagementFeatureEntityMetrics => ({
        entity,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        conversionRate: entityData.conversionRate[entity] ?? null,
        totalSales: entityData.totalSales[entity] ?? null,
        ordersInfluenced: entityData.ordersInfluenced[entity] ?? null,
        revenuePerInteraction: entityData.revenuePerInteraction[entity] ?? null,
    })

const SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_METRICS_CONFIG: Record<
    ShoppingAssistantPerformanceByEngagementFeatureMetricKeys,
    EntityMetricConfig
> = {
    automatedInteractions: {
        use: useAutomatedInteractionsPerShoppingAssistantEngagementFeature,
        fetch: fetchAutomatedInteractionsPerShoppingAssistantEngagementFeature,
    },
    handoverInteractions: {
        use: useHandoverInteractionsPerShoppingAssistantEngagementFeature,
        fetch: fetchHandoverInteractionsPerShoppingAssistantEngagementFeature,
    },
    conversionRate: {
        use: useConversionRatePerShoppingAssistantEngagementFeature,
        fetch: fetchConversionRatePerShoppingAssistantEngagementFeature,
    },
    totalSales: {
        use: useTotalSalesPerShoppingAssistantEngagementFeature,
        fetch: fetchTotalSalesPerShoppingAssistantEngagementFeature,
    },
    ordersInfluenced: {
        use: useOrdersInfluencedPerShoppingAssistantEngagementFeature,
        fetch: fetchOrdersInfluencedPerShoppingAssistantEngagementFeature,
    },
    revenuePerInteraction: {
        use: useRevenuePerInteractionPerShoppingAssistantEngagementFeature,
        fetch: fetchRevenuePerInteractionPerShoppingAssistantEngagementFeature,
    },
}

const SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_FILENAME =
    'shopping_assistant_performance_by_engagement_feature_table'

export const useShoppingAssistantPerformanceByEngagementFeatureMetrics = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const {
        data: rawEntityData,
        isLoading,
        isError,
        loadingStates: entityLoadingStates,
    } = useEntityMetrics(
        SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_METRICS_CONFIG,
        statsFilters,
        userTimezone,
    )

    const entityData = useMemo(
        () => normalizeEntityData(rawEntityData),
        [rawEntityData],
    )

    const data = useMemo(
        () =>
            assembleEntityRows(
                SHOPPING_ASSISTANT_ENGAGEMENT_FEATURE_ENTITIES,
                buildShoppingAssistantPerformanceByEngagementFeatureRow(
                    entityData,
                ),
            ),
        [entityData],
    )

    const loadingStates = useMemo(
        () => ({
            automatedInteractions: entityLoadingStates.automatedInteractions,
            handoverInteractions: entityLoadingStates.handoverInteractions,
            conversionRate: entityLoadingStates.conversionRate,
            totalSales: entityLoadingStates.totalSales,
            ordersInfluenced: entityLoadingStates.ordersInfluenced,
            revenuePerInteraction: entityLoadingStates.revenuePerInteraction,
        }),
        [entityLoadingStates],
    )

    return { data, isLoading, isError, loadingStates }
}

export const fetchShoppingAssistantPerformanceByEngagementFeatureMetrics =
    async (
        statsFilters: StatsFilters,
        timezone: string,
    ): Promise<{ fileName: string; files: Record<string, string> }> => {
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_FILENAME,
        )

        const metrics = await fetchEntityMetrics(
            SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_METRICS_CONFIG,
            statsFilters,
            timezone,
        )

        const entityData = normalizeEntityData(metrics.data)

        const data = assembleEntityRows(
            SHOPPING_ASSISTANT_ENGAGEMENT_FEATURE_ENTITIES,
            buildShoppingAssistantPerformanceByEngagementFeatureRow(entityData),
        )

        if (data.length === 0) {
            return { fileName, files: { [fileName]: '' } }
        }

        const headers = [
            'Engagement feature',
            ...SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS.map(
                (column) => column.label,
            ),
        ]

        const rows = data.map((row) => [
            MAP_ENGAGEMENT_TYPE_NAME[row.entity],
            ...SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS.map(
                (column) =>
                    formatMetricValue(
                        row[
                            column.accessorKey as keyof ShoppingAssistantPerformanceByEngagementFeatureEntityMetrics
                        ] as number,
                        column.metricFormat,
                    ),
            ),
        ])

        return {
            fileName,
            files: { [fileName]: createCsv([headers, ...rows]) },
        }
    }

export const fetchShoppingAssistantPerformanceByEngagementFeatureAsConfigurableTable: ConfigurableGraphFetch =
    async (
        _savedMeasure,
        _savedDimension,
        filters,
        timezone,
        __granularity,
    ) => {
        const { files } =
            await fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
                filters,
                timezone,
            )

        return { files }
    }
