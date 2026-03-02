import { AnalyticsAiAgentShoppingAssistantChart } from '../AnalyticsAiAgentShoppingAssistantReportConfig'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from './aiAgentShoppingAssistantLayoutConfig'

describe('aiAgentShoppingAssistantLayoutConfig', () => {
    describe('ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT', () => {
        it('should have 3 sections', () => {
            expect(
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections,
            ).toHaveLength(3)
        })

        it('should have kpis section with 14 cards', () => {
            const kpisSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[0]
            expect(kpisSection.id).toBe('kpis')
            expect(kpisSection.type).toBe('kpis')
            expect(kpisSection.items).toHaveLength(14)
        })

        it('should have correct KPI cards in kpis section', () => {
            const kpisSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[0]
            const expectedChartIds = [
                AnalyticsAiAgentShoppingAssistantChart.TotalSalesCard,
                AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard,
                AnalyticsAiAgentShoppingAssistantChart.ResolvedInteractionsCard,
                AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard,
                AnalyticsAiAgentShoppingAssistantChart.AverageDiscountAmountCard,
                AnalyticsAiAgentShoppingAssistantChart.AverageOrderValueCard,
                AnalyticsAiAgentShoppingAssistantChart.DiscountUsageCard,
                AnalyticsAiAgentShoppingAssistantChart.DiscountCodesAppliedCard,
                AnalyticsAiAgentShoppingAssistantChart.DiscountsOfferedCard,
                AnalyticsAiAgentShoppingAssistantChart.MedianPurchaseTimeCard,
                AnalyticsAiAgentShoppingAssistantChart.ConversionRateCard,
                AnalyticsAiAgentShoppingAssistantChart.BuyThroughRateCard,
                AnalyticsAiAgentShoppingAssistantChart.ClickThroughRateCard,
                AnalyticsAiAgentShoppingAssistantChart.SuccessRateCard,
            ]
            expect(kpisSection.items.map((item) => item.chartId)).toEqual(
                expectedChartIds,
            )
        })

        it('should have discount cards with requiresFeatureFlag', () => {
            const kpisSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[0]
            const discountCards = kpisSection.items.slice(4)
            discountCards.forEach((item) => {
                expect(item.requiresFeatureFlag).toBe(true)
            })
        })

        it('should have all KPI cards with gridSize 3', () => {
            const kpisSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[0]
            kpisSection.items.forEach((item) => {
                expect(item.gridSize).toBe(3)
            })
        })

        it('should have visualizations section with 2 charts', () => {
            const visualizationsSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[1]
            expect(visualizationsSection.id).toBe('visualizations')
            expect(visualizationsSection.type).toBe('charts')
            expect(visualizationsSection.items).toHaveLength(2)
        })

        it('should have ShoppingAssistantTrendComboChart in visualizations section', () => {
            const visualizationsSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[1]
            expect(visualizationsSection.items[0].chartId).toBe(
                AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendComboChart,
            )
            expect(visualizationsSection.items[0].gridSize).toBe(6)
        })

        it('should have ShoppingAssistantTrendLineChart in visualizations section', () => {
            const visualizationsSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[1]
            expect(visualizationsSection.items[1].chartId).toBe(
                AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendLineChart,
            )
            expect(visualizationsSection.items[1].gridSize).toBe(6)
        })

        it('should have breakdown section with performance table', () => {
            const breakdownSection =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections[2]
            expect(breakdownSection.id).toBe('breakdown')
            expect(breakdownSection.type).toBe('table')
            expect(breakdownSection.items).toHaveLength(1)
            expect(breakdownSection.items[0].chartId).toBe(
                AnalyticsAiAgentShoppingAssistantChart.PerformanceTable,
            )
            expect(breakdownSection.items[0].gridSize).toBe(12)
        })

        it('should have all required chart types defined', () => {
            const allChartIds =
                ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections.flatMap(
                    (section) => section.items.map((item) => item.chartId),
                )

            Object.values(AnalyticsAiAgentShoppingAssistantChart).forEach(
                (chartId) => {
                    expect(allChartIds).toContain(chartId)
                },
            )
        })
    })
})
