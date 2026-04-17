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

import { listStores } from '@gorgias/helpdesk-client'
import type { StoreIntegration } from '@gorgias/helpdesk-queries'
import { useListStores } from '@gorgias/helpdesk-queries'

import {
    buildBarCsvFiles,
    buildMultipleTimeSeriesCsvFiles,
    buildTimeSeriesCsvFiles,
} from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import {
    fetchStatsMetricPerDimension,
    mapMetricValues,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    fetchStatsTimeSeries,
    fetchStatsTimeSeriesPerDimension,
    useStatsTimeSeries,
    useStatsTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    AutomationFeatureType,
    AutomationSkillType,
} from 'domains/reporting/models/scopes/constants'
import type {
    BuiltQuery,
    Context,
    MetricQueryFactory,
} from 'domains/reporting/models/scopes/scope'
import type { DimensionName } from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

type AutomationDimension =
    | 'channel'
    | 'automationFeatureType'
    | 'storeIntegrationId'
    | 'engagementType'
    | 'aiAgentRole'
    | 'aiIntentCustomField'
type LineAutomationDimension = 'overall' | AutomationDimension

export type BarChartMetricConfig = {
    measure: string
    name: string
    metricFormat: MetricTrendFormat
    interpretAs: TrendDirection
    dimensions: AutomationDimension[]
    queryFactory(ctx: Context): BuiltQuery
    valueTransform?: (
        value: number | null,
        extra?: ExtraConfigProps,
    ) => number | null
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

export type ExtraConfigProps = {
    stores?: StoreIntegration[]
    costSavedPerInteraction?: number
}

export const MAP_ENGAGEMENT_TYPE_NAME: Record<string, string> = {
    search_bar: 'Search bar',
    ask_anything: 'Ask anything',
    suggested_product_question: 'Suggested product question',
    null: 'Unknown',
}

const MAP_AUTOMATION_FEATURE_NAME: Record<string, string> = {
    [AutomationFeatureType.AiAgent]: 'AI Agent',
    [AutomationFeatureType.Flows]: 'Flows',
    [AutomationFeatureType.OrderManagement]: 'Order Management',
    [AutomationFeatureType.ArticleRecommendation]: 'Article Recommendation',
}

const MAP_AI_AGENT_ROLE_NAME: Record<string, string> = {
    [AutomationSkillType.AiAgentSupport]: 'Support Agent',
    [AutomationSkillType.AiAgentSales]: 'Shopping Assistant',
}

export const formatChannelName = (channel: string): string => {
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

const formatStoreName = (storeId: string, stores?: StoreIntegration[]) => {
    if (storeId === 'null' || !storeId) {
        return 'No store'
    }
    const store = stores?.find(
        (store) => store.store_integration_id.toString() === storeId.toString(),
    )
    return store?.name ?? `Store ${storeId}`
}

const formatDimensionName = (dimension: string) => {
    switch (dimension) {
        case 'overall':
            return 'Overall'
        case 'channel':
            return 'Channel'
        case 'storeIntegrationId':
            return 'Store'
        case 'automationFeatureType':
            return 'Feature'
        case 'engagementType':
            return 'Engagement type'
        case 'aiAgentRole':
            return 'Role'
        case 'aiIntentCustomField':
            return 'Intent'
        default:
            return dimension
    }
}

const formatDate = (date: string, granularity?: ReportingGranularity) => {
    const formatType =
        granularity === ReportingGranularity.Hour
            ? DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_US
            : granularity === ReportingGranularity.Month
              ? DateTimeFormatType.MONTH_AND_YEAR_SHORT
              : DateTimeFormatType.SHORT_DATE_EN_US
    return moment(date).format(DateTimeFormatMapper[formatType] as string)
}

const formatBarChartData = (
    data: MetricWithDecile | undefined | null,
    dimension: AutomationDimension,
    extra?: ExtraConfigProps,
) => {
    switch (dimension) {
        case 'channel':
            return {
                data:
                    data?.data?.allValues?.map((metricValue) => ({
                        name: formatChannelName(
                            metricValue.dimension.toString(),
                        ),
                        value: metricValue.value,
                    })) ?? [],
                isLoading: !!data?.isFetching,
            }
        case 'automationFeatureType':
            return {
                data:
                    data?.data?.allValues
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
                isLoading: !!data?.isFetching,
            }
        case 'engagementType':
            return {
                data:
                    data?.data?.allValues?.map((metricValue) => {
                        const key = !metricValue.dimension
                            ? 'null'
                            : metricValue.dimension.toString()
                        return {
                            name: MAP_ENGAGEMENT_TYPE_NAME[key] ?? 'Unknown',
                            value: metricValue.value,
                        }
                    }) ?? [],
                isLoading: !!data?.isFetching,
            }
        case 'storeIntegrationId':
            return {
                data:
                    data?.data?.allValues?.map((metricValue) => ({
                        name: formatStoreName(
                            metricValue.dimension.toString(),
                            extra?.stores,
                        ),
                        value: metricValue.value,
                    })) ?? [],
                isLoading: !!data?.isFetching,
            }
        case 'aiAgentRole':
            return {
                data:
                    data?.data?.allValues?.map((metricValue) => ({
                        name: MAP_AI_AGENT_ROLE_NAME[
                            metricValue.dimension.toString()
                        ],
                        value: metricValue.value,
                    })) ?? [],
                isLoading: !!data?.isFetching,
            }
        case 'aiIntentCustomField':
            return {
                data:
                    data?.data?.allValues?.map((metricValue) => ({
                        name: metricValue.dimension
                            .toString()
                            .replaceAll('::', '/'),
                        value: metricValue.value,
                    })) ?? [],
                isLoading: !!data?.isFetching,
            }
        default:
            return {
                data:
                    data?.data?.allValues?.map((metricValue) => ({
                        name: metricValue.dimension.toString(),
                        value: metricValue.value,
                    })) ?? [],
                isLoading: !!data?.isFetching,
            }
    }
}

export const useStoreIntegrations = (): StoreIntegration[] => {
    const { data: stores } = useListStores(undefined, {
        query: {
            select: (data) => data?.data?.data ?? [],
            cacheTime: 1000 * 60 * 60, // 1H
        },
    })

    return stores ?? []
}

export const useAutomationMetricPerAutomationFeatureType = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    valueTransform?: (
        value: number | null,
        extra?: ExtraConfigProps,
    ) => number | null,
    extra?: ExtraConfigProps,
) => {
    const data = useStatsMetricPerDimension(
        query({ filters, timezone, dimensions: ['automationFeatureType'] }),
        'automationFeatureType',
    )

    return formatBarChartData(
        valueTransform
            ? mapMetricValues(data, (v) => valueTransform(v, extra))
            : data,
        'automationFeatureType',
    )
}

export const useAutomationMetricPerEngagementType = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
) => {
    const data = useStatsMetricPerDimension(
        query({ filters, timezone, dimensions: ['engagementType'] }),
        'engagementType',
    )

    return formatBarChartData(data, 'engagementType')
}

