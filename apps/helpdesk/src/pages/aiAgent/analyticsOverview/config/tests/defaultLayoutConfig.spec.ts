import { ChartType } from 'domains/reporting/pages/dashboards/types'

import { AnalyticsOverviewChart } from '../../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../defaultLayoutConfig'

describe('defaultLayoutConfig', () => {
    describe('DEFAULT_ANALYTICS_OVERVIEW_LAYOUT', () => {
        it('should have 3 sections', () => {
            expect(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections).toHaveLength(3)
        })

        it('should have kpis section with 7 cards', () => {
            const kpisSection = DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[0]
            expect(kpisSection.id).toBe('kpis')
            expect(kpisSection.type).toBe(ChartType.Card)
            expect(kpisSection.items).toHaveLength(7)
        })

        it('should have correct KPI cards in kpis section', () => {
            const kpisSection = DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[0]
            expect(kpisSection.items[0].chartId).toBe(
                AnalyticsOverviewChart.AutomationRateCard,
            )
            expect(kpisSection.items[1].chartId).toBe(
                AnalyticsOverviewChart.AutomatedInteractionsCard,
            )
            expect(kpisSection.items[2].chartId).toBe(
                AnalyticsOverviewChart.TimeSavedCard,
            )
            expect(kpisSection.items[3].chartId).toBe(
                AnalyticsOverviewChart.CostSavedCard,
            )
            expect(kpisSection.items[4].chartId).toBe(
                AnalyticsOverviewChart.HandoverInteractionsCard,
            )
            expect(kpisSection.items[5].chartId).toBe(
                AnalyticsOverviewChart.DecreaseInResolutionTimeCard,
            )
            expect(kpisSection.items[6].chartId).toBe(
                AnalyticsOverviewChart.DecreaseInFRTCard,
            )
        })

        it('should have HandoverInteractionsCard with requiresFeatureFlag', () => {
            const kpisSection = DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[0]
            const item = kpisSection.items.find(
                (i) =>
                    i.chartId ===
                    AnalyticsOverviewChart.HandoverInteractionsCard,
            )
            expect(item?.requiresFeatureFlag).toBe(true)
        })

        it('should have DecreaseInResolutionTimeCard with requiresFeatureFlag', () => {
            const kpisSection = DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[0]
            const item = kpisSection.items.find(
                (i) =>
                    i.chartId ===
                    AnalyticsOverviewChart.DecreaseInResolutionTimeCard,
            )
            expect(item?.requiresFeatureFlag).toBe(true)
        })

        it('should have DecreaseInFRTCard with requiresFeatureFlag', () => {
            const kpisSection = DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[0]
            const item = kpisSection.items.find(
                (i) => i.chartId === AnalyticsOverviewChart.DecreaseInFRTCard,
            )
            expect(item?.requiresFeatureFlag).toBe(true)
        })

        it('should have all KPI cards with gridSize 3', () => {
            const kpisSection = DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[0]
            kpisSection.items.forEach((item) => {
                expect(item.gridSize).toBe(3)
            })
        })

        it('should have visualizations section with 2 charts', () => {
            const visualizationsSection =
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[1]
            expect(visualizationsSection.id).toBe('visualizations')
            expect(visualizationsSection.type).toBe(ChartType.Graph)
            expect(visualizationsSection.items).toHaveLength(2)
        })

        it('should have AutomationRateComboChart in visualizations section', () => {
            const visualizationsSection =
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[1]
            expect(visualizationsSection.items[0].chartId).toBe(
                AnalyticsOverviewChart.AutomationRateComboChart,
            )
            expect(visualizationsSection.items[0].gridSize).toBe(6)
        })

        it('should have AutomationLineChart in visualizations section', () => {
            const visualizationsSection =
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[1]
            expect(visualizationsSection.items[1].chartId).toBe(
                AnalyticsOverviewChart.AutomationLineChart,
            )
            expect(visualizationsSection.items[1].gridSize).toBe(6)
        })

        it('should have breakdown section with performance table', () => {
            const breakdownSection =
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections[2]
            expect(breakdownSection.id).toBe('breakdown')
            expect(breakdownSection.type).toBe(ChartType.Table)
            expect(breakdownSection.items).toHaveLength(2)
            expect(breakdownSection.items[0].chartId).toBe(
                AnalyticsOverviewChart.PerformanceTable,
            )
            expect(breakdownSection.items[0].gridSize).toBe(12)
            expect(breakdownSection.items[1].chartId).toBe(
                AnalyticsOverviewChart.OrderManagementTable,
            )
            expect(breakdownSection.items[1].gridSize).toBe(12)
        })

        it('should have total of 10 charts across all sections', () => {
            const totalCharts =
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections.reduce(
                    (sum, section) => sum + section.items.length,
                    0,
                )
            expect(totalCharts).toBe(11)
        })

        it('should only contain valid chart types', () => {
            const allChartIds =
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections.flatMap((section) =>
                    section.items.map((item) => item.chartId),
                )

            allChartIds.forEach((chartId) => {
                expect(Object.values(AnalyticsOverviewChart)).toContain(chartId)
            })
        })
    })
})
