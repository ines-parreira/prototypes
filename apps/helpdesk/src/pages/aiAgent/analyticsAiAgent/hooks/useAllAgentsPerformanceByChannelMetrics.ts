import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { EntityMetricConfig } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    filterEntitiesWithData,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportFetch } from 'domains/reporting/pages/dashboards/types'
import {
    ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
    ALL_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/columns'
import {
    fetchAiAgentAutomatedInteractionsPerChannel,
    useAiAgentAutomatedInteractionsPerChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsPerChannel'
import {
    fetchAiAgentCostSavedPerChannel,
    useAiAgentCostSavedPerChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentCostSavedPerChannel'
import {
    fetchAiAgentCoverageRatePerChannel,
    useAiAgentCoverageRatePerChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentCoverageRatePerChannel'
import {
    fetchAiAgentHandoverInteractionsPerChannel,
    useAiAgentHandoverInteractionsPerChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentHandoverInteractionsPerChannel'
import {
    fetchAiAgentSuccessRatePerChannel,
    useAiAgentSuccessRatePerChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSuccessRatePerChannel'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

export type AllAgentsChannelName =
    | 'email'
    | 'chat'
    | 'sms'
    | 'contact-form'
    | 'help-center'
    | 'voice'

export const ALL_AGENTS_CHANNEL_ENTITIES: AllAgentsChannelName[] = [
    'email',
    'chat',
    'sms',
    'contact-form',
    'help-center',
    'voice',
]

export type AllAgentsPerformanceByChannelEntityMetrics = {
    entity: AllAgentsChannelName
    automatedInteractions: number | null
    handoverInteractions: number | null
    costSaved: number | null
    coverageRate: number | null
    successRate: number | null
}

export type AllAgentsPerformanceByChannelMetricsData = {
    data: AllAgentsPerformanceByChannelEntityMetrics[] | undefined
    isLoading: boolean
    isError: boolean
    loadingStates: {
        automatedInteractions: boolean
        handoverInteractions: boolean
        costSaved: boolean
        coverageRate: boolean
        successRate: boolean
    }
}

type AllAgentsPerformanceByChannelMetricKeys =
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'costSaved'
    | 'coverageRate'
    | 'successRate'

const buildAllAgentsPerformanceByChannelRow =
    (
        entityData: Record<
            AllAgentsPerformanceByChannelMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (
        entity: AllAgentsChannelName,
    ): AllAgentsPerformanceByChannelEntityMetrics => ({
        entity,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        costSaved: entityData.costSaved[entity] ?? null,
        coverageRate: entityData.coverageRate[entity] ?? null,
        successRate: entityData.successRate[entity] ?? null,
    })

const ALL_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG: Record<
    AllAgentsPerformanceByChannelMetricKeys,
    EntityMetricConfig
> = {
    automatedInteractions: {
        use: useAiAgentAutomatedInteractionsPerChannel,
        fetch: fetchAiAgentAutomatedInteractionsPerChannel,
    },
    handoverInteractions: {
        use: useAiAgentHandoverInteractionsPerChannel,
        fetch: fetchAiAgentHandoverInteractionsPerChannel,
    },
    costSaved: {
        use: useAiAgentCostSavedPerChannel,
        fetch: fetchAiAgentCostSavedPerChannel,
    },
    coverageRate: {
        use: useAiAgentCoverageRatePerChannel,
        fetch: fetchAiAgentCoverageRatePerChannel,
    },
    successRate: {
        use: useAiAgentSuccessRatePerChannel,
        fetch: fetchAiAgentSuccessRatePerChannel,
    },
}

export const useAllAgentsPerformanceByChannelMetrics =
    (): AllAgentsPerformanceByChannelMetricsData => {
        const { statsFilters, userTimezone } = useAutomateFilters()

        const {
            data: entityData,
            isLoading,
            isError,
            loadingStates: entityLoadingStates,
        } = useEntityMetrics(
            ALL_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG,
            statsFilters,
            userTimezone,
        )

        const data = useMemo(() => {
            const filteredEntities = filterEntitiesWithData(
                ALL_AGENTS_CHANNEL_ENTITIES,
                entityData,
                isLoading,
            )
            return assembleEntityRows(
                entityData,
                filteredEntities,
                buildAllAgentsPerformanceByChannelRow(entityData),
                { skipEmptyCheck: isLoading },
            )
        }, [entityData, isLoading])

        const loadingStates = useMemo(
            () => ({
                automatedInteractions:
                    entityLoadingStates.automatedInteractions,
                handoverInteractions: entityLoadingStates.handoverInteractions,
                costSaved: entityLoadingStates.costSaved,
                coverageRate: entityLoadingStates.coverageRate,
                successRate: entityLoadingStates.successRate,
            }),
            [entityLoadingStates],
        )

        return { data, isLoading, isError, loadingStates }
    }

function createAllAgentsPerformanceByChannelFetchConfig(
    costSavedPerInteraction: number,
): Record<AllAgentsPerformanceByChannelMetricKeys, EntityMetricConfig> {
    return {
        ...ALL_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG,
        costSaved: {
            ...ALL_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG.costSaved,
            fetch: (filters, tz) =>
                fetchAiAgentCostSavedPerChannel(
                    filters,
                    tz,
                    costSavedPerInteraction,
                ),
        },
    }
}

const ALL_AGENTS_PERFORMANCE_BY_CHANNEL_FILENAME = `${ALL_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchAllAgentsPerformanceByChannelMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        ALL_AGENTS_PERFORMANCE_BY_CHANNEL_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        createAllAgentsPerformanceByChannelFetchConfig(costSavedPerInteraction),
        periodFilters,
        timezone,
    )

    const data = assembleEntityRows(
        metrics.data,
        filterEntitiesWithData(
            ALL_AGENTS_CHANNEL_ENTITIES,
            metrics.data,
            false,
        ),
        buildAllAgentsPerformanceByChannelRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        ALL_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE.title,
        ...ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        formatChannelName(row.entity),
        ...ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof AllAgentsPerformanceByChannelEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchAllAgentsPerformanceByChannelReport: ReportFetch = async (
    statsFilters,
    timezone,
    _granularity,
    context,
) => ({
    isLoading: false,
    ...(await fetchAllAgentsPerformanceByChannelMetrics(
        statsFilters,
        timezone,
        context.costSavedPerInteraction,
    )),
})
