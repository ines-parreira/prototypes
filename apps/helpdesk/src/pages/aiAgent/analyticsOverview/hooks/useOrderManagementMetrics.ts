import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { EntityMetricConfig } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportFetch } from 'domains/reporting/pages/dashboards/types'
import {
    ENTITY_DISPLAY_NAMES,
    ORDER_MANAGEMENT_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import {
    fetchAutomatedInteractionsPerOrderManagementType,
    useAutomatedInteractionsPerOrderManagementType,
} from 'pages/aiAgent/analyticsOverview/hooks/useAutomatedInteractionsPerOrderManagementType'
import {
    fetchCostSavedPerOrderManagementType,
    useCostSavedPerOrderManagementType,
} from 'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerOrderManagementType'
import {
    fetchHandoverInteractionsPerOrderManagementType,
    useHandoverInteractionsPerOrderManagementType,
} from 'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerOrderManagementType'
import {
    fetchOverallAutomationRatePerOrderManagementType,
    useOverallAutomationRatePerOrderManagementType,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRatePerOrderManagementType'
import {
    fetchOverallTimeSavedByAgentPerOrderManagementType,
    useOverallTimeSavedByAgentPerOrderManagementType,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallTimeSavedByAgentPerOrderManagementType'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

export type OrderManagementEntityName =
    | 'cancel_order'
    | 'track_order'
    | 'loop_returns_started'
    | 'automated_response_started'

export const ORDER_MANAGEMENT_ENTITIES: OrderManagementEntityName[] = [
    'cancel_order',
    'track_order',
    'loop_returns_started',
    'automated_response_started',
]

export type OrderManagementEntityMetrics = {
    entity: OrderManagementEntityName
    automationRate: number | null
    automatedInteractions: number | null
    handoverInteractions: number | null
    costSaved: number | null
    timeSaved: number | null
}

export type OrderManagementMetricsData = {
    data: OrderManagementEntityMetrics[] | undefined
    isLoading: boolean
    isError: boolean
    loadingStates: {
        automationRate: boolean
        automatedInteractions: boolean
        handoverInteractions: boolean
        timeSaved: boolean
        costSaved: boolean
    }
}

type OrderManagementMetricKeys =
    | 'overallAutomationRate'
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'costSaved'
    | 'timeSaved'

const buildOrderManagementRow =
    (
        entityData: Record<
            OrderManagementMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: OrderManagementEntityName): OrderManagementEntityMetrics => ({
        entity,
        automationRate: entityData.overallAutomationRate[entity] ?? null,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        costSaved: entityData.costSaved[entity] ?? null,
        timeSaved: entityData.timeSaved[entity] ?? null,
    })

const ORDER_MANAGEMENT_METRICS_CONFIG: Record<
    OrderManagementMetricKeys,
    EntityMetricConfig
> = {
    overallAutomationRate: {
        use: useOverallAutomationRatePerOrderManagementType,
        fetch: fetchOverallAutomationRatePerOrderManagementType,
    },
    automatedInteractions: {
        use: useAutomatedInteractionsPerOrderManagementType,
        fetch: fetchAutomatedInteractionsPerOrderManagementType,
    },
    handoverInteractions: {
        use: useHandoverInteractionsPerOrderManagementType,
        fetch: fetchHandoverInteractionsPerOrderManagementType,
    },
    costSaved: {
        use: useCostSavedPerOrderManagementType,
        fetch: fetchCostSavedPerOrderManagementType,
    },
    timeSaved: {
        use: useOverallTimeSavedByAgentPerOrderManagementType,
        fetch: fetchOverallTimeSavedByAgentPerOrderManagementType,
    },
}

export const useOrderManagementMetrics = (): OrderManagementMetricsData => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const {
        data: entityData,
        isLoading,
        isError,
        loadingStates: entityLoadingStates,
    } = useEntityMetrics(
        ORDER_MANAGEMENT_METRICS_CONFIG,
        statsFilters,
        userTimezone,
    )

    const data = useMemo(
        () =>
            assembleEntityRows(
                entityData,
                ORDER_MANAGEMENT_ENTITIES,
                buildOrderManagementRow(entityData),
                { skipEmptyCheck: isLoading },
            ),
        [entityData, isLoading],
    )

    const loadingStates = useMemo(
        () => ({
            automationRate: entityLoadingStates.overallAutomationRate,
            automatedInteractions: entityLoadingStates.automatedInteractions,
            handoverInteractions: entityLoadingStates.handoverInteractions,
            timeSaved: entityLoadingStates.timeSaved,
            costSaved: entityLoadingStates.costSaved,
        }),
        [entityLoadingStates],
    )

    return { data, isLoading, isError, loadingStates }
}

const ORDER_MANAGEMENT_FILENAME = 'order-management-breakdown'

export const fetchOrderManagementMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        ORDER_MANAGEMENT_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        {
            ...ORDER_MANAGEMENT_METRICS_CONFIG,
            costSaved: {
                ...ORDER_MANAGEMENT_METRICS_CONFIG.costSaved,
                fetch: (filters, tz) =>
                    fetchCostSavedPerOrderManagementType(
                        filters,
                        tz,
                        costSavedPerInteraction,
                    ),
            },
        },
        periodFilters,
        timezone,
    )

    const data = assembleEntityRows(
        metrics.data,
        ORDER_MANAGEMENT_ENTITIES,
        buildOrderManagementRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        'Feature name',
        ...ORDER_MANAGEMENT_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        ENTITY_DISPLAY_NAMES[row.entity],
        ...ORDER_MANAGEMENT_COLUMNS.map((col) =>
            formatMetricValue(
                row[col.accessorKey as keyof OrderManagementEntityMetrics] as
                    | number
                    | null,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchOrderManagementReport: ReportFetch = async (
    statsFilters,
    timezone,
    _granularity,
    context,
) => ({
    isLoading: false,
    ...(await fetchOrderManagementMetrics(
        statsFilters,
        timezone,
        context.costSavedPerInteraction,
    )),
})
