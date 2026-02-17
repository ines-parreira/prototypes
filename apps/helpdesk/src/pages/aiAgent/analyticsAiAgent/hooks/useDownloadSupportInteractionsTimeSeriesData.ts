import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import { createCsv } from '@repo/utils'
import moment from 'moment'

import { useAiAgentSupportInteractionsTimeSeriesData } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { DATE_FORMAT } from 'pages/aiAgent/analyticsOverview/constants'

const FILE_NAME = 'support-interactions-timeseries'

export const useDownloadSupportInteractionsTimeSeriesData = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data: timeSeriesData, isFetching } =
        useAiAgentSupportInteractionsTimeSeriesData(
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

        const rows: string[][] = [['date', 'support_interactions']]

        series.forEach((item) => {
            const dateStr = moment(item.dateTime).format(DATE_FORMAT)
            const formattedValue = formatMetricValue(item.value, 'integer')
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
