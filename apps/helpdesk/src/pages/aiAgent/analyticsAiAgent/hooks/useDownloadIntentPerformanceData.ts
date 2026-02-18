import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { createCsv } from 'utils/file'

import { useIntentPerformanceMetrics } from './useIntentPerformanceMetrics'

const INTENT_PERFORMANCE_FILENAME = 'ai-agent-intent-performance'

export const useDownloadIntentPerformanceData = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data, loadingStates } = useIntentPerformanceMetrics(
        statsFilters,
        userTimezone,
    )

    const isLoading = Object.values(loadingStates).some((state) => state)

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            [
                'Intent L1',
                'Intent L2',
                'Handover interactions',
                'Snoozed interactions',
                'Success rate',
                'Cost saved',
            ],
            ...data.map((row) => [
                row.intentL1,
                row.intentL2,
                formatMetricValue(row.handoverInteractions, 'decimal'),
                formatMetricValue(row.snoozedInteractions, 'decimal'),
                formatMetricValue(row.successRate, 'percent-precision-1'),
                formatMetricValue(row.costSaved, 'currency'),
            ]),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        INTENT_PERFORMANCE_FILENAME,
    )

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
