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

    it('should have fetch function for automation rate trend', async () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationRateCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for automated interactions trend', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomatedInteractionsCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for time saved trend', async () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.TimeSavedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for cost saved trend', async () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.CostSavedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have null csvProducer for automation rate combo chart', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationRateComboChart
            ]

        expect(config.csvProducer).toBeNull()
    })

    it('should have null csvProducer for automated interactions combo chart', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomatedInteractionsComboChart
            ]

        expect(config.csvProducer).toBeNull()
    })

    it('should have null csvProducer for automation line chart', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationLineChart
            ]

        expect(config.csvProducer).toBeNull()
    })

    it('should have null csvProducer for performance table', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.PerformanceTable
            ]

        expect(config.csvProducer).toBeNull()
    })
})
