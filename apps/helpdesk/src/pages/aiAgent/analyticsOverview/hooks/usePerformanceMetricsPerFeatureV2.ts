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
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    PERFORMANCE_BREAKDOWN_COLUMNS,
    PERFORMANCE_BREAKDOWN_TABLE,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import {
    fetchAutomatedInteractionsPerFeature,
    useAutomatedInteractionsPerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/useAutomatedInteractionsPerFeature'
import {
    fetchCostSavedPerFeature,
    useCostSavedPerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/useCostSavedPerFeature'
import {
    fetchHandoverInteractionsPerFeature,
    useHandoverInteractionsPerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFeature'
import {
    fetchOverallAutomationRatePerFeature,
    useOverallAutomationRatePerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRatePerFeature'
import type {
    FeatureMetrics,
    FeatureName,
} from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'
import {
    fetchTimeSavedPerFeature,
    useTimeSavedPerFeature,
} from 'pages/aiAgent/analyticsOverview/hooks/useTimeSavedPerFeature'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

const FEATURE_TYPE_TO_NAME: Record<AutomationFeatureType, FeatureName> = {
    [AutomationFeatureType.AiAgent]: 'AI Agent',
    [AutomationFeatureType.Flows]: 'Flows',
    [AutomationFeatureType.ArticleRecommendation]: 'Article Recommendation',
    [AutomationFeatureType.OrderManagement]: 'Order Management',
}

const FEATURE_ENTITIES: AutomationFeatureType[] = [
    AutomationFeatureType.AiAgent,
    AutomationFeatureType.ArticleRecommendation,
    AutomationFeatureType.Flows,
    AutomationFeatureType.OrderManagement,
]

type AllFeaturesMetricKeys =
    | 'automationRate'
    | 'automatedInteractions'
    | 'handoverInteractions'
    | 'costSaved'
    | 'timeSaved'

const buildAllFeaturesRow =
    (
        entityData: Record<
            AllFeaturesMetricKeys,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: AutomationFeatureType): FeatureMetrics => ({
        feature: FEATURE_TYPE_TO_NAME[entity],
        automationRate: entityData.automationRate[entity] ?? null,
        automatedInteractions: entityData.automatedInteractions[entity] ?? null,
        handoverInteractions: entityData.handoverInteractions[entity] ?? null,
        costSaved: entityData.costSaved[entity] ?? null,
        timeSaved: entityData.timeSaved[entity] ?? null,
    })

const ALL_FEATURES_METRICS_CONFIG: Record<
    AllFeaturesMetricKeys,
    EntityMetricConfig
> = {
    automationRate: {
        use: useOverallAutomationRatePerFeature,
        fetch: fetchOverallAutomationRatePerFeature,
    },
    automatedInteractions: {
        use: useAutomatedInteractionsPerFeature,
        fetch: fetchAutomatedInteractionsPerFeature,
    },
    handoverInteractions: {
        use: useHandoverInteractionsPerFeature,
        fetch: fetchHandoverInteractionsPerFeature,
    },
    costSaved: {
        use: useCostSavedPerFeature,
        fetch: fetchCostSavedPerFeature,
    },
    timeSaved: {
        use: useTimeSavedPerFeature,
        fetch: fetchTimeSavedPerFeature,
    },
}

export const usePerformanceMetricsPerFeatureV2 = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const {
        data: entityData,
        isLoading,
        isError,
        loadingStates,
    } = useEntityMetrics(
        ALL_FEATURES_METRICS_CONFIG,
        statsFilters,
        userTimezone,
    )

    const data = useMemo(() => {
        return assembleEntityRows(
            FEATURE_ENTITIES,
            buildAllFeaturesRow(entityData),
        )
    }, [entityData])

    return { data, isLoading, isError, loadingStates }
}

function createAllFeaturesFetchConfig(
    costSavedPerInteraction: number,
): Record<AllFeaturesMetricKeys, EntityMetricConfig> {
    return {
        ...ALL_FEATURES_METRICS_CONFIG,
        costSaved: {
            ...ALL_FEATURES_METRICS_CONFIG.costSaved,
            fetch: (filters, tz) =>
                fetchCostSavedPerFeature(filters, tz, costSavedPerInteraction),
        },
    }
}

const ALL_FEATURES_FILENAME = `${PERFORMANCE_BREAKDOWN_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`

export const fetchPerformanceMetricsPerFeatureV2 = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        ALL_FEATURES_FILENAME,
    )

    const metrics = await fetchEntityMetrics(
        createAllFeaturesFetchConfig(costSavedPerInteraction),
        statsFilters,
        timezone,
    )

    const data = assembleEntityRows(
        FEATURE_ENTITIES,
        buildAllFeaturesRow(metrics.data),
    )

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        PERFORMANCE_BREAKDOWN_TABLE.title,
        ...PERFORMANCE_BREAKDOWN_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        row.feature,
        ...PERFORMANCE_BREAKDOWN_COLUMNS.map((col) =>
            formatMetricValue(
                row[col.accessorKey as keyof FeatureMetrics] as number,
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchPerformanceMetricsPerFeatureV2AsConfigurableTable: ConfigurableGraphFetch =
    async (
        _savedMeasure,
        _savedDimension,
        filters,
        timezone,
        _granularity,
        extra,
    ) => {
        const { files } = await fetchPerformanceMetricsPerFeatureV2(
            filters,
            timezone,
            extra?.costSavedPerInteraction,
        )
        return { files }
    }
