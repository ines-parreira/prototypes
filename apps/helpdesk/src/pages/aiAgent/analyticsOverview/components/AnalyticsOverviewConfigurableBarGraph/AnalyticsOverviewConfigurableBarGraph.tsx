import { useMemo } from 'react'

import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import { dynamicOverallAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import { dynamicMedianTimeSavedByAgentQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { AiAgentConfigurableGraphWrapper as ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/AiAgentConfigurableGraphWrapper'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import {
    getBarChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { BarChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const OVERVIEW_BAR_CHART_METRICS: BarChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOverallAutomationRateQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'automationFeatureType'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOverallAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'automationFeatureType'],
    },
    {
        measure: 'medianTimeSavedByAgent',
        name: 'Time saved by agents',
        metricFormat: 'duration' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicMedianTimeSavedByAgentQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'automationFeatureType'],
    },
    {
        measure: 'costSaved',
        name: 'Cost saved',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOverallAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'automationFeatureType'],
        valueTransform: (v, extra) =>
            v !== null && extra?.costSavedPerInteraction != null
                ? v * extra.costSavedPerInteraction
                : null,
    },
]

export const AnalyticsOverviewConfigurableBarGraph = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const stores = useStoreIntegrations()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const metrics = useMemo(
        () =>
            getBarChartGraphConfig(
                OVERVIEW_BAR_CHART_METRICS,
                statsFilters,
                userTimezone,
                { stores, costSavedPerInteraction },
            ),
        [statsFilters, userTimezone, stores, costSavedPerInteraction],
    )

    return (
        <ConfigurableGraphWrapper
            metrics={metrics}
            analyticsChartId={chartId ?? ''}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}
