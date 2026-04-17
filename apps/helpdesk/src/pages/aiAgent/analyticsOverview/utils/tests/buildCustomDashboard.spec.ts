import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentShoppingAssistantLayoutConfig'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from 'pages/aiAgent/analyticsOverview/config/defaultLayoutConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'

const LAYOUT_WITH_GRAPHS: DashboardLayoutConfig = {
    sections: [
        {
            id: 'graphs',
            type: ChartType.Graph,
            items: [
                {
                    chartId:
                        AnalyticsAiAgentShoppingAssistantChart.ConfigurableBarGraph,
                    gridSize: 6,
                    visibility: true,
                    measures: ['automationRate'],
                    dimensions: ['channel'],
                },
                {
                    chartId:
                        AnalyticsAiAgentShoppingAssistantChart.ConfigurableLineGraph,
                    gridSize: 6,
                    visibility: false,
                },
            ],
        },
    ],
}

describe('buildCustomDashboard', () => {
    it('should return a dashboard with the provided name', () => {
        const result = buildCustomDashboard(
            'ai-agent-shopping-assistant',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        expect(result.name).toBe('ai-agent-shopping-assistant')
    })

    it('should return a dashboard with fixed metadata', () => {
        const result = buildCustomDashboard(
            'ai-agent-shopping-assistant',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        expect(result.id).toBe(-1)
        expect(result.analytics_filter_id).toBeNull()
        expect(result.emoji).toBeNull()
    })

    it('should include card and table sections but exclude graph sections', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            true,
            false,
            true,
        )
        expect(result.children).toHaveLength(2)
    })

    it('should include only non-feature-flagged items when flag is disabled', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        const section = result.children[0] as {
            children: { config_id: string }[]
        }
        const chartIds = section.children.map((c) => c.config_id)
        expect(chartIds).toContain(
            AnalyticsAiAgentShoppingAssistantChart.TotalSalesCard,
        )
        expect(chartIds).toContain(
            AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard,
        )
        expect(chartIds).toContain(
            AnalyticsAiAgentShoppingAssistantChart.AutomatedInteractionsCard,
        )
        expect(chartIds).toContain(
            AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard,
        )
        expect(chartIds).toHaveLength(4)
    })

    it('should include feature-flagged items when flag is enabled', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            true,
        )
        const section = result.children[0] as {
            children: { config_id: string }[]
        }
        expect(section.children.map((c) => c.config_id)).toContain(
            AnalyticsAiAgentShoppingAssistantChart.AverageDiscountAmountCard,
        )
    })

    it('should exclude feature-flagged items when flag is disabled', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        const section = result.children[0] as {
            children: { config_id: string }[]
        }
        expect(section.children.map((c) => c.config_id)).not.toContain(
            AnalyticsAiAgentShoppingAssistantChart.AverageDiscountAmountCard,
        )
    })

    it('should map sections to DashboardChildType.Section', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        expect((result.children[0] as { type: string }).type).toBe(
            DashboardChildType.Section,
        )
    })

    it('should map items to DashboardChildType.Chart with config_id', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        const section = result.children[0] as {
            children: { type: string; config_id: string }[]
        }
        expect(section.children[0]).toEqual({
            type: DashboardChildType.Chart,
            config_id: AnalyticsAiAgentShoppingAssistantChart.TotalSalesCard,
            metadata: {
                savedMeasure: undefined,
                savedDimension: undefined,
            },
        })
    })

    describe('table items with requiresFeatureFlag', () => {
        it('should include all eligible table items when isTablesFFEnabled is true, regardless of the trend cards flag', () => {
            const result = buildCustomDashboard(
                'test',
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
                false,
                false,
                true,
            )
            const tableSection = result.children.find((s) =>
                (s as any).children?.some(
                    (c: any) =>
                        c.config_id === AnalyticsOverviewChart.PerformanceTable,
                ),
            ) as { children: { config_id: string }[] } | undefined
            const chartIds =
                tableSection?.children.map((c) => c.config_id) ?? []
            expect(chartIds).toEqual([
                AnalyticsOverviewChart.PerformanceTable,
                AnalyticsOverviewChart.ArticleRecommendationTable,
                AnalyticsOverviewChart.FlowsTable,
                AnalyticsOverviewChart.OrderManagementTable,
            ])
        })

        it('should include all eligible table items when both feature flags are enabled', () => {
            const result = buildCustomDashboard(
                'test',
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
                true,
                false,
                true,
            )
            const tableSection = result.children.find((s) =>
                (s as any).children?.some(
                    (c: any) =>
                        c.config_id === AnalyticsOverviewChart.PerformanceTable,
                ),
            ) as { children: { config_id: string }[] } | undefined
            const chartIds =
                tableSection?.children.map((c) => c.config_id) ?? []
            expect(chartIds).toEqual([
                AnalyticsOverviewChart.PerformanceTable,
                AnalyticsOverviewChart.ArticleRecommendationTable,
                AnalyticsOverviewChart.FlowsTable,
                AnalyticsOverviewChart.OrderManagementTable,
            ])
        })

        it('should not include requiresFeatureFlag table items when isTablesFFEnabled is false even if isFeatureFlagEnabled is true', () => {
            const result = buildCustomDashboard(
                'test',
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
                true,
                false,
                false,
            )
            const tableSection = result.children.find((s) =>
                (s as any).children?.some(
                    (c: any) =>
                        c.config_id === AnalyticsOverviewChart.PerformanceTable,
                ),
            )
            expect(tableSection).toBeUndefined()
        })
    })

    describe('graph sections', () => {
        it('should exclude graph sections when isChartsEnabled is false', () => {
            const result = buildCustomDashboard(
                'test',
                LAYOUT_WITH_GRAPHS,
                false,
                false,
            )
            expect(result.children).toHaveLength(0)
        })

        it('should include graph sections when isChartsEnabled is true', () => {
            const result = buildCustomDashboard(
                'test',
                LAYOUT_WITH_GRAPHS,
                false,
                true,
            )
            expect(result.children).toHaveLength(1)
        })

        it('should include only visible graph items', () => {
            const result = buildCustomDashboard(
                'test',
                LAYOUT_WITH_GRAPHS,
                false,
                true,
            )
            const section = result.children[0] as {
                children: { config_id: string }[]
            }
            expect(section.children).toHaveLength(1)
            expect(section.children[0].config_id).toBe(
                AnalyticsAiAgentShoppingAssistantChart.ConfigurableBarGraph,
            )
        })

        it('should set savedMeasure and savedDimension from item measures and dimensions', () => {
            const result = buildCustomDashboard(
                'test',
                LAYOUT_WITH_GRAPHS,
                false,
                true,
            )
            const section = result.children[0] as {
                children: {
                    metadata: { savedMeasure: string; savedDimension: string }
                }[]
            }
            expect(section.children[0].metadata).toEqual({
                savedMeasure: 'automationRate',
                savedDimension: 'channel',
            })
        })
    })
})
