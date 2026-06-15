import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { DefaultExportStore as store } from 'common/store/store'
import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { EntityMetricConfig } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    assembleEntityRows,
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { StoreIntegration } from 'models/integration/types'
import {
    STORE_INTEGRATION_COLUMNS,
    STORE_INTEGRATION_TABLE,
} from 'pages/aiAgent/analyticsOverview/components/StoreIntegrationTable/columns'
import {
    fetchAutomatedInteractionsPerStore,
    useAutomatedInteractionsPerStore,
} from 'pages/aiAgent/analyticsOverview/hooks/useAutomatedInteractionsPerStore'
import {
    fetchCostSavedPerStore,
    useCostSavedPerStore,
} from 'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerStore'
import {
    fetchDecreaseInFirstResponseTimePerStore,
    useDecreaseInFirstResponseTimePerStore,
} from 'pages/aiAgent/analyticsOverview/hooks/useDecreaseInFirstResponseTimePerStore'
import {
    fetchDecreaseInResolutionTimePerStore,
    useDecreaseInResolutionTimePerStore,
} from 'pages/aiAgent/analyticsOverview/hooks/useDecreaseInResolutionTimePerStore'
import {
    fetchHandoverInteractionsPerStore,
    useHandoverInteractionsPerStore,
} from 'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerStore'
import {
    fetchOverallAutomationRatePerStore,
    useOverallAutomationRatePerStore,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRatePerStore'
import {
    fetchTimeSavedPerStore,
    useTimeSavedPerStore,
} from 'pages/aiAgent/analyticsOverview/hooks/useTimeSavedPerStore'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { useStoreIntegrations } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { STORE_INTEGRATION_TYPES } from 'pages/automate/common/hooks/useStoreIntegrations'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import { createCsv } from 'utils/file'

export type StoreIntegrationEntityMetrics = {
    entity: string
    automationRate: number | null
    automatedInteractions: number | null
    handoverInteractions: number | null
    costSaved: number | null
    timeSaved: number | null
    decreaseInResolutionTime: number | null
    decreaseInFirstResponseTime: number | null
}

type StoreIntegrationMetricKeys =
    | 'overallAutomationRate'
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'costSaved'
    | 'timeSaved'
    | 'decreaseInResolutionTime'
    | 'decreaseInFirstResponseTime'

const buildStoreIntegrationRow =
    (
        entityData: Record<
            StoreIntegrationMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: string): StoreIntegrationEntityMetrics => ({
        entity,
        automationRate: entityData.overallAutomationRate[entity] ?? null,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        costSaved: entityData.costSaved[entity] ?? null,
        timeSaved: entityData.timeSaved[entity] ?? null,
        decreaseInResolutionTime:
            entityData.decreaseInResolutionTime[entity] ?? null,
        decreaseInFirstResponseTime:
            entityData.decreaseInFirstResponseTime[entity] ?? null,
    })

const STORE_INTEGRATION_METRICS_CONFIG: Record<
    StoreIntegrationMetricKeys,
    EntityMetricConfig
> = {
    overallAutomationRate: {
        use: useOverallAutomationRatePerStore,
        fetch: fetchOverallAutomationRatePerStore,
    },
    automatedInteractions: {
        use: useAutomatedInteractionsPerStore,
        fetch: fetchAutomatedInteractionsPerStore,
    },
    handoverInteractions: {
        use: useHandoverInteractionsPerStore,
        fetch: fetchHandoverInteractionsPerStore,
    },
    costSaved: {
        use: useCostSavedPerStore,
        fetch: fetchCostSavedPerStore,
    },
    timeSaved: {
        use: useTimeSavedPerStore,
        fetch: fetchTimeSavedPerStore,
    },
    decreaseInResolutionTime: {
        use: useDecreaseInResolutionTimePerStore,
        fetch: fetchDecreaseInResolutionTimePerStore,
    },
    decreaseInFirstResponseTime: {
        use: useDecreaseInFirstResponseTimePerStore,
        fetch: fetchDecreaseInFirstResponseTimePerStore,
    },
}

function createStoreIntegrationFetchConfig(
    costSavedPerInteraction: number,
): Record<StoreIntegrationMetricKeys, EntityMetricConfig> {
    return {
        ...STORE_INTEGRATION_METRICS_CONFIG,
        costSaved: {
            ...STORE_INTEGRATION_METRICS_CONFIG.costSaved,
            fetch: (filters, tz) =>
                fetchCostSavedPerStore(filters, tz, costSavedPerInteraction),
        },
    }
}

export const useStoreIntegrationMetrics = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const storeIntegrations = useStoreIntegrations()

    const entities = useMemo(
        () => storeIntegrations.map((s) => s.store_integration_id.toString()),
        [storeIntegrations],
    )

    const displayNames = useMemo(
        () =>
            Object.fromEntries(
                storeIntegrations.map((s) => [
                    s.store_integration_id.toString(),
                    s.name,
                ]),
            ),
        [storeIntegrations],
    )

    const {
        data: entityData,
        isLoading,
        isError,
        loadingStates: entityLoadingStates,
    } = useEntityMetrics(
        STORE_INTEGRATION_METRICS_CONFIG,
        statsFilters,
        userTimezone,
    )

    const data = useMemo(
        () =>
            assembleEntityRows(entities, buildStoreIntegrationRow(entityData)),
        [entityData, entities],
    )

    const loadingStates = useMemo(
        () => ({
            automationRate: entityLoadingStates.overallAutomationRate,
            automatedInteractions: entityLoadingStates.automatedInteractions,
            handoverInteractions: entityLoadingStates.handoverInteractions,
            timeSaved: entityLoadingStates.timeSaved,
            costSaved: entityLoadingStates.costSaved,
            decreaseInResolutionTime:
                entityLoadingStates.decreaseInResolutionTime,
            decreaseInFirstResponseTime:
                entityLoadingStates.decreaseInFirstResponseTime,
        }),
        [entityLoadingStates],
    )

    return { data, isLoading, isError, loadingStates, displayNames }
}

const STORE_INTEGRATION_FILENAME = `${STORE_INTEGRATION_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchStoreIntegrationMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
    displayNames: Record<string, string> = {},
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        STORE_INTEGRATION_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        createStoreIntegrationFetchConfig(costSavedPerInteraction),
        statsFilters,
        timezone,
    )

    const entities = Object.keys(metrics.data.automatedInteractions ?? {})
    const data = assembleEntityRows(
        entities,
        buildStoreIntegrationRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        STORE_INTEGRATION_TABLE.title,
        ...STORE_INTEGRATION_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        displayNames[row.entity] ?? row.entity,
        ...STORE_INTEGRATION_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as keyof StoreIntegrationEntityMetrics
                ] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchStoreIntegrationAsConfigurableTable: ConfigurableGraphFetch =
    async (
        _savedMeasure,
        _savedDimension,
        filters,
        timezone,
        _granularity,
        extra,
    ) => {
        const integrations = getIntegrationsByTypes(STORE_INTEGRATION_TYPES)(
            store.getState(),
        ) as StoreIntegration[]
        const displayNames = Object.fromEntries(
            integrations.map((s) => [s.id.toString(), s.name]),
        )
        const { files } = await fetchStoreIntegrationMetrics(
            filters,
            timezone,
            extra?.costSavedPerInteraction,
            displayNames,
        )
        return { files }
    }
