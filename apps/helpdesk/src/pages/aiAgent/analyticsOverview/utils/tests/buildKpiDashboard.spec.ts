import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentShoppingAssistantLayoutConfig'
import { buildKpiDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildKpiDashboard'

describe('buildKpiDashboard', () => {
    it('should return a dashboard with the provided name', () => {
        const result = buildKpiDashboard(
            'ai-agent-shopping-assistant',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        expect(result.name).toBe('ai-agent-shopping-assistant')
    })

    it('should return a dashboard with fixed metadata', () => {
        const result = buildKpiDashboard(
            'ai-agent-shopping-assistant',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        expect(result.id).toBe(-1)
        expect(result.analytics_filter_id).toBeNull()
        expect(result.emoji).toBeNull()
    })

    it('should only include kpis sections', () => {
        const result = buildKpiDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            true,
        )
        expect(result.children).toHaveLength(1)
    })

    it('should include only non-feature-flagged items when flag is disabled', () => {
        const result = buildKpiDashboard(
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
            AnalyticsAiAgentShoppingAssistantChart.ResolvedInteractionsCard,
        )
        expect(chartIds).toContain(
            AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard,
        )
        expect(chartIds).toHaveLength(4)
    })

    it('should include feature-flagged items when flag is enabled', () => {
        const result = buildKpiDashboard(
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
        const result = buildKpiDashboard(
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
        const result = buildKpiDashboard(
            'test',
            ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
            false,
        )
        expect((result.children[0] as { type: string }).type).toBe(
            DashboardChildType.Section,
        )
    })

    it('should map items to DashboardChildType.Chart with config_id', () => {
        const result = buildKpiDashboard(
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
        })
    })
})