export const useAutomationMetricPerChannel = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    valueTransform?: (
        value: number | null,
        extra?: ExtraConfigProps,
    ) => number | null,
    extra?: ExtraConfigProps,
) => {
    const data = useStatsMetricPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['channel'],
        }),
        'channel',
    )

    return formatBarChartData(
        valueTransform
            ? mapMetricValues(data, (v) => valueTransform(v, extra))
            : data,
        'channel',
    )
}

export const useAutomationMetricPerStoreIntegrationId = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    extra?: ExtraConfigProps,
    valueTransform?: (
        value: number | null,
        extra?: ExtraConfigProps,
    ) => number | null,
) => {
    const data = useStatsMetricPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['storeIntegrationId'],
        }),
        'storeIntegrationId',
    )

    return formatBarChartData(
        valueTransform
            ? mapMetricValues(data, (v) => valueTransform(v, extra))
            : data,
        'storeIntegrationId',
        extra,
    )
}

export const useAutomationMetricPerAiAgentRole = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
) => {
    const data = useStatsMetricPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['aiAgentRole'],
        }),
        'aiAgentRole',
    )

    return formatBarChartData(data, 'aiAgentRole')
}

export const useAutomationMetricPerAiIntentCustomField = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
) => {
    const data = useStatsMetricPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['aiIntentCustomField'],
        }),
        'aiIntentCustomField',
    )

    return formatBarChartData(data, 'aiIntentCustomField')
}

