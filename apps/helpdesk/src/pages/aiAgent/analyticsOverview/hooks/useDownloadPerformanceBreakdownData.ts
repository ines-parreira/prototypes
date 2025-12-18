import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv } from 'utils/file'

import { usePerformanceMetricsPerFeature } from './usePerformanceMetricsPerFeature'

const PERFORMANCE_BREAKDOWN_FILENAME = 'performance-breakdown'

export const useDownloadPerformanceBreakdownData = () => {
    const { data, isLoading } = usePerformanceMetricsPerFeature()
    const { cleanStatsFilters } = useStatsFilters()

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            [
                'Feature',
                'Overall automation rate',
                'Automated interactions',
                'Handover interactions',
                'Cost saved',
                'Time saved by agents',
            ],
            ...data.map((row) => [
                row.feature,
                formatMetricValue(row.automationRate, 'percent-precision-1'),
                formatMetricValue(row.automatedInteractions, 'decimal'),
                formatMetricValue(row.handoverCount, 'decimal'),
                formatMetricValue(row.costSaved, 'currency-precision-1'),
                formatMetricValue(row.timeSaved, 'duration'),
            ]),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        PERFORMANCE_BREAKDOWN_FILENAME,
    )

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
