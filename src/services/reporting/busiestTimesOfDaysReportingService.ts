import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { Period, StatsFilters } from 'models/stat/types'
import {
    BusiestTimeOfDaysMetrics,
    DayOfWeek,
    HOUR_COLUMN,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import { useAggregatedBusiestTimesOfDayData } from 'pages/stats/support-performance/busiest-times-of-days/useAggregatedBusiestTimesOfDayData'
import {
    BTODData,
    get24Hours,
    getAggregatedBusiestTimesOfDayData,
    getMetricFetch,
    hourFromHourIndex,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import { createCsv } from 'utils/file'

const turnIntoArray = (data: BTODData): unknown[][] => {
    const daysOfWeek: DayOfWeek[] = Object.values(DayOfWeek)
    const hours = get24Hours()
    const columnLabels = [HOUR_COLUMN, ...daysOfWeek]

    const resultData = hours.map((hour) => [
        hourFromHourIndex(hour),
        ...daysOfWeek.map((day) => data[hour][day]),
    ])

    return [[...columnLabels], ...resultData]
}

export const BTOD_REPORT_FILENAME = 'busiest-times-of-days'

export const createReport = (data: BTODData, period: Period) => {
    const btodData = turnIntoArray(data)
    const fileName = getCsvFileNameWithDates(period, BTOD_REPORT_FILENAME)

    return {
        files: {
            [fileName]: createCsv(btodData),
        },
        fileName,
    }
}

export const useAggregatedBusiestTimesOfDayReportData = (
    useMetricQuery: TimeSeriesHook,
) => {
    const { btodData, period, isLoading } =
        useAggregatedBusiestTimesOfDayData(useMetricQuery)

    return { ...createReport(btodData, period), isLoading }
}

export const fetchAggregatedBusiestTimesOfDayReportData = async (
    statsFilters: StatsFilters,
    timezone: string,
    _: ReportingGranularity,
    context: {
        selectedBTODMetric: BusiestTimeOfDaysMetrics
    },
) => {
    const fetchQuery = getMetricFetch(context.selectedBTODMetric)

    return fetchQuery(statsFilters, timezone, ReportingGranularity.Hour)
        .then((result) => ({
            ...createReport(
                getAggregatedBusiestTimesOfDayData(result, timezone).btodData,
                statsFilters.period,
            ),
            isLoading: false,
        }))
        .catch(() => ({
            files: {},
            fileName: '',
            isLoading: false,
            isError: true,
        }))
}