export const getBarChartDataHooks = (
    query: MetricQueryFactory,
    dimensions: AutomationDimension[],
    filters: StatsFilters,
    timezone: string,
    period?: { start_datetime: string; end_datetime: string },
    extra?: ExtraConfigProps,
    valueTransform?: (
        value: number | null,
        extra?: ExtraConfigProps,
    ) => number | null,
) => {
    const dimensionConfigs: ConfigurableGraphGroupingConfig[] = dimensions.map(
        (dimensionId) => {
            switch (dimensionId) {
                case 'channel':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType: ConfigurableGraphType.Bar,
                        useChartData: () =>
                            useAutomationMetricPerChannel(
                                query,
                                filters,
                                timezone,
                                valueTransform,
                                extra,
                            ),
                        period,
                    }
                case 'automationFeatureType':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType: ConfigurableGraphType.Bar,
                        useChartData: () =>
                            useAutomationMetricPerAutomationFeatureType(
                                query,
                                filters,
                                timezone,
                                valueTransform,
                                extra,
                            ),
                        period,
                    }
                case 'storeIntegrationId':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType: ConfigurableGraphType.Bar,
                        useChartData: () =>
                            useAutomationMetricPerStoreIntegrationId(
                                query,
                                filters,
                                timezone,
                                extra,
                                valueTransform,
                            ),
                        period,
                    }
                case 'engagementType':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType: ConfigurableGraphType.Bar,
                        useChartData: () =>
                            useAutomationMetricPerEngagementType(
                                query,
                                filters,
                                timezone,
                            ),
                        period,
                    }
                case 'aiAgentRole':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType: ConfigurableGraphType.Bar,
                        useChartData: () =>
                            useAutomationMetricPerAiAgentRole(
                                query,
                                filters,
                                timezone,
                            ),
                        period,
                    }
                case 'aiIntentCustomField':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType:
                            ConfigurableGraphType.HorizontalBar,
                        initialItemsCount: 5,
                        showExpandButton: true,
                        useChartData: () =>
                            useAutomationMetricPerAiIntentCustomField(
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
        useTrendData: () => {
            const trendResult = getStatsTrendHook(query)(filters, timezone)
            if (!valueTransform || !trendResult.data) return trendResult
            return {
                ...trendResult,
                data: {
                    value: valueTransform(trendResult.data.value, extra),
                    prevValue: valueTransform(
                        trendResult.data.prevValue,
                        extra,
                    ),
                },
            }
        },
        dimensions: dimensionConfigs,
    }
}

export const getBarChartGraphConfig = (
    metrics: BarChartMetricConfig[],
    statsFilters: StatsFilters,
    userTimezone: string,
    extra?: ExtraConfigProps,
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
            extra,
            metric.valueTransform,
        ),
    }))
}

const formatTimeSeriesValues = (
    values: TimeSeriesDataItem[] | undefined,
    granularity?: ReportingGranularity,
) =>
    values?.map((value) => ({
        date: formatDate(value.dateTime, granularity),
        value: value.value,
    })) ?? []

export const useOverallTimeSeries = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    valueTransform?: (value: number | null) => number | null,
) => {
    const data = useStatsTimeSeries(
        query({
            filters,
            timezone,
            granularity,
        }),
    )

    const values = formatTimeSeriesValues(data.data?.[0], granularity)
    return {
        data: valueTransform
            ? values.map((item) => ({
                  ...item,
                  value: valueTransform(item.value),
              }))
            : values,
        isLoading: data.isFetching,
    }
}

