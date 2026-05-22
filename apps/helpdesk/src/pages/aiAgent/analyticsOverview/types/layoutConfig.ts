import type {
    DashboardLayoutConfig as PackageDashboardLayoutConfig,
    LayoutItem as PackageLayoutItem,
    LayoutSection as PackageLayoutSection,
} from '@repo/reporting'

import type { AnalyticsAiAgentAllAgentsChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import type { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import type { AnalyticsAiAgentSupportAgentChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import type { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'

export type { GridSize } from '@repo/reporting'

export type AnalyticsChartType =
    | AnalyticsOverviewChart
    | AnalyticsAiAgentAllAgentsChart
    | AnalyticsAiAgentSupportAgentChart
    | AnalyticsAiAgentShoppingAssistantChart

export type LayoutItem<TChart extends AnalyticsChartType = AnalyticsChartType> =
    PackageLayoutItem<TChart>

export type LayoutSection<
    TChart extends AnalyticsChartType = AnalyticsChartType,
> = PackageLayoutSection<TChart>

export type DashboardLayoutConfig<
    TChart extends AnalyticsChartType = AnalyticsChartType,
> = PackageDashboardLayoutConfig<TChart>

export enum ManagedDashboardId {
    AiAgentOverview = 'ai-agent-overview',
    AiAgentAnalytics = 'ai-agent-analytics',
}

export enum ManagedDashboardsTabId {
    Overview = 'overview',
    AllAgents = 'all-agents',
    SupportAgent = 'support-agent',
    ShoppingAssistant = 'shopping-assistant',
}
