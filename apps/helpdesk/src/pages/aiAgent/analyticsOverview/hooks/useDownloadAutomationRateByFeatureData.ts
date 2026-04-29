import { useMemo } from 'react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { createCsv } from 'utils/file'

import { useAutomationRateByFeature } from './useAutomationRateByFeature'

const FILENAME = 'automation-rate-by-feature'

export const useDownloadAutomationRateByFeatureData = () => {
    const { data, isLoading } = useAutomationRateByFeature()
    const { statsFilters } = useAiAgentStatsFilters()

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            ['Feature', 'Automation rate (%)'],
            ...data.map((row) => [row.name, row.value?.toString() ?? 'N/A']),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(statsFilters.period, FILENAME)

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
