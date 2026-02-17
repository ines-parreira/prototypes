import type { AnalyticsAiAgentAllAgentsChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import type { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import type { AnalyticsAiAgentSupportAgentChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import type { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'

export type SectionType = 'kpis' | 'charts' | 'table'

export type GridSize = 3 | 6 | 12

export type AnalyticsAIAgentCharts =
    | AnalyticsOverviewChart
    | AnalyticsAiAgentAllAgentsChart
    | AnalyticsAiAgentSupportAgentChart
    | AnalyticsAiAgentShoppingAssistantChart

export type LayoutItem = {
    chartId: AnalyticsAIAgentCharts
    gridSize: GridSize
    visibility: boolean
}

export type LayoutSection = {
    id: string
    type: SectionType
    items: LayoutItem[]
}

export type DashboardLayoutConfig = {
    sections: LayoutSection[]
}
