import { useMemo } from 'react'

import { createCsv } from '@repo/utils'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useAutomationRateByFeature } from './useAutomationRateByFeature'

const FILENAME = 'automation-rate-by-feature'

export const useDownloadAutomationRateByFeatureData = () => {
    const { data, isLoading } = useAutomationRateByFeature()
    const { cleanStatsFilters } = useStatsFilters()

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            ['Feature', 'Automation rate (%)'],
            ...data.map((row) => [row.name, row.value?.toString() ?? 'N/A']),
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
