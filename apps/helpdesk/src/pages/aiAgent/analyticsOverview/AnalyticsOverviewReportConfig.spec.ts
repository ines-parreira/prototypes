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
} from './AnalyticsOverviewReportConfig'

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
            'Percentage of interactions that were automated by AI Agent',
        )
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
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

    it('should have automation donut chart config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationDonutChart
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automation breakdown by feature')
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have automation line chart config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationLineChart
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automation trend over time')
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have performance table config', () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.PerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Performance breakdown')
        expect(config.chartType).toBe(ChartType.Graph)
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

        expect(Object.keys(charts)).toHaveLength(7)
        expect(charts[AnalyticsOverviewChart.AutomationRateCard]).toBeDefined()
        expect(
            charts[AnalyticsOverviewChart.AutomatedInteractionsCard],
        ).toBeDefined()
        expect(charts[AnalyticsOverviewChart.TimeSavedCard]).toBeDefined()
        expect(charts[AnalyticsOverviewChart.CostSavedCard]).toBeDefined()
        expect(
            charts[AnalyticsOverviewChart.AutomationDonutChart],
        ).toBeDefined()
        expect(charts[AnalyticsOverviewChart.AutomationLineChart]).toBeDefined()
        expect(charts[AnalyticsOverviewChart.PerformanceTable]).toBeDefined()
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

        if (csvProducer && typeof csvProducer.fetch === 'function') {
            const result = await (csvProducer.fetch as any)()
            expect(result).toBeDefined()
            expect(result).toHaveProperty('value')
            expect(result).toHaveProperty('trend')
        }
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

        if (csvProducer && typeof csvProducer.fetch === 'function') {
            const result = await (csvProducer.fetch as any)()
            expect(result).toBeDefined()
            expect(result).toHaveProperty('value')
            expect(result).toHaveProperty('trend')
        }
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

        if (csvProducer && typeof csvProducer.fetch === 'function') {
            const result = await (csvProducer.fetch as any)()
            expect(result).toBeDefined()
            expect(result).toHaveProperty('value')
            expect(result).toHaveProperty('trend')
        }
    })

    it('should have fetch function for automation breakdown', async () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationDonutChart
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()

        if (csvProducer && typeof csvProducer.fetch === 'function') {
            const result = await (csvProducer.fetch as any)()
            expect(result).toBeDefined()
            expect(result).toHaveProperty('isLoading')
            expect(result).toHaveProperty('fileName')
            expect(result).toHaveProperty('files')
        }
    })

    it('should have fetch function for automation trend data', async () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.AutomationLineChart
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()

        if (csvProducer && typeof csvProducer.fetch === 'function') {
            const result = await (csvProducer.fetch as any)()
            expect(result).toBeDefined()
            expect(result).toHaveProperty('isLoading')
            expect(result).toHaveProperty('fileName')
            expect(result).toHaveProperty('files')
        }
    })

    it('should have fetch function for performance breakdown', async () => {
        const config =
            AnalyticsOverviewReportConfig.charts[
                AnalyticsOverviewChart.PerformanceTable
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()

        if (csvProducer && typeof csvProducer.fetch === 'function') {
            const result = await (csvProducer.fetch as any)()
            expect(result).toBeDefined()
            expect(result).toHaveProperty('isLoading')
            expect(result).toHaveProperty('fileName')
            expect(result).toHaveProperty('files')
        }
    })
})
