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
    fetchWorkflowConfigurations,
    useGetWorkflowConfigurations,
} from 'models/workflows/queries'
import {
    FLOWS_COLUMNS,
    FLOWS_TABLE,
} from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'
import {
    fetchAutomatedInteractionsPerFlows,
    useAutomatedInteractionsPerFlows,
} from 'pages/aiAgent/analyticsOverview/hooks/useAutomatedInteractionsPerFlows'
import {
    fetchAutomationRatePerFlows,
    useAutomationRatePerFlows,
} from 'pages/aiAgent/analyticsOverview/hooks/useAutomationRatePerFlows'
import {
    fetchCostSavedPerFlows,
    useCostSavedPerFlows,
} from 'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerFlows'
import {
    fetchHandoverInteractionsPerFlows,
    useHandoverInteractionsPerFlows,
} from 'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFlows'
import {
    fetchTimeSavedPerFlows,
    useTimeSavedPerFlows,
} from 'pages/aiAgent/analyticsOverview/hooks/useTimeSavedPerFlows'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

export type FlowsEntityMetrics = {
    entity: string
    automationRate: number | null
    automatedInteractions: number | null
    handoverInteractions: number | null
    costSaved: number | null
    timeSaved: number | null
}

type FlowsMetricKeys =
    | 'overallAutomationRate'
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'costSaved'
    | 'timeSaved'

const buildFlowsRow =
    (
        entityData: Record<
            FlowsMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: string): FlowsEntityMetrics => ({
        entity,
        automationRate: entityData.overallAutomationRate[entity] ?? null,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        costSaved: entityData.costSaved[entity] ?? null,
        timeSaved: entityData.timeSaved[entity] ?? null,
    })

type Workflow = { id: string; name: string }

const getEntities = (workflows: Workflow[]) => workflows.map((w) => w.id)

const getDisplayNames = (workflows: Workflow[]): Record<string, string> =>
    Object.fromEntries(workflows.map((w) => [w.id, w.name]))

const FLOWS_METRICS_CONFIG: Record<FlowsMetricKeys, EntityMetricConfig> = {
    overallAutomationRate: {
        use: useAutomationRatePerFlows,
        fetch: fetchAutomationRatePerFlows,
    },
    automatedInteractions: {
        use: useAutomatedInteractionsPerFlows,
        fetch: fetchAutomatedInteractionsPerFlows,
    },
    handoverInteractions: {
        use: useHandoverInteractionsPerFlows,
        fetch: fetchHandoverInteractionsPerFlows,
    },
    costSaved: {
        use: useCostSavedPerFlows,
        fetch: fetchCostSavedPerFlows,
    },
    timeSaved: {
        use: useTimeSavedPerFlows,
        fetch: fetchTimeSavedPerFlows,
    },
}

function createFlowsFetchConfig(
    costSavedPerInteraction: number,
): Record<FlowsMetricKeys, EntityMetricConfig> {
    return {
        ...FLOWS_METRICS_CONFIG,
        costSaved: {
            ...FLOWS_METRICS_CONFIG.costSaved,
            fetch: (filters, tz) =>
                fetchCostSavedPerFlows(filters, tz, costSavedPerInteraction),
        },
    }
}

export const useFlowsMetrics = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data: workflows, isLoading: isLoadingWorkflows } =
        useGetWorkflowConfigurations()

    const entities = useMemo(() => getEntities(workflows ?? []), [workflows])

    const displayNames = useMemo(
        () => getDisplayNames(workflows ?? []),
        [workflows],
    )

    const {
        data: entityData,
        isLoading: isLoadingMetrics,
        isError,
        loadingStates: entityLoadingStates,
    } = useEntityMetrics(FLOWS_METRICS_CONFIG, statsFilters, userTimezone)

    const isLoading = isLoadingWorkflows || isLoadingMetrics

    const data = useMemo(() => {
        const filteredEntities = filterEntitiesWithData(
            entities,
            entityData,
            isLoading,
        )
        return assembleEntityRows(
            entityData,
            filteredEntities,
            buildFlowsRow(entityData),
            { skipEmptyCheck: isLoading },
        )
    }, [entityData, entities, isLoading])

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

    return { data, isLoading, isError, loadingStates, displayNames }
}

const FLOWS_FILENAME = `${FLOWS_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchFlowsMetrics = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        FLOWS_FILENAME,
    )

    const workflows = await fetchWorkflowConfigurations()
    const entities = getEntities(workflows)
    const displayNames = getDisplayNames(workflows)

    const metrics = await fetchEntityMetrics(
        createFlowsFetchConfig(costSavedPerInteraction),
        periodFilters,
        timezone,
    )

    const data = assembleEntityRows(
        metrics.data,
        filterEntitiesWithData(entities, metrics.data, false),
        buildFlowsRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        FLOWS_TABLE.title,
        ...FLOWS_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        displayNames[row.entity] ?? row.entity,
        ...FLOWS_COLUMNS.map((col) =>
            formatMetricValue(
                row[col.accessorKey as keyof FlowsEntityMetrics] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchFlowsReport: ReportFetch = async (
    statsFilters,
    timezone,
    _granularity,
    context,
) => ({
    isLoading: false,
    ...(await fetchFlowsMetrics(
        statsFilters,
        timezone,
        context.costSavedPerInteraction,
    )),
})
