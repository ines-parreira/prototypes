import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
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
import {
    SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
    SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_TABLE,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'
import {
    fetchAutomatedInteractionsPerSupportAgentIntent,
    useAutomatedInteractionsPerSupportAgentIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerSupportAgentIntent'
import {
    fetchCostSavedPerSupportAgentIntent,
    useCostSavedPerSupportAgentIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useCostSavedPerSupportAgentIntent'
import {
    fetchDecreaseInFRTPerSupportAgentIntent,
    useDecreaseInFRTPerSupportAgentIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useDecreaseInFRTPerSupportAgentIntent'
import {
    fetchHandoverInteractionsPerSupportAgentIntent,
    useHandoverInteractionsPerSupportAgentIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerSupportAgentIntent'
import {
    fetchSuccessRatePerSupportAgentIntent,
    useSuccessRatePerSupportAgentIntent,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useSuccessRatePerSupportAgentIntent'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
// import {
//     fetchTimeSavedByAgentPerSupportAgentIntent,
//     useTimeSavedByAgentPerSupportAgentIntent,
// } from 'pages/aiAgent/analyticsAiAgent/hooks/useTimeSavedByAgentPerSupportAgentIntent'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

const parseIntentLevels = (
    intentString: string,
): { intentL1: string; intentL2: string } => {
    const parts = intentString.split('::')

    return {
        intentL1: parts[0]?.trim() || '',
        intentL2: parts[1]?.trim() || '',
    }
}

// TODO: timeSaved is commented out — breakdown by intent is not ready on the BE side yet

export type SupportAgentsPerformanceByIntentEntityMetrics = {
    entity: string
    intentL1: string
    intentL2: string
    automatedInteractions: number | null
    handoverInteractions: number | null
    successRate: number | null
    // timeSaved: number | null
    costSaved: number | null
    decreaseInFRT: number | null
}

type SupportAgentsPerformanceByIntentMetricKeys =
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'successRate'
    // | 'timeSaved'
    | 'costSaved'
    | 'decreaseInFRT'

const buildSupportAgentsPerformanceByIntentRow =
    (
        entityData: Record<
            SupportAgentsPerformanceByIntentMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: string): SupportAgentsPerformanceByIntentEntityMetrics => {
        const { intentL1, intentL2 } = parseIntentLevels(entity)

        return {
            entity,
            intentL1,
            intentL2,
            automatedInteractions:
                entityData.automatedInteractions[entity] ?? null,
            handoverInteractions:
                entityData.handoverInteractions[entity] ?? null,
            successRate: entityData.successRate[entity] ?? null,
            // timeSaved: entityData.timeSaved[entity] ?? null,
            costSaved: entityData.costSaved[entity] ?? null,
            decreaseInFRT: entityData.decreaseInFRT[entity] ?? null,
        }
    }

const deriveEntities = (
    entityData: Record<
        SupportAgentsPerformanceByIntentMetricKeys,
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

export const useSupportAgentsPerformanceByIntentMetrics = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const metricsConfig: Record<
        SupportAgentsPerformanceByIntentMetricKeys,
        UseEntityMetricConfig
    > = {
        automatedInteractions: {
            use: useAutomatedInteractionsPerSupportAgentIntent,
        },
        handoverInteractions: {
            use: useHandoverInteractionsPerSupportAgentIntent,
        },
        successRate: {
            use: useSuccessRatePerSupportAgentIntent,
        },
        // timeSaved: {
        //     use: useTimeSavedByAgentPerSupportAgentIntent,
        // },
        costSaved: {
            use: useCostSavedPerSupportAgentIntent,
        },
        decreaseInFRT: {
            use: useDecreaseInFRTPerSupportAgentIntent,
        },
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
                buildSupportAgentsPerformanceByIntentRow(entityData),
            ),
        [entities, entityData],
    )

    const loadingStates = useMemo(
        () => ({
            automatedInteractions: entityLoadingStates.automatedInteractions,
            handoverInteractions: entityLoadingStates.handoverInteractions,
            successRate: entityLoadingStates.successRate,
            // timeSaved: entityLoadingStates.timeSaved,
            costSaved: entityLoadingStates.costSaved,
            decreaseInFRT: entityLoadingStates.decreaseInFRT,
        }),
        [entityLoadingStates],
    )

    return { data, isLoading, isError, loadingStates }
}

const SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_FILENAME = `${SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchSupportAgentsPerformanceByIntentMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_FILENAME,
    )

    const fetchConfig: Record<
        SupportAgentsPerformanceByIntentMetricKeys,
        FetchEntityMetricConfig
    > = {
        automatedInteractions: {
            fetch: fetchAutomatedInteractionsPerSupportAgentIntent,
        },
        handoverInteractions: {
            fetch: fetchHandoverInteractionsPerSupportAgentIntent,
        },
        successRate: {
            fetch: fetchSuccessRatePerSupportAgentIntent,
        },
        // timeSaved: {
        //     fetch: fetchTimeSavedByAgentPerSupportAgentIntent,
        // },
        costSaved: {
            fetch: (filters, tz) =>
                fetchCostSavedPerSupportAgentIntent(
                    filters,
                    tz,
                    costSavedPerInteraction,
                ),
        },
        decreaseInFRT: {
            fetch: fetchDecreaseInFRTPerSupportAgentIntent,
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
        buildSupportAgentsPerformanceByIntentRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        'Intent L1',
        'Intent L2',
        ...SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        row.intentL1,
        row.intentL2,
        ...SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof SupportAgentsPerformanceByIntentEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchSupportAgentsPerformanceByIntentAsConfigurableTable: ConfigurableGraphFetch =
    async (_savedMeasure, _savedDimension, filters, timezone) => {
        const { files } = await fetchSupportAgentsPerformanceByIntentMetrics(
            filters,
            timezone,
        )

        return { files }
    }
