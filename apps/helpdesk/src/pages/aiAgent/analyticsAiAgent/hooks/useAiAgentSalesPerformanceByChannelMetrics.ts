import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { EntityMetricConfig } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    filterEntitiesWithData,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS,
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_TABLE,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'
import {
    fetchAutomatedInteractionsPerSalesAgentChannel,
    useAutomatedInteractionsPerSalesAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerSalesAgentChannel'
import {
    fetchHandoverInteractionsPerSalesAgentChannel,
    useHandoverInteractionsPerSalesAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerSalesAgentChannel'
import {
    fetchOrdersInfluencedPerSalesAgentChannel,
    useOrdersInfluencedPerSalesAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useOrdersInfluencedPerSalesAgentChannel'
import {
    fetchRevenuePerInteractionPerSalesAgentChannel,
    useRevenuePerInteractionPerSalesAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useRevenuePerInteractionPerSalesAgentChannel'
import {
    fetchTotalSalesPerSalesAgentChannel,
    useTotalSalesPerSalesAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesPerSalesAgentChannel'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { createCsv } from 'utils/file'

export type AiAgentSalesChannelName =
    | 'email'
    | 'chat'
    | 'sms'
    | 'contact-form'
    | 'help-center'
    | 'voice'

export const AI_AGENT_SALES_CHANNEL_ENTITIES: AiAgentSalesChannelName[] = [
    'email',
    'chat',
    'sms',
    'contact-form',
    'help-center',
    'voice',
]

export type AiAgentSalesPerformanceByChannelEntityMetrics = {
    entity: AiAgentSalesChannelName
    automatedInteractions: number | null
    handoverInteractions: number | null
    totalSales: number | null
    ordersInfluenced: number | null
    revenuePerInteraction: number | null
}

export type AiAgentSalesPerformanceByChannelMetricsData = {
    data: AiAgentSalesPerformanceByChannelEntityMetrics[] | undefined
    isLoading: boolean
    isError: boolean
    loadingStates: {
        automatedInteractions: boolean
        handoverInteractions: boolean
        totalSales: boolean
        ordersInfluenced: boolean
        revenuePerInteraction: boolean
    }
}

type AiAgentSalesPerformanceByChannelMetricKeys =
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'totalSales'
    | 'ordersInfluenced'
    | 'revenuePerInteraction'

const buildAiAgentSalesPerformanceByChannelRow =
    (
        entityData: Record<
            AiAgentSalesPerformanceByChannelMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (
        entity: AiAgentSalesChannelName,
    ): AiAgentSalesPerformanceByChannelEntityMetrics => ({
        entity,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        totalSales: entityData.totalSales[entity] ?? null,
        ordersInfluenced: entityData.ordersInfluenced[entity] ?? null,
        revenuePerInteraction: entityData.revenuePerInteraction[entity] ?? null,
    })

const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG: Record<
    AiAgentSalesPerformanceByChannelMetricKeys,
    EntityMetricConfig
> = {
    automatedInteractions: {
        use: useAutomatedInteractionsPerSalesAgentChannel,
        fetch: fetchAutomatedInteractionsPerSalesAgentChannel,
    },
    handoverInteractions: {
        use: useHandoverInteractionsPerSalesAgentChannel,
        fetch: fetchHandoverInteractionsPerSalesAgentChannel,
    },
    totalSales: {
        use: useTotalSalesPerSalesAgentChannel,
        fetch: fetchTotalSalesPerSalesAgentChannel,
    },
    ordersInfluenced: {
        use: useOrdersInfluencedPerSalesAgentChannel,
        fetch: fetchOrdersInfluencedPerSalesAgentChannel,
    },
    revenuePerInteraction: {
        use: useRevenuePerInteractionPerSalesAgentChannel,
        fetch: fetchRevenuePerInteractionPerSalesAgentChannel,
    },
}

export const useAiAgentSalesPerformanceByChannelMetrics =
    (): AiAgentSalesPerformanceByChannelMetricsData => {
        const { statsFilters, userTimezone } = useAutomateFilters()

        const {
            data: entityData,
            isLoading,
            isError,
            loadingStates: entityLoadingStates,
        } = useEntityMetrics(
            AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG,
            statsFilters,
            userTimezone,
        )

        const data = useMemo(() => {
            const filteredEntities = filterEntitiesWithData(
                AI_AGENT_SALES_CHANNEL_ENTITIES,
                entityData,
                isLoading,
            )
            return assembleEntityRows(
                entityData,
                filteredEntities,
                buildAiAgentSalesPerformanceByChannelRow(entityData),
                { skipEmptyCheck: isLoading },
            )
        }, [entityData, isLoading])

        const loadingStates = useMemo(
            () => ({
                automatedInteractions:
                    entityLoadingStates.automatedInteractions,
                handoverInteractions: entityLoadingStates.handoverInteractions,
                totalSales: entityLoadingStates.totalSales,
                ordersInfluenced: entityLoadingStates.ordersInfluenced,
                revenuePerInteraction:
                    entityLoadingStates.revenuePerInteraction,
            }),
            [entityLoadingStates],
        )

        return { data, isLoading, isError, loadingStates }
    }

const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_FILENAME = `${AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchAiAgentSalesPerformanceByChannelMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG,
        periodFilters,
        timezone,
    )

    const data = assembleEntityRows(
        metrics.data,
        filterEntitiesWithData(
            AI_AGENT_SALES_CHANNEL_ENTITIES,
            metrics.data,
            false,
        ),
        buildAiAgentSalesPerformanceByChannelRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_TABLE.title,
        ...AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS.map(
            (col) => col.label,
        ),
    ]
    const rows = data.map((row) => [
        formatChannelName(row.entity),
        ...AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof AiAgentSalesPerformanceByChannelEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchAiAgentSalesPerformanceByChannelAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const { files } = await fetchAiAgentSalesPerformanceByChannelMetrics(
            filters,
            timezone,
        )
        return { files }
    }