const formatMultiTimeSeriesData = (
    data: Record<string, TimeSeriesDataItem[][]> | undefined,
    dimension: AutomationDimension,
    extra?: ExtraConfigProps,
    granularity?: ReportingGranularity,
): MultipleTimeSeriesDataItem[] => {
    const series = ((): MultipleTimeSeriesDataItem[] => {
        switch (dimension) {
            case 'automationFeatureType':
                return data
                    ? Object.entries(data)
                          .filter(([metricName]) =>
                              Object.keys(MAP_AUTOMATION_FEATURE_NAME).includes(
                                  metricName,
                              ),
                          )
                          .map(([metricName, values]) => ({
                              label: MAP_AUTOMATION_FEATURE_NAME[metricName],
                              values: formatTimeSeriesValues(
                                  values[0],
                                  granularity,
                              ),
                          }))
                    : []
            case 'channel':
                return data
                    ? Object.entries(data).map(([metricName, values]) => ({
                          label: formatChannelName(metricName),
                          values: formatTimeSeriesValues(
                              values[0],
                              granularity,
                          ),
                      }))
                    : []
            case 'engagementType':
                return data
                    ? Object.entries(data).map(([metricName, values]) => ({
                          label:
                              MAP_ENGAGEMENT_TYPE_NAME[metricName] ??
                              metricName,
                          values: formatTimeSeriesValues(
                              values[0],
                              granularity,
                          ),
                      }))
                    : []
            case 'storeIntegrationId':
                return data
                    ? Object.entries(data).map(([metricName, values]) => ({
                          label: formatStoreName(metricName, extra?.stores),
                          values: formatTimeSeriesValues(
                              values[0],
                              granularity,
                          ),
                      }))
                    : []
            case 'aiAgentRole':
                return data
                    ? Object.entries(data).map(([metricName, values]) => ({
                          label: MAP_AI_AGENT_ROLE_NAME[metricName],
                          values: formatTimeSeriesValues(
                              values[0],
                              granularity,
                          ),
                      }))
                    : []
            case 'aiIntentCustomField':
                return data
                    ? Object.entries(data).map(([metricName, values]) => ({
                          label: metricName.replaceAll('::', '/'),
                          values: formatTimeSeriesValues(
                              values[0],
                              granularity,
                          ),
                      }))
                    : []
            default:
                return data
                    ? Object.entries(data).map(([metricName, values]) => ({
                          label: metricName,
                          values: formatTimeSeriesValues(
                              values[0],
                              granularity,
                          ),
                      }))
                    : []
        }
    })()

    return series.filter(({ values }) =>
        values.some((v) => v.value !== 0 && v.value !== null),
    )
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

    return {
        data: formatMultiTimeSeriesData(
            data.data,
            'automationFeatureType',
            undefined,
            granularity,
        ),
        isLoading: data.isFetching,
    }
}

export const useAutomationTimeSeriesPerEngagementType = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const data = useStatsTimeSeriesPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['engagementType'],
            granularity,
        }),
    )

    return {
        data: formatMultiTimeSeriesData(
            data.data,
            'engagementType',
            undefined,
            granularity,
        ),
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

    return {
        data: formatMultiTimeSeriesData(
            data.data,
            'channel',
            undefined,
            granularity,
        ),
        isLoading: data.isFetching,
    }
}

export const useAutomationTimeSeriesPerStoreIntegrationId = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    extra?: ExtraConfigProps,
) => {
    const data = useStatsTimeSeriesPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['storeIntegrationId'],
            granularity,
        }),
    )

    return {
        data: formatMultiTimeSeriesData(
            data.data,
            'storeIntegrationId',
            extra,
            granularity,
        ),
        isLoading: data.isFetching,
    }
}

export const useAutomationTimeSeriesPerAiAgentRole = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const data = useStatsTimeSeriesPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['aiAgentRole'],
            granularity,
        }),
    )

    return {
        data: formatMultiTimeSeriesData(
            data.data,
            'aiAgentRole',
            undefined,
            granularity,
        ),
        isLoading: data.isFetching,
    }
}

