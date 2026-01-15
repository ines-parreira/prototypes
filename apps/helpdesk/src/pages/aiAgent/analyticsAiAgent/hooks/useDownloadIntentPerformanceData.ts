import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv } from 'utils/file'

import { useIntentPerformanceMetrics } from './useIntentPerformanceMetrics'

const FILENAME = 'intent-performance-breakdown'

export const useDownloadIntentPerformanceData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isLoading } = useIntentPerformanceMetrics(
        cleanStatsFilters,
        userTimezone,
    )

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        const sortedData = [...data].sort((a, b) =>
            b.intentL1.localeCompare(a.intentL1),
        )

        return [
            [
                'Intent L1',
                'Intent L2',
                'Handover interactions',
                'Snoozed interactions',
                'Success rate',
                'Cost saved',
            ],
            ...sortedData.map((row) => [
                row.intentL1,
                row.intentL2,
                formatMetricValue(row.handoverInteractions, 'decimal'),
                formatMetricValue(row.snoozedInteractions, 'decimal'),
                formatMetricValue(row.successRate, 'percent-precision-1'),
                formatMetricValue(row.costSaved, 'currency'),
            ]),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(cleanStatsFilters.period, FILENAME)

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
