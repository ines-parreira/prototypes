import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

import {
    AnalyticsOverviewChart,
    AnalyticsOverviewReportConfig,
} from '../AnalyticsOverviewReportConfig'

describe('AnalyticsOverviewReportConfig', () => {
    it('should have correct report ID', () => {
        expect(AnalyticsOverviewReportConfig.id).toBe(
            ReportsIDs.AiAgentAnalyticsOverview,
        )
    })

    it('should have correct report name', () => {
        expect(AnalyticsOverviewReportConfig.reportName).toBe(
            'AI Agent Analytics Overview',
        )
    })

    it('should have correct report path', () => {
        expect(AnalyticsOverviewReportConfig.reportPath).toBe(
            STATS_ROUTES.AI_AGENT_OVERVIEW,
        )
    })

    it('should have automation rate card config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationRateCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Overall automation rate')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.description).toBe(
            'The number of interactions automated by all automation features as a % of total customer interactions.',
        )
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)

        const csvProducer = config.csvProducer?.[0]
        if (csvProducer?.type === DataExportFormat.Trend) {
            expect(csvProducer.metricFormat).toBe('decimal-to-percent')
        }
    })

    it('should have automated interactions card config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomatedInteractionsCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automated interactions')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have time saved card config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.TimeSavedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Time saved by agents')
        expect(config.chartType).toBe(ChartType.Card)
    })

    it('should have cost saved card config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.CostSavedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Cost saved')
        expect(config.chartType).toBe(ChartType.Card)
    })

    it('should have decrease in resolution time card config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.DecreaseInResolutionTimeCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Decrease in resolution time')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.metricFormat).toBe('duration')
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
        expect(typeof config.csvProducer?.[0].fetch).toBe('function')
    })

    it('should have decrease in FRT card config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.DecreaseInFRTCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Decrease in first response time')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
    })

    it('should have automated interactions combo chart config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomatedInteractionsComboChart
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automated interactions')
        expect(config.chartType).toBe(ChartType.Graph)
        expect(config.csvProducer).toBeNull()
    })

    it('should have automation line chart config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationLineChart
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Overall automation rate')
        expect(config.chartType).toBe(ChartType.Graph)
        expect(config.csvProducer).toBeNull()
    })

    it('should have performance table config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.PerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Performance breakdown')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).toBeNull()
    })

    it('should have correct report filters', () => {
        expect(AnalyticsOverviewReportConfig.reportFilters.optional).toEqual([])
        expect(AnalyticsOverviewReportConfig.reportFilters.persistent).toEqual([
            FilterKey.Period,
            FilterKey.AggregationWindow,
        ])
    })

    it('should have all chart configs defined', () => {
        const charts = AnalyticsOverviewReportConfig.charts

        Object.values(AnalyticsOverviewChart).forEach((chart) => {
            expect(charts[chart]).toBeDefined()
        })
    })

    it('should have fetch function for all charts with csvProducer', () => {
        Object.values(AnalyticsOverviewChart).forEach((chartId) => {
            const config = AnalyticsOverviewReportConfig.charts[chartId]
            config.csvProducer?.forEach((producer) => {
                expect(typeof producer.fetch).toBe('function')
            })
        })
    })

    it('should have null csvProducer for graph and table charts', () => {
        Object.values(AnalyticsOverviewChart).forEach((chartId) => {
            const config = AnalyticsOverviewReportConfig.charts[chartId]
            if (
                config.chartType === ChartType.Graph ||
                config.chartType === ChartType.Table
            ) {
                expect(config.csvProducer).toBeNull()
            }
        })
    })
})
