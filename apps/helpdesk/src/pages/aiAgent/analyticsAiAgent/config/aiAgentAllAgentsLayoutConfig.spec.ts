import { AnalyticsAiAgentAllAgentsChart } from '../AnalyticsAiAgentAllAgentsReportConfig'
import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from './aiAgentAllAgentsLayoutConfig'

describe('aiAgentAllAgentsLayoutConfig', () => {
    describe('ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT', () => {
        it('should have 3 sections', () => {
            expect(ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections).toHaveLength(
                3,
            )
        })

        it('should have kpis section with 5 cards', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            expect(kpisSection.id).toBe('kpis')
            expect(kpisSection.type).toBe('kpis')
            expect(kpisSection.items).toHaveLength(5)
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
                AnalyticsAiAgentAllAgentsChart.AverageCsatCard,
            )
        })

        it('should have AverageCsatCard with requiresFeatureFlag', () => {
            const kpisSection = ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections[0]
            const csatCard = kpisSection.items[4]
            expect(csatCard.requiresFeatureFlag).toBe(true)
        })

        it('should have all non-CSAT KPI cards without requiresFeatureFlag', () => {
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

        it('should have total of 8 charts across all sections', () => {
            const totalCharts =
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT.sections.reduce(
                    (sum, section) => sum + section.items.length,
                    0,
                )
            expect(totalCharts).toBe(8)
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
