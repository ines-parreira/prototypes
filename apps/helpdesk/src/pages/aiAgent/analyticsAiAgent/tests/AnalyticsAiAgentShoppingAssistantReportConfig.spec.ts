import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { fetchShoppingAssistantTopProductsAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'
import { STATS_ROUTES } from 'routes/constants'

import {
    AnalyticsAiAgentShoppingAssistantChart,
    AnalyticsAiAgentShoppingAssistantReportConfig,
} from '../AnalyticsAiAgentShoppingAssistantReportConfig'

describe('AnalyticsAiAgentShoppingAssistantReportConfig', () => {
    it('should have correct report ID', () => {
        expect(AnalyticsAiAgentShoppingAssistantReportConfig.id).toBe(
            ReportsIDs.AiAgentAnalyticsShoppingAssistant,
        )
    })

    it('should have correct report name', () => {
        expect(AnalyticsAiAgentShoppingAssistantReportConfig.reportName).toBe(
            'Shopping Assistant',
        )
    })

    it('should have correct report path', () => {
        expect(AnalyticsAiAgentShoppingAssistantReportConfig.reportPath).toBe(
            STATS_ROUTES.AI_AGENT,
        )
    })

    it('should have total sales card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.TotalSalesCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Revenue influenced')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
    })

    it('should have orders influenced card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Orders influenced')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have automated interactions card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.AutomatedInteractionsCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Automated interactions')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
    })

    it('should have revenue influenced per interaction card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Revenue influenced per interaction')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
    })

    it('should have average discount amount card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.AverageDiscountAmountCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Average discount amount')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.metricFormat).toBe('currency')
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have discount usage card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.DiscountUsageCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Discount usage')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.metricFormat).toBe('decimal-to-percent')
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have discount codes applied card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.DiscountCodesAppliedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Discount codes applied')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.metricFormat).toBe('decimal')
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
    })

    it('should have discounts offered card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.DiscountsOfferedCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Discount offered')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.metricFormat).toBe('decimal')
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have fetch function for discounts offered trend', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.DiscountsOfferedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have handover interactions card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.HandoverInteractionsCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Handover interactions')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.metricFormat).toBe('decimal')
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
    })

    it('should have shopping assistant configurable bar graph config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.ConfigurableBarGraph
            ]

        expect(config).toBeDefined()
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have shopping assistant configurable line graph config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.ConfigurableLineGraph
            ]

        expect(config).toBeDefined()
        expect(config.chartType).toBe(ChartType.Graph)
    })

    it('should have channel performance table config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.ChannelPerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Channel')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have engagement feature performance table config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart
                    .EngagementFeaturePerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Engagement feature')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).not.toBeNull()
    })

    it('should have top products performance table config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart
                    .TopProductsPerformanceTable
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Top products recommended')
        expect(config.chartType).toBe(ChartType.Table)
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(
            DataExportFormat.ConfigurableTable,
        )
        expect(config.csvProducer?.[0].fetch).toBe(
            fetchShoppingAssistantTopProductsAsConfigurableTable,
        )
    })

    it('should have correct report filters', () => {
        expect(
            AnalyticsAiAgentShoppingAssistantReportConfig.reportFilters
                .optional,
        ).toEqual([FilterKey.Stores, FilterKey.Channels])
        expect(
            AnalyticsAiAgentShoppingAssistantReportConfig.reportFilters
                .persistent,
        ).toEqual([FilterKey.Period, FilterKey.AggregationWindow])
    })

    it('should have all chart configs defined', () => {
        const charts = AnalyticsAiAgentShoppingAssistantReportConfig.charts
        const enumKeys = Object.values(AnalyticsAiAgentShoppingAssistantChart)

        expect(Object.keys(charts)).toHaveLength(enumKeys.length)

        for (const key of enumKeys) {
            expect(charts[key]).toBeDefined()
        }
    })

    it('should have fetch function for total sales trend', async () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.TotalSalesCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for orders influenced trend', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for automated interactions trend', async () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.AutomatedInteractionsCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for revenue influenced per interaction trend', async () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for average discount amount trend', async () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.AverageDiscountAmountCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for discount codes applied trend', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.DiscountCodesAppliedCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for discount usage trend', async () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.DiscountUsageCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for handover interactions trend', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.HandoverInteractionsCard
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for shopping assistant configurable bar graph', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.ConfigurableBarGraph
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have fetch function for shopping assistant configurable line graph', async () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.ConfigurableLineGraph
            ]

        expect(config.csvProducer).toBeDefined()
        expect(config.csvProducer).toHaveLength(1)

        const csvProducer = config.csvProducer?.[0]
        expect(csvProducer).toBeDefined()
        expect(csvProducer?.fetch).toBeDefined()
        expect(typeof csvProducer?.fetch).toBe('function')
    })

    it('should have buy through rate card config with decimal-to-percent format', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.BuyThroughRateCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Buy through rate')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.metricFormat).toBe('decimal-to-percent')
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0]).toMatchObject({
            type: DataExportFormat.Trend,
            metricFormat: 'decimal-to-percent',
        })
        expect(typeof config.csvProducer?.[0].fetch).toBe('function')
    })

    it('should have conversion rate card config', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.ConversionRateCard
            ]

        expect(config).toBeDefined()
        expect(config.label).toBe('Conversion rate')
        expect(config.chartType).toBe(ChartType.CardWithTimeseries)
        expect(config.metricFormat).toBe('decimal-to-percent')
        expect(config.csvProducer).not.toBeNull()
        expect(config.csvProducer).toHaveLength(1)
        expect(config.csvProducer?.[0].type).toBe(DataExportFormat.Trend)
        expect(typeof config.csvProducer?.[0].fetch).toBe('function')
    })

    it('should have configurable table csvProducer for channel performance table', () => {
        const config =
            AnalyticsAiAgentShoppingAssistantReportConfig.charts[
                AnalyticsAiAgentShoppingAssistantChart.ChannelPerformanceTable
            ]

        expect(config.csvProducer).not.toBeNull()
    })
})
