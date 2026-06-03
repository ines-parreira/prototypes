import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

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

export const formatPeriod = (statsFilters: StatsFilters) => ({
    start_datetime: moment(statsFilters.period.start_datetime).format(
        DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US] as string,
    ),
    end_datetime: moment(statsFilters.period.end_datetime).format(
        DateTimeFormatMapper[DateTimeFormatType.SHORT_DATE_EN_US] as string,
    ),
})
