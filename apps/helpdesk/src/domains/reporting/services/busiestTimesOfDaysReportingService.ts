import { createCsv } from '@repo/utils'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { TimeSeriesHook } from 'domains/reporting/hooks/useTimeSeries'
import type { Period, StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import {
    DayOfWeek,
    HOUR_COLUMN,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { useAggregatedBusiestTimesOfDayData } from 'domains/reporting/pages/support-performance/busiest-times-of-days/useAggregatedBusiestTimesOfDayData'
import type { BTODData } from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import {
    get24Hours,
    getAggregatedBusiestTimesOfDayData,
    getMetricFetch,
    hourFromHourIndex,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'

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
