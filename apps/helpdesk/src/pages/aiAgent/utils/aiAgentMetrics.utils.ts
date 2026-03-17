import type {
    ConfigurableGraphGroupingConfig,
    ConfigurableGraphMetricConfig,
    MetricTrendFormat,
    MultipleTimeSeriesDataItem,
    TrendDirection,
} from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment/moment'

import { useStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    useStatsTimeSeries,
    useStatsTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type {
    BuiltQuery,
    Context,
    MetricQueryFactory,
} from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { DATE_FORMAT } from 'pages/aiAgent/analyticsOverview/constants'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

type AutomationDimension = 'channel' | 'automationFeatureType'
type LineAutomationDimension = 'overall' | AutomationDimension

export type BarChartMetricConfig = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    interpretAs: TrendDirection
    dimensions: AutomationDimension[]
    queryFactory(ctx: Context): BuiltQuery
}

export type LineChartMetricConfig = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    interpretAs: TrendDirection
    dimensions: LineAutomationDimension[]
    trendQueryFactory(ctx: Context): BuiltQuery
    timeSeriesQueryFactory(ctx: Context): BuiltQuery
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

const formatDate = (date: string) =>
    moment(date).format(DATE_FORMAT).replace(', ', ' ')

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
                        configurableGraphType: ConfigurableGraphType.Bar,
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
                        configurableGraphType: ConfigurableGraphType.Bar,
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

const formatTimeSeriesValues = (values: TimeSeriesDataItem[] | undefined) =>
    values?.map((value) => ({
        date: formatDate(value.dateTime),
        value: value.value,
    })) ?? []

export const useOverallTimeSeries = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const data = useStatsTimeSeries(
        query({
            filters,
            timezone,
            granularity,
        }),
    )

    return {
        data: formatTimeSeriesValues(data.data?.[0]),
        isLoading: data.isFetching,
    }
}

export const useAutomationTimeSeriesPerAutomationFeatureType = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const data = useStatsTimeSeriesPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['automationFeatureType'],
            granularity,
        }),
    )

    const chartData: MultipleTimeSeriesDataItem[] = data.data
        ? Object.entries(data.data)
              .filter(([metricName]) =>
                  Object.keys(MAP_AUTOMATION_FEATURE_NAME).includes(metricName),
              )
              .map(([metricName, values]) => ({
                  label: MAP_AUTOMATION_FEATURE_NAME[metricName],
                  values: formatTimeSeriesValues(values[0]),
              }))
        : []

    return {
        data: chartData,
        isLoading: data.isFetching,
    }
}

export const useAutomationTimeSeriesPerChannel = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const data = useStatsTimeSeriesPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['channel'],
            granularity,
        }),
    )

    const chartData: MultipleTimeSeriesDataItem[] = data.data
        ? Object.entries(data.data).map(([metricName, values]) => ({
              label: formatChannelName(metricName),
              values: formatTimeSeriesValues(values[0]),
          }))
        : []

    return {
        data: chartData,
        isLoading: data.isFetching,
    }
}

export const getLineChartDataHooks = (
    trendQuery: MetricQueryFactory,
    timeSeriesQuery: MetricQueryFactory,
    dimensions: LineAutomationDimension[],
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const dimensionConfigs: ConfigurableGraphGroupingConfig[] = dimensions.map(
        (dimensionId) => {
            switch (dimensionId) {
                case 'overall':
                    return {
                        id: 'overall',
                        name: 'Overall',
                        configurableGraphType: ConfigurableGraphType.TimeSeries,
                        useChartData: () =>
                            useOverallTimeSeries(
                                timeSeriesQuery,
                                filters,
                                timezone,
                                granularity,
                            ),
                    }
                case 'channel':
                    return {
                        id: dimensionId,
                        name: 'Channel',
                        configurableGraphType:
                            ConfigurableGraphType.MultipleTimeSeries,
                        useChartData: () =>
                            useAutomationTimeSeriesPerChannel(
                                timeSeriesQuery,
                                filters,
                                timezone,
                                granularity,
                            ),
                    }
                case 'automationFeatureType':
                    return {
                        id: dimensionId,
                        name: 'Feature',
                        configurableGraphType:
                            ConfigurableGraphType.MultipleTimeSeries,
                        useChartData: () =>
                            useAutomationTimeSeriesPerAutomationFeatureType(
                                timeSeriesQuery,
                                filters,
                                timezone,
                                granularity,
                            ),
                    }
            }
        },
    )

    return {
        useTrendData: () => getStatsTrendHook(trendQuery)(filters, timezone),
        dimensions: dimensionConfigs,
    }
}

export const getLineChartGraphConfig = (
    metrics: LineChartMetricConfig[],
    statsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
): ConfigurableGraphMetricConfig[] => {
    const tooltipPeriod = formatPreviousPeriod(statsFilters.period)

    return metrics.map((metric) => ({
        measure: metric.measure,
        name: metric.name,
        metricFormat: metric.metricFormat,
        interpretAs: metric.interpretAs,
        tooltipData: { period: tooltipPeriod },
        ...getLineChartDataHooks(
            metric.trendQueryFactory,
            metric.timeSeriesQueryFactory,
            metric.dimensions,
            statsFilters,
            userTimezone,
            granularity,
        ),
    }))
}
