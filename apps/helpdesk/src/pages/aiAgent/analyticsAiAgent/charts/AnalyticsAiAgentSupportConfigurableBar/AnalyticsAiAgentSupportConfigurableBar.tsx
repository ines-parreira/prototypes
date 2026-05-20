import { useMemo } from 'react'

import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicSupportAgentDecreaseInFRTQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import { dynamicSupportAgentTimeSavedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
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

export const SUPPORT_BAR_CHART_METRICS: BarChartMetricConfig[] = [
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicSupportAgentAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'aiIntentCustomField'],
    },
    {
        measure: 'medianDecreaseInFirstResponseTime',
        name: 'Decrease in first response time',
        metricFormat: 'duration' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicSupportAgentDecreaseInFRTQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'aiIntentCustomField'],
    },
    {
        measure: 'medianTimeSavedByAgent',
        name: 'Time saved by agents',
        metricFormat: 'duration' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicSupportAgentTimeSavedQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId'],
    },
    {
        measure: 'costSaved',
        name: 'Cost saved',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicSupportAgentAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'aiIntentCustomField'],
        valueTransform: (v, extra) =>
            v !== null && extra?.costSavedPerInteraction != null
                ? v * extra.costSavedPerInteraction
                : null,
    },
]

export const AnalyticsAiAgentSupportConfigurableBar = ({
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
                SUPPORT_BAR_CHART_METRICS,
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
