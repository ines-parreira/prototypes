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
import {
    SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
    SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'
import {
    fetchAutomatedInteractionsPerSupportAgentChannel,
    useAutomatedInteractionsPerSupportAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAutomatedInteractionsPerSupportAgentChannel'
import {
    fetchCostSavedPerSupportAgentChannel,
    useCostSavedPerSupportAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useCostSavedPerSupportAgentChannel'
import {
    fetchDecreaseInFRTPerChannel,
    useDecreaseInFRTPerChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useDecreaseInFRTPerChannel'
import {
    fetchHandoverInteractionsPerSupportAgentChannel,
    useHandoverInteractionsPerSupportAgentChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useHandoverInteractionsPerSupportAgentChannel'
import {
    fetchTimeSavedByAgentPerChannel,
    useTimeSavedByAgentPerChannel,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useTimeSavedByAgentPerChannel'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

export type SupportAgentsChannelName =
    | 'email'
    | 'chat'
    | 'sms'
    | 'contact-form'
    | 'help-center'
    | 'voice'

export const SUPPORT_AGENTS_CHANNEL_ENTITIES: SupportAgentsChannelName[] = [
    'email',
    'chat',
    'contact-form',
    'help-center',
]

export type SupportAgentsPerformanceByChannelEntityMetrics = {
    entity: SupportAgentsChannelName
    automatedInteractions: number | null
    handoverInteractions: number | null
    timeSaved: number | null
    costSaved: number | null
    decreaseInFRT: number | null
}

export type SupportAgentsPerformanceByChannelMetricsData = {
    data: SupportAgentsPerformanceByChannelEntityMetrics[] | undefined
    isLoading: boolean
    isError: boolean
    loadingStates: {
        automatedInteractions: boolean
        handoverInteractions: boolean
        timeSaved: boolean
        costSaved: boolean
        decreaseInFRT: boolean
    }
}

type SupportAgentsPerformanceByChannelMetricKeys =
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'timeSaved'
    | 'costSaved'
    | 'decreaseInFRT'

const buildSupportAgentsPerformanceByChannelRow =
    (
        entityData: Record<
            SupportAgentsPerformanceByChannelMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (
        entity: SupportAgentsChannelName,
    ): SupportAgentsPerformanceByChannelEntityMetrics => ({
        entity,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        timeSaved: entityData.timeSaved[entity] ?? null,
        costSaved: entityData.costSaved[entity] ?? null,
        decreaseInFRT: entityData.decreaseInFRT[entity] ?? null,
    })

const SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG: Record<
    SupportAgentsPerformanceByChannelMetricKeys,
    EntityMetricConfig
> = {
    automatedInteractions: {
        use: useAutomatedInteractionsPerSupportAgentChannel,
        fetch: fetchAutomatedInteractionsPerSupportAgentChannel,
    },
    handoverInteractions: {
        use: useHandoverInteractionsPerSupportAgentChannel,
        fetch: fetchHandoverInteractionsPerSupportAgentChannel,
    },
    timeSaved: {
        use: useTimeSavedByAgentPerChannel,
        fetch: fetchTimeSavedByAgentPerChannel,
    },
    costSaved: {
        use: useCostSavedPerSupportAgentChannel,
        fetch: fetchCostSavedPerSupportAgentChannel,
    },
    decreaseInFRT: {
        use: useDecreaseInFRTPerChannel,
        fetch: fetchDecreaseInFRTPerChannel,
    },
}

export const useSupportAgentsPerformanceByChannelMetrics =
    (): SupportAgentsPerformanceByChannelMetricsData => {
        const { statsFilters, userTimezone } = useAiAgentStatsFilters()

        const {
            data: entityData,
            isLoading,
            isError,
            loadingStates,
        } = useEntityMetrics(
            SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG,
            statsFilters,
            userTimezone,
        )

        const data = useMemo(
            () =>
                assembleEntityRows(
                    SUPPORT_AGENTS_CHANNEL_ENTITIES,
                    buildSupportAgentsPerformanceByChannelRow(entityData),
                ),
            [entityData],
        )

        return { data, isLoading, isError, loadingStates }
    }

function createSupportAgentsPerformanceByChannelFetchConfig(
    costSavedPerInteraction: number,
): Record<SupportAgentsPerformanceByChannelMetricKeys, EntityMetricConfig> {
    return {
        ...SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG,
        costSaved: {
            ...SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_METRICS_CONFIG.costSaved,
            fetch: (filters, tz) =>
                fetchCostSavedPerSupportAgentChannel(
                    filters,
                    tz,
                    costSavedPerInteraction,
                ),
        },
    }
}

const SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_FILENAME = `${SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchSupportAgentsPerformanceByChannelMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        createSupportAgentsPerformanceByChannelFetchConfig(
            costSavedPerInteraction,
        ),
        statsFilters,
        timezone,
    )

    const data = assembleEntityRows(
        SUPPORT_AGENTS_CHANNEL_ENTITIES,
        buildSupportAgentsPerformanceByChannelRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE.title,
        ...SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS.map(
            (col) => col.label,
        ),
    ]
    const rows = data.map((row) => [
        formatChannelName(row.entity),
        ...SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof SupportAgentsPerformanceByChannelEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchSupportAgentsPerformanceByChannelAsConfigurableTable: ConfigurableGraphFetch =
    async (
        _savedMeasure,
        _savedDimension,
        filters,
        timezone,
        _granularity,
        extra,
    ) => {
        const { files } = await fetchSupportAgentsPerformanceByChannelMetrics(
            filters,
            timezone,
            extra?.costSavedPerInteraction,
        )
        return { files }
    }
