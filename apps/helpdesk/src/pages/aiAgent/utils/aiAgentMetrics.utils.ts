import type {
    ConfigurableGraphGroupingConfig,
    ConfigurableGraphMetricConfig,
    MetricTrendFormat,
    TrendDirection,
} from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment/moment'

import { useStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type {
    BuiltQuery,
    Context,
    MetricQueryFactory,
} from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

type AutomationDimension = 'channel' | 'automationFeatureType'

export type BarChartMetricConfig = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    interpretAs: TrendDirection
    dimensions: AutomationDimension[]
    queryFactory(ctx: Context): BuiltQuery
}

const MAP_AUTOMATION_FEATURE_NAME: Record<string, string> = {
    [AutomationFeatureType.AiAgent]: 'AI Agent',
    [AutomationFeatureType.Flows]: 'Flows',
    [AutomationFeatureType.OrderManagement]: 'Order Management',
    [AutomationFeatureType.ArticleRecommendation]: 'Article Recommendation',
}

const formatChannelName = (channel: string): string => {
    const channelNames: Record<string, string> = {
        email: 'Email',
        chat: 'Chat',
        sms: 'SMS',
        'contact-form': 'Contact Form',
        contact_form: 'Contact Form',
        'help-center': 'Help Center',
        voice: 'Voice',
    }
    return channelNames[channel] || channel
}

export const useAutomationMetricPerAutomationFeatureType = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
) => {
    const data = useStatsMetricPerDimension(
        query({ filters, timezone, dimensions: ['automationFeatureType'] }),
        'automationFeatureType',
    )

    return {
        data:
            data.data?.allValues
                ?.filter((metricValue) =>
                    Object.keys(MAP_AUTOMATION_FEATURE_NAME).includes(
                        metricValue.dimension.toString(),
                    ),
                )
                .map((metricValue) => ({
                    name: MAP_AUTOMATION_FEATURE_NAME[
                        metricValue.dimension.toString()
                    ],
                    value: metricValue.value,
                })) ?? [],
        isLoading: data.isFetching,
    }
}

export const useAutomationMetricPerChannel = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
) => {
    const data = useStatsMetricPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['channel'],
        }),
        'channel',
    )

    return {
        data:
            data.data?.allValues?.map((metricValue) => ({
                name: formatChannelName(metricValue.dimension.toString()),
                value: metricValue.value,
            })) ?? [],
        isLoading: data.isFetching,
    }
}

export const getBarChartDataHooks = (
    query: MetricQueryFactory,
    dimensions: AutomationDimension[],
    filters: StatsFilters,
    timezone: string,
    period?: { start_datetime: string; end_datetime: string },
) => {
    const dimensionConfigs: ConfigurableGraphGroupingConfig[] = dimensions.map(
        (dimensionId) => {
            switch (dimensionId) {
                case 'channel':
                    return {
                        id: dimensionId,
                        name: 'Channel',
                        chartType: ConfigurableGraphType.Bar,
                        useChartData: () =>
                            useAutomationMetricPerChannel(
                                query,
                                filters,
                                timezone,
                            ),
                        period,
                    }
                case 'automationFeatureType':
                    return {
                        id: dimensionId,
                        name: 'Feature',
                        chartType: ConfigurableGraphType.Bar,
                        useChartData: () =>
                            useAutomationMetricPerAutomationFeatureType(
                                query,
                                filters,
                                timezone,
                            ),
                        period,
                    }
            }
        },
    )

    return {
        useTrendData: () => getStatsTrendHook(query)(filters, timezone),
        dimensions: dimensionConfigs,
    }
}

export const getBarChartGraphConfig = (
    metrics: BarChartMetricConfig[],
    statsFilters: StatsFilters,
    userTimezone: string,
): ConfigurableGraphMetricConfig[] => {
    const tooltipPeriod = formatPreviousPeriod(statsFilters.period)

    const period = {
        start_datetime: moment(statsFilters.period.start_datetime).format(
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US] as string,
        ),
        end_datetime: moment(statsFilters.period.end_datetime).format(
            DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US] as string,
        ),
    }

    return metrics.map((metric) => ({
        measure: metric.measure,
        name: metric.name,
        metricFormat: metric.metricFormat,
        interpretAs: metric.interpretAs,
        tooltipData: { period: tooltipPeriod },
        ...getBarChartDataHooks(
            metric.queryFactory,
            metric.dimensions,
            statsFilters,
            userTimezone,
            period,
        ),
    }))
}