export const useAutomationTimeSeriesPerAiIntentCustomField = (
    query: MetricQueryFactory,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const data = useStatsTimeSeriesPerDimension(
        query({
            filters,
            timezone,
            dimensions: ['aiIntentCustomField'],
            granularity,
        }),
    )

    return {
        data: formatMultiTimeSeriesData(
            data.data,
            'aiIntentCustomField',
            undefined,
            granularity,
        ),
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
    extra?: ExtraConfigProps,
) => {
    const dimensionConfigs: ConfigurableGraphGroupingConfig[] = dimensions.map(
        (dimensionId) => {
            switch (dimensionId) {
                case 'overall':
                    return {
                        id: 'overall',
                        name: formatDimensionName(dimensionId),
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
                        name: formatDimensionName(dimensionId),
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
                        name: formatDimensionName(dimensionId),
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
                case 'engagementType':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType:
                            ConfigurableGraphType.MultipleTimeSeries,
                        useChartData: () =>
                            useAutomationTimeSeriesPerEngagementType(
                                timeSeriesQuery,
                                filters,
                                timezone,
                                granularity,
                            ),
                    }
                case 'storeIntegrationId':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType:
                            ConfigurableGraphType.MultipleTimeSeries,
                        useChartData: () =>
                            useAutomationTimeSeriesPerStoreIntegrationId(
                                timeSeriesQuery,
                                filters,
                                timezone,
                                granularity,
                                extra,
                            ),
                    }
                case 'aiAgentRole':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType:
                            ConfigurableGraphType.MultipleTimeSeries,
                        useChartData: () =>
                            useAutomationTimeSeriesPerAiAgentRole(
                                timeSeriesQuery,
                                filters,
                                timezone,
                                granularity,
                            ),
                    }
                case 'aiIntentCustomField':
                    return {
                        id: dimensionId,
                        name: formatDimensionName(dimensionId),
                        configurableGraphType:
                            ConfigurableGraphType.MultipleTimeSeries,
                        useChartData: () =>
                            useAutomationTimeSeriesPerAiIntentCustomField(
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
    extra?: ExtraConfigProps,
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
            extra,
        ),
    }))
}

export const fetchExtraConfig = async (
    dimension: string,
    outerExtra?: ExtraConfigProps,
): Promise<ExtraConfigProps> => {
    let stores: StoreIntegration[] = []
    if (dimension === 'storeIntegrationId') {
        const { data } = await listStores()
        stores = data?.data
    }

    return {
        ...outerExtra,
        stores,
    }
}

export const fetchConfigurableBarChartDownloadData =
    (metrics: BarChartMetricConfig[]) =>
    async (
        savedMeasure: string | null | undefined,
        savedDimension: string | null | undefined,
        filters: StatsFilters,
        timezone: string,
        __: ReportingGranularity,
        outerExtra?: Record<string, number>,
    ) => {
        const metric =
            metrics.find((m) => m.measure === savedMeasure) ?? metrics[0]
        const dimension = savedDimension ?? metric.dimensions[0]

        const response = await fetchStatsMetricPerDimension(
            metric.queryFactory({
                filters,
                timezone,
                dimensions: [dimension as AutomationDimension],
            }),
            dimension as AutomationDimension,
        )

        const extra = await fetchExtraConfig(dimension, {
            costSavedPerInteraction: outerExtra?.costSavedPerInteraction,
        })

        const { valueTransform } = metric
        const transformedResponse = valueTransform
            ? mapMetricValues(response, (v) => valueTransform(v, extra))
            : response
        const { data } = formatBarChartData(
            transformedResponse,
            dimension as AutomationDimension,
            extra,
        )

        return {
            files: buildBarCsvFiles(
                data,
                metric.name,
                formatDimensionName(dimension),
                metric.metricFormat,
                filters.period,
            ),
        }
    }

export const fetchConfigurableLineChartDownloadData =
    (metrics: LineChartMetricConfig[]) =>
    async (
        savedMeasure: string | null | undefined,
        savedDimension: string | null | undefined,
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity,
    ) => {
        const metric =
            metrics.find((m) => m.measure === savedMeasure) ?? metrics[0]
        const dimension = savedDimension ?? metric.dimensions[0]

        if (dimension === 'overall') {
            const data = await fetchStatsTimeSeries(
                metric.timeSeriesQueryFactory({
                    filters,
                    timezone,
                    granularity,
                }),
            )
            return {
                files: buildTimeSeriesCsvFiles(
                    formatTimeSeriesValues(data[0], granularity),
                    metric.name,
                    metric.metricFormat,
                    filters.period,
                ),
            }
        }

        const query = metric.timeSeriesQueryFactory({
            filters,
            timezone,
            granularity,
            dimensions: [dimension as DimensionName],
        })
        const data = await fetchStatsTimeSeriesPerDimension(query)
        const extra = await fetchExtraConfig(dimension)
        const labeledData = formatMultiTimeSeriesData(
            data,
            dimension as AutomationDimension,
            extra,
            granularity,
        )
        return {
            files: buildMultipleTimeSeriesCsvFiles(
                labeledData,
                metric.name,
                metric.metricFormat,
                filters.period,
            ),
        }
    }
