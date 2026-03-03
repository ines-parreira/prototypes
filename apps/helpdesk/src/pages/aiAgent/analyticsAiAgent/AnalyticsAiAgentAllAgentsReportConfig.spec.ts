import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

import {
    AnalyticsAiAgentAllAgentsChart,
    AnalyticsAiAgentAllAgentsReportConfig,
} from './AnalyticsAiAgentAllAgentsReportConfig'

describe('AnalyticsAiAgentAllAgentsReportConfig', () => {
    it('should have correct report ID', () => {
        expect(AnalyticsAiAgentAllAgentsReportConfig.id).toBe(
            ReportsIDs.AiAgentAnalyticsAllAgents,
        )
    })

    it('should have correct report name', () => {
        expect(AnalyticsAiAgentAllAgentsReportConfig.reportName).toBe(
            'AI Agent Analytics All Agents',
        )
    })

    it('should have correct report path', () => {
        expect(AnalyticsAiAgentAllAgentsReportConfig.reportPath).toBe(
            STATS_ROUTES.AI_AGENT,
        )
    })

    it('should have automation rate card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AutomationRateCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automation rate')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
    })

    it('should have automated interactions card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automated interactions')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have total sales card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.TotalSalesCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Total sales')
        expect(config.chartType).toBe(ChartType.Card)
    })

    it('should have time saved card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.TimeSavedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Time saved by agents')
        expect(config.chartType).toBe(ChartType.Card)
    })

    it('should have all agents trend combo chart config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AllAgentsTrendComboChart
            ]

        expect(config).toBeDefined()
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have all agents trend line chart config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AllAgentsTrendLineChart
            ]

        expect(config).toBeDefined()
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have performance table config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.PerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Performance breakdown')
        expect(config.chartType).toBe(ChartType.Table)
    })

    it('should have correct report filters', () => {
        expect(
            AnalyticsAiAgentAllAgentsReportConfig.reportFilters.optional,
        ).toEqual([])
        expect(
            AnalyticsAiAgentAllAgentsReportConfig.reportFilters.persistent,
        ).toEqual([FilterKey.Period, FilterKey.AggregationWindow])
    })

    it('should have average CSAT card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AverageCsatCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Average CSAT')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.metricFormat).toBe('decimal')
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have all chart configs defined', () => {
        const charts = AnalyticsAiAgentAllAgentsReportConfig.charts
        const enumKeys = Object.values(AnalyticsAiAgentAllAgentsChart)

        expect(Object.keys(charts)).toHaveLength(enumKeys.length)

        for (const key of enumKeys) {
            expect(charts[key]).toBeDefined()
        }
    })

    it('should have fetch function for automation rate trend', async () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AutomationRateCard
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
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for total sales trend', async () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.TotalSalesCard
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
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.TimeSavedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for all agents trend breakdown', async () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AllAgentsTrendComboChart
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

    it('should have fetch function for all agents trend data', async () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AllAgentsTrendLineChart
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

    it('should have fetch function for average CSAT trend', async () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.AverageCsatCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for performance breakdown', async () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.PerformanceTable
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
