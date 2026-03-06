import { AnalyticsAiAgentAllAgentsChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentAllAgentsLayoutConfig'

describe('aiAgentAllAgentsLayoutConfig', () => {
    describe('ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT', () => {
        it('should have 3 sections', () => {
            expect(ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections).toHaveLength(
                3,
            )
        })

        it('should have kpis section with 12 cards', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            expect(kpisSection.id).toBe('kpis')
            expect(kpisSection.type).toBe('kpis')
            expect(kpisSection.items).toHaveLength(12)
        })

        it('should have correct KPI cards in kpis section', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            expect(kpisSection.items[0].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.AutomationRateCard,
            )
            expect(kpisSection.items[1].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard,
            )
            expect(kpisSection.items[2].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.TotalSalesCard,
            )
            expect(kpisSection.items[3].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.TimeSavedCard,
            )
            expect(kpisSection.items[4].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.ZeroTouchTicketsCard,
            )
            expect(kpisSection.items[5].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.AverageCsatCard,
            )
            expect(kpisSection.items[6].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.CoverageRateCard,
            )
            expect(kpisSection.items[7].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.ClosedTicketsCard,
            )
            expect(kpisSection.items[8].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.HandoverInteractionsCard,
            )
            expect(kpisSection.items[9].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.CostSavedCard,
            )
            expect(kpisSection.items[10].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.DecreaseInResolutionTimeCard,
            )
            expect(kpisSection.items[11].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.DecreaseInFRTCard,
            )
        })

        it('should have DecreaseInResolutionTimeCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const item = kpisSection.items.find(
                (i) =>
                    i.chartId ===
                    AnalyticsAiAgentAllAgentsChart.DecreaseInResolutionTimeCard,
            )
            expect(item?.requiresFeatureFlag).toBe(true)
        })

        it('should have ZeroTouchTicketsCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const zeroTouchItem = kpisSection.items.find(
                (item) =>
                    item.chartId ===
                    AnalyticsAiAgentAllAgentsChart.ZeroTouchTicketsCard,
            )
            expect(zeroTouchItem?.requiresFeatureFlag).toBe(true)
        })

        it('should have AverageCsatCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const csatCard = kpisSection.items[5]
            expect(csatCard.requiresFeatureFlag).toBe(true)
        })

        it('should have ClosedTicketsCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const closedTicketsCard = kpisSection.items.find(
                (item) =>
                    item.chartId ===
                    AnalyticsAiAgentAllAgentsChart.ClosedTicketsCard,
            )
            expect(closedTicketsCard?.requiresFeatureFlag).toBe(true)
        })

        it('should have HandoverInteractionsCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const handoverCard = kpisSection.items.find(
                (item) =>
                    item.chartId ===
                    AnalyticsAiAgentAllAgentsChart.HandoverInteractionsCard,
            )
            expect(handoverCard?.requiresFeatureFlag).toBe(true)
        })

        it('should have CostSavedCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const costSavedCard = kpisSection.items.find(
                (item) =>
                    item.chartId ===
                    AnalyticsAiAgentAllAgentsChart.CostSavedCard,
            )
            expect(costSavedCard?.requiresFeatureFlag).toBe(true)
        })

        it('should have DecreaseInFRTCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const frtCard = kpisSection.items.find(
                (item) =>
                    item.chartId ===
                    AnalyticsAiAgentAllAgentsChart.DecreaseInFRTCard,
            )
            expect(frtCard?.requiresFeatureFlag).toBe(true)
        })

        it('should have all non-feature-flag KPI cards without requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            kpisSection.items.slice(0, 4).forEach((item) => {
                expect(item.requiresFeatureFlag).toBeFalsy()
            })
        })

        it('should have all KPI cards with gridSize 3', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            kpisSection.items.forEach((item) => {
                expect(item.gridSize).toBe(3)
            })
        })

        it('should have visualizations section with 2 charts', () => {
            const visualizationsSection =
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[1]
            expect(visualizationsSection.id).toBe('visualizations')
            expect(visualizationsSection.type).toBe('charts')
            expect(visualizationsSection.items).toHaveLength(2)
        })

        it('should have AllAgentsTrendComboChart in visualizations section', () => {
            const visualizationsSection =
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[1]
            expect(visualizationsSection.items[0].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.AllAgentsTrendComboChart,
            )
            expect(visualizationsSection.items[0].gridSize).toBe(6)
        })

        it('should have AllAgentsTrendLineChart in visualizations section', () => {
            const visualizationsSection =
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[1]
            expect(visualizationsSection.items[1].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.AllAgentsTrendLineChart,
            )
            expect(visualizationsSection.items[1].gridSize).toBe(6)
        })

        it('should have breakdown section with performance table', () => {
            const breakdownSection =
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[2]
            expect(breakdownSection.id).toBe('breakdown')
            expect(breakdownSection.type).toBe('table')
            expect(breakdownSection.items).toHaveLength(1)
            expect(breakdownSection.items[0].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.PerformanceTable,
            )
            expect(breakdownSection.items[0].gridSize).toBe(12)
        })

        it('should have total of 15 charts across all sections', () => {
            const totalCharts =
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections.reduce(
                    (sum, section) => sum + section.items.length,
                    0,
                )
            expect(totalCharts).toBe(15)
        })

        it('should have all required chart types defined', () => {
            const allChartIds =
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections.flatMap(
                    (section) => section.items.map((item) => item.chartId),
                )

            Object.values(AnalyticsAiAgentAllAgentsChart).forEach((chartId) => {
                expect(allChartIds).toContain(chartId)
            })
        })
    })
})
