import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

import {
    AnalyticsAiAgentSupportAgentChart,
    AnalyticsAiAgentSupportAgentReportConfig,
} from '../AnalyticsAiAgentSupportAgentReportConfig'

describe('AnalyticsAiAgentSupportAgentReportConfig', () => {
    it('should have correct report ID', () => {
        expect(AnalyticsAiAgentSupportAgentReportConfig.id).toBe(
            ReportsIDs.AiAgentAnalyticsSupportAgent,
        )
    })

    it('should have correct report name', () => {
        expect(AnalyticsAiAgentSupportAgentReportConfig.reportName).toBe(
            'AI Agent Analytics Support Agent',
        )
    })

    it('should have correct report path', () => {
        expect(AnalyticsAiAgentSupportAgentReportConfig.reportPath).toBe(
            STATS_ROUTES.AI_AGENT,
        )
    })

    it('should have time saved card config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.TimeSavedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Time saved by agents')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
    })

    it('should have cost saved card config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.CostSavedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Cost saved')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have support interactions card config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Support tickets')
        expect(config.chartType).toBe(ChartType.Card)
    })

    it('should have decrease in FRT card config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.DecreaseInFRTCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Decrease in first response time')
        expect(config.chartType).toBe(ChartType.Card)
    })

    it('should have average CSAT card config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.AverageCsatCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Average CSAT')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.metricFormat).toBe('decimal')
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have support agent trend combo chart config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportAgentTrendComboChart
            ]

        expect(config).toBeDefined()
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have support agent trend line chart config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart
            ]

        expect(config).toBeDefined()
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have performance table config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.PerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Performance breakdown')
        expect(config.chartType).toBe(ChartType.Table)
    })

    it('should have correct report filters', () => {
        expect(
            AnalyticsAiAgentSupportAgentReportConfig.reportFilters.optional,
        ).toEqual([])
        expect(
            AnalyticsAiAgentSupportAgentReportConfig.reportFilters.persistent,
        ).toEqual([FilterKey.Period, FilterKey.AggregationWindow])
    })

    it('should have all chart configs defined', () => {
        const charts = AnalyticsAiAgentSupportAgentReportConfig.charts

        expect(Object.keys(charts)).toHaveLength(9)
        expect(
            charts[AnalyticsAiAgentSupportAgentChart.TimeSavedCard],
        ).toBeDefined()
        expect(
            charts[AnalyticsAiAgentSupportAgentChart.CostSavedCard],
        ).toBeDefined()
        expect(
            charts[AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard],
        ).toBeDefined()
        expect(
            charts[AnalyticsAiAgentSupportAgentChart.DecreaseInFRTCard],
        ).toBeDefined()
        expect(
            charts[
                AnalyticsAiAgentSupportAgentChart.SupportAgentTrendComboChart
            ],
        ).toBeDefined()
        expect(
            charts[
                AnalyticsAiAgentSupportAgentChart.SupportInteractionsComboChart
            ],
        ).toBeDefined()
        expect(
            charts[
                AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart
            ],
        ).toBeDefined()
        expect(
            charts[AnalyticsAiAgentSupportAgentChart.PerformanceTable],
        ).toBeDefined()
        expect(
            charts[AnalyticsAiAgentSupportAgentChart.AverageCsatCard],
        ).toBeDefined()
    })

    it('should have fetch function for time saved trend', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.TimeSavedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for cost saved trend', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.CostSavedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for support interactions trend', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for decrease in FRT trend', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.DecreaseInFRTCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for average CSAT trend', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.AverageCsatCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for support agent trend breakdown', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportAgentTrendComboChart
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

    it('should have fetch function for support agent trend data', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.type).toBe('time-series')
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for performance breakdown', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.PerformanceTable
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

    it('should have support interactions combo chart config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportInteractionsComboChart
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automated interactions')
        expect(config.description).toBe('Support interactions by intent')
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have fetch function for support interactions combo chart', async () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportInteractionsComboChart
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.type).toBe(DataExportFormat.Table)

        if (csvProducer && typeof csvProducer.fetch === 'function') {
            const result = await (csvProducer.fetch as any)()
            expect(result).toBeDefined()
            expect(result).toHaveProperty('isLoading')
            expect(result).toHaveProperty('fileName')
            expect(result).toHaveProperty('files')
            expect(result.fileName).toBe('support-interactions.csv')
        }
    })
})
