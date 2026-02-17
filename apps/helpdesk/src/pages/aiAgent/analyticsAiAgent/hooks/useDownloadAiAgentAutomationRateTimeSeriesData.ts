import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import { createCsv } from '@repo/utils'
import moment from 'moment'

import { useAIAgentAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTimeSeriesData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { DATE_FORMAT } from '../../analyticsOverview/constants'

const FILENAME = 'automation-rate-timeseries'

export const useDownloadAiAgentAutomationRateTimeSeriesData = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data: timeSeriesData, isFetching } =
        useAIAgentAutomationRateTimeSeriesData(
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
