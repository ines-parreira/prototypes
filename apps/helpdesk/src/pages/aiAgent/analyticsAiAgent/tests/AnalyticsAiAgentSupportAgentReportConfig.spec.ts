import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import {
    AnalyticsAiAgentSupportAgentChart,
    AnalyticsAiAgentSupportAgentReportConfig,
} from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import { STATS_ROUTES } from 'routes/constants'

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

    it('should have support agent trend line chart config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart
            ]

        expect(config).toBeDefined()
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have channel performance table config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.ChannelPerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Channel')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).toBeNull()
    })

    it('should have intent performance table config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.IntentPerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Intent')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).toBeNull()
    })

    it('should have correct report filters', () => {
        expect(
            AnalyticsAiAgentSupportAgentReportConfig.reportFilters.optional,
        ).toEqual([])
        expect(
            AnalyticsAiAgentSupportAgentReportConfig.reportFilters.persistent,
        ).toEqual([FilterKey.Period, FilterKey.AggregationWindow])
    })

    it('should have decrease in resolution time card config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.DecreaseInResolutionTimeCard
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

    it('should have all chart configs defined', () => {
        const charts = AnalyticsAiAgentSupportAgentReportConfig.charts
        const enumKeys = Object.values(AnalyticsAiAgentSupportAgentChart)

        expect(Object.keys(charts)).toHaveLength(enumKeys.length)

        for (const key of enumKeys) {
            expect(charts[key]).toBeDefined()
        }
    })

    it('should have fetch function for all charts with csvProducer', () => {
        Object.values(AnalyticsAiAgentSupportAgentChart).forEach((chartId) => {
            const config =
                AnalyticsAiAgentSupportAgentReportConfig.charts[chartId]
            config.csvProducer?.forEach((producer) => {
                expect(typeof producer.fetch).toBe('function')
            })
        })
    })

    it('should have handover interactions card config', () => {
        const config =
            AnalyticsAiAgentSupportAgentReportConfig.charts[
                AnalyticsAiAgentSupportAgentChart.HandoverInteractionsCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Handover interactions')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
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
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Table)
    })
})
