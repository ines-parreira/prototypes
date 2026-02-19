import type { AnalyticsAiAgentAllAgentsChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import type { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import type { AnalyticsAiAgentSupportAgentChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import type { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'

export type AnalyticsChartType =
    | AnalyticsOverviewChart
    | AnalyticsAiAgentAllAgentsChart
    | AnalyticsAiAgentSupportAgentChart
    | AnalyticsAiAgentShoppingAssistantChart

export type SectionType = 'kpis' | 'charts' | 'table'

export type GridSize = 3 | 6 | 12

export type LayoutItem<TChart extends AnalyticsChartType = AnalyticsChartType> =
    {
        chartId: TChart
        gridSize: GridSize
        visibility: boolean
    }

export type LayoutSection<
    TChart extends AnalyticsChartType = AnalyticsChartType,
> = {
    id: string
    type: SectionType
    items: LayoutItem<TChart>[]
}

export type DashboardLayoutConfig<
    TChart extends AnalyticsChartType = AnalyticsChartType,
> = {
    sections: LayoutSection<TChart>[]
}
