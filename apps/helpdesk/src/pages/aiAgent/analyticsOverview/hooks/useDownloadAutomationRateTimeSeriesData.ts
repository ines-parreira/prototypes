import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import moment from 'moment'

import { useAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv } from 'utils/file'

import { DATE_FORMAT } from '../constants'

const FILENAME = 'automation-rate-timeseries'

export const useDownloadAutomationRateTimeSeriesData = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data: timeSeriesData, isFetching } =
        useAutomationRateTimeSeriesData(
            cleanStatsFilters,
            userTimezone,
            granularity,
        )

    const csvData = useMemo(() => {
        const series = timeSeriesData?.[0]
        if (!series || series.length === 0) {
            return null
        }

        const hasNonZeroValue = series.some(
            (row) =>
                row.value !== null &&
                row.value !== undefined &&
                row.value !== 0,
        )
        if (!hasNonZeroValue) {
            return null
        }

        return [
            ['Date', 'Automation rate (%)'],
            ...series.map((row) => [
                moment(row.dateTime).format(DATE_FORMAT),
                formatMetricValue(
                    row.value !== null && row.value !== undefined
                        ? row.value * 100
                        : null,
                    'decimal-precision-1',
                ),
            ]),
        ]
    }, [timeSeriesData])

    const fileName = getCsvFileNameWithDates(cleanStatsFilters.period, FILENAME)

    const files = useMemo(() => {
        if (!csvData) {
            return {}
        }
        return { [fileName]: createCsv(csvData) }
    }, [csvData, fileName])

    return {
        files,
        fileName,
        isLoading: isFetching,
    }
}
