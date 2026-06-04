import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

export const toChartData = (
    result: Pick<MetricWithDecile, 'data' | 'isFetching'>,
    formatName: (value: string) => string,
) => ({
    data:
        result.data?.allValues?.map((metricValue) => ({
            name: formatName(metricValue.dimension.toString()),
            value: metricValue.value,
        })) ?? [],
    isLoading: result.isFetching,
})

export const formatTimeSeriesDate = (
    dateTime: string,
    granularity?: ReportingGranularity,
) => {
    const formatType =
        granularity === ReportingGranularity.Hour
            ? DateTimeFormatType.SHORT_MONTH_DAY_WITH_TIME_AM_PM_EN_US
            : granularity === ReportingGranularity.Month
              ? DateTimeFormatType.MONTH_AND_YEAR_SHORT
              : DateTimeFormatType.SHORT_DATE_EN_US

    return moment(dateTime).format(DateTimeFormatMapper[formatType] as string)
}

const formatTimeSeriesValues = (
    values: TimeSeriesDataItem[] | undefined,
    granularity?: ReportingGranularity,
) =>
    values?.map((value) => ({
        date: formatTimeSeriesDate(value.dateTime, granularity),
        value: value.value,
    })) ?? []

export const toTimeSeriesData = (
    result: { data: TimeSeriesDataItem[][]; isFetching: boolean },
    granularity?: ReportingGranularity,
) => ({
    data: formatTimeSeriesValues(result.data?.[0], granularity),
    isLoading: result.isFetching,
})

export const toMultipleTimeSeriesData = (
    result: {
        data: Record<string, TimeSeriesDataItem[][]> | undefined
        isFetching: boolean
    },
    formatName: (value: string) => string,
    granularity?: ReportingGranularity,
) => ({
    data: Object.entries(result.data ?? {})
        .map(([dimensionValue, values]) => ({
            label: formatName(dimensionValue),
            values: formatTimeSeriesValues(values[0], granularity),
        }))
        .filter(({ values }) =>
            values.some((point) => point.value !== 0 && point.value !== null),
        ),
    isLoading: result.isFetching,
})

export const formatPeriod = (statsFilters: StatsFilters) => ({
    start_datetime: moment(statsFilters.period.start_datetime).format(
        DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US] as string,
    ),
    end_datetime: moment(statsFilters.period.end_datetime).format(
        DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US] as string,
    ),
})
