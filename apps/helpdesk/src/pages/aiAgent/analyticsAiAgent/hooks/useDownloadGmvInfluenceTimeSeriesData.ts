import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import { createCsv } from '@repo/utils'
import moment from 'moment'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useGmvInfluenceOverTimeSeries } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import { DATE_FORMAT } from 'pages/aiAgent/analyticsOverview/constants'

const FILE_NAME = 'total-sales-timeseries'

export const useDownloadGmvInfluenceTimeSeriesData = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data: timeSeriesData, isFetching } = useGmvInfluenceOverTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    const csvData = useMemo(() => {
        if (!timeSeriesData || !timeSeriesData[0]) {
            return null
        }

        const series = timeSeriesData[0]

        const hasNonZeroValue = series.some(
            (item) =>
                item.value !== null &&
                item.value !== undefined &&
                item.value !== 0,
        )
        if (!hasNonZeroValue) {
            return null
        }

        const rows: string[][] = [['date', 'total_sales']]

        series.forEach((item) => {
            const dateStr = moment(item.dateTime).format(DATE_FORMAT)
            const formattedValue = formatMetricValue(item.value, 'currency')
            rows.push([dateStr, formattedValue])
        })

        return createCsv(rows)
    }, [timeSeriesData])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        FILE_NAME,
    )

    const files = useMemo(() => {
        if (!csvData) {
            return {}
        }
        return { [fileName]: csvData }
    }, [csvData, fileName])

    return {
        files,
        isLoading: isFetching,
    }
}
