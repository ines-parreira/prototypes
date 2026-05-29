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
        )
        expect(result.name).toBe('ai-agent-shopping-assistant')
    })

    it('should return a dashboard with fixed metadata', () => {
        const result = buildCustomDashboard(
            'ai-agent-shopping-assistant',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
        )
        expect(result.id).toBe(-1)
        expect(result.analytics_filter_id).toBeNull()
        expect(result.emoji).toBeNull()
    })

    it('should include card, graph and table sections', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
        )
        expect(result.children).toHaveLength(3)
    })

    it('should map sections to DashboardChildType.Section', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
        )
        expect((result.children[0] as { type: string }).type).toBe(
            DashboardChildType.Section,
        )
    })

    it('should map items to DashboardChildType.Chart with config_id', () => {
        const result = buildCustomDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
        )
        const section = result.children[0] as {
            children: { type: string; config_id: string }[]
        }
        expect(section.children[0]).toEqual({
            type: DashboardChildType.Chart,
            config_id:
                AnalyticsAiAgentShoppingAssistantChart.ConversionRateCard,
            metadata: {
                savedMeasure: undefined,
                savedDimension: undefined,
            },
        })
    })

    describe('table items', () => {
        it('should always include all table items', () => {
            const result = buildCustomDashboard(
                'test',
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
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
    })

    describe('graph sections', () => {
        it('should include graph sections', () => {
            const result = buildCustomDashboard('test', LAYOUT_WITH_GRAPHS)
            expect(result.children).toHaveLength(1)
        })

        it('should include only visible graph items', () => {
            const result = buildCustomDashboard('test', LAYOUT_WITH_GRAPHS)
            const section = result.children[0] as {
                children: { config_id: string }[]
            }
            expect(section.children).toHaveLength(1)
            expect(section.children[0].config_id).toBe(
                AnalyticsAiAgentShoppingAssistantChart.ConfigurableBarGraph,
            )
        })

        it('should set savedMeasure and savedDimension from item measures and dimensions', () => {
            const result = buildCustomDashboard('test', LAYOUT_WITH_GRAPHS)
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
