import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import {
    AnalyticsAiAgentAllAgentsChart,
    AnalyticsAiAgentAllAgentsReportConfig,
} from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { STATS_ROUTES } from 'routes/constants'

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
        expect(config.label).toBe('Overall automation rate')
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

    it('should have channel performance table config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Channel')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).toBeNull()
    })

    it('should have intent performance table config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Intent')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).toBeNull()
    })

    it('should have correct report filters', () => {
        expect(
            AnalyticsAiAgentAllAgentsReportConfig.reportFilters.optional,
        ).toEqual([])
        expect(
            AnalyticsAiAgentAllAgentsReportConfig.reportFilters.persistent,
        ).toEqual([FilterKey.Period, FilterKey.AggregationWindow])
    })

    it('should have cost saved card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.CostSavedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Cost saved')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.metricFormat).toBe('currency-precision-1')
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
        expect(typeof config.csvProducer?.[0].fetch).toBe('function')
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

    it('should have handover interactions card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.HandoverInteractionsCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Handover interactions')
        expect(config.chartType).toBe(ChartType.Card)
        expect(config.metricFormat).toBe('decimal')
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
    })

    it('should have decrease in resolution time card config', () => {
        const config =
            AnalyticsAiAgentAllAgentsReportConfig.charts[
                AnalyticsAiAgentAllAgentsChart.DecreaseInResolutionTimeCard
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
        const charts = AnalyticsAiAgentAllAgentsReportConfig.charts
        const enumKeys = Object.values(AnalyticsAiAgentAllAgentsChart)

        expect(Object.keys(charts)).toHaveLength(enumKeys.length)

        for (const key of enumKeys) {
            expect(charts[key]).toBeDefined()
        }
    })

    it('should have fetch function for all charts with csvProducer', () => {
        Object.values(AnalyticsAiAgentAllAgentsChart).forEach((chartId) => {
            const config = AnalyticsAiAgentAllAgentsReportConfig.charts[chartId]
            config.csvProducer?.forEach((producer) => {
                expect(typeof producer.fetch).toBe('function')
            })
        })
    })
})
