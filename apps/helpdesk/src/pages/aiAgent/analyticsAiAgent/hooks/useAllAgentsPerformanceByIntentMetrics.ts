import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type {
    FetchEntityMetricConfig,
    UseEntityMetricConfig,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportFetch } from 'domains/reporting/pages/dashboards/types'
import {
    ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
    ALL_AGENTS_PERFORMANCE_BY_INTENT_TABLE,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'
import {
    fetchAiAgentCoverageRatePerIntent,
    useAiAgentCoverageRatePerIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentCoverageRatePerIntent'
import {
    fetchAiAgentSuccessRatePerIntent,
    useAiAgentSuccessRatePerIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSuccessRatePerIntent'
import {
    fetchAutomatedInteractionsPerIntent,
    useAutomatedInteractionsPerIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerIntent'
import {
    fetchCostSavedPerIntent,
    useCostSavedPerIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useCostSavedPerIntent'
import {
    fetchHandoverInteractionsPerAllAgentsIntent,
    useHandoverInteractionsPerAllAgentsIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerAllAgentsIntent'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

const parseIntentLevels = (
    intentString: string,
): { l1: string; l2: string } => {
    const parts = intentString.split('::')
    return {
        l1: parts[0]?.trim() || '',
        l2: parts[1]?.trim() || '',
    }
}

export type AllAgentsPerformanceByIntentEntityMetrics = {
    entity: string
    intentL1: string
    intentL2: string
    automatedInteractions: number | null
    handoverInteractions: number | null
    coverageRate: number | null
    successRate: number | null
    costSaved: number | null
}

type AllAgentsPerformanceByIntentMetricKeys =
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'coverageRate'
    | 'successRate'
    | 'costSaved'

const buildAllAgentsPerformanceByIntentRow =
    (
        entityData: Record<
            AllAgentsPerformanceByIntentMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: string): AllAgentsPerformanceByIntentEntityMetrics => {
        const { l1, l2 } = parseIntentLevels(entity)
        return {
            entity,
            intentL1: l1,
            intentL2: l2,
            automatedInteractions:
                entityData.automatedInteractions[entity] ?? null,
            handoverInteractions:
                entityData.handoverInteractions[entity] ?? null,
            coverageRate: entityData.coverageRate[entity] ?? null,
            successRate: entityData.successRate[entity] ?? null,
            costSaved: entityData.costSaved[entity] ?? null,
        }
    }

const deriveEntities = (
    entityData: Record<
        AllAgentsPerformanceByIntentMetricKeys,
        Partial<Record<string, number | null | undefined>>
    >,
): string[] => {
    const allKeys = new Set<string>()
    Object.values(entityData).forEach((map) => {
        Object.keys(map).forEach((key) => {
            if (key) allKeys.add(key)
        })
    })
    return Array.from(allKeys)
}

export const useAllAgentsPerformanceByIntentMetrics = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const metricsConfig: Record<
        AllAgentsPerformanceByIntentMetricKeys,
        UseEntityMetricConfig
    > = {
        automatedInteractions: { use: useAutomatedInteractionsPerIntent },
        handoverInteractions: {
            use: useHandoverInteractionsPerAllAgentsIntent,
        },
        coverageRate: { use: useAiAgentCoverageRatePerIntent },
        successRate: { use: useAiAgentSuccessRatePerIntent },
        costSaved: { use: useCostSavedPerIntent },
    }

    const {
        data: entityData,
        isLoading,
        isError,
        loadingStates: entityLoadingStates,
    } = useEntityMetrics(metricsConfig, statsFilters, userTimezone)

    const entities = useMemo(
        () => (isLoading ? [] : deriveEntities(entityData)),
        [entityData, isLoading],
    )

    const data = useMemo(
        () =>
            assembleEntityRows(
                entityData,
                entities,
                buildAllAgentsPerformanceByIntentRow(entityData),
                { skipEmptyCheck: isLoading },
            ),
        [entityData, entities, isLoading],
    )

    const loadingStates = useMemo(
        () => ({
            automatedInteractions: entityLoadingStates.automatedInteractions,
            handoverInteractions: entityLoadingStates.handoverInteractions,
            coverageRate: entityLoadingStates.coverageRate,
            successRate: entityLoadingStates.successRate,
            costSaved: entityLoadingStates.costSaved,
        }),
        [entityLoadingStates],
    )

    return { data, isLoading, isError, loadingStates }
}

const ALL_AGENTS_PERFORMANCE_BY_INTENT_FILENAME = `${ALL_AGENTS_PERFORMANCE_BY_INTENT_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchAllAgentsPerformanceByIntentMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        ALL_AGENTS_PERFORMANCE_BY_INTENT_FILENAME,
    )

    const fetchConfig: Record<
        AllAgentsPerformanceByIntentMetricKeys,
        FetchEntityMetricConfig
    > = {
        automatedInteractions: { fetch: fetchAutomatedInteractionsPerIntent },
        handoverInteractions: {
            fetch: fetchHandoverInteractionsPerAllAgentsIntent,
        },
        coverageRate: { fetch: fetchAiAgentCoverageRatePerIntent },
        successRate: { fetch: fetchAiAgentSuccessRatePerIntent },
        costSaved: {
            fetch: (filters, timezone) =>
                fetchCostSavedPerIntent(
                    filters,
                    timezone,
                    costSavedPerInteraction,
                ),
        },
    }

    const metrics = await fetchEntityMetrics(
        fetchConfig,
        periodFilters,
        timezone,
    )

    const entities = deriveEntities(metrics.data)

    const data = assembleEntityRows(
        metrics.data,
        entities,
        buildAllAgentsPerformanceByIntentRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        'Intent L1',
        'Intent L2',
        ...ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        row.intentL1,
        row.intentL2,
        ...ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof AllAgentsPerformanceByIntentEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchAllAgentsPerformanceByIntentReport: ReportFetch = async (
    statsFilters,
    timezone,
    _granularity,
    context,
) => ({
    isLoading: false,
    ...(await fetchAllAgentsPerformanceByIntentMetrics(
        statsFilters,
        timezone,
        context.costSavedPerInteraction,
    )),
})
